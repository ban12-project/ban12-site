"""Apply mechanical migration edits to this preparation branch only.

Temporary implementation helper; removed before opening the content PR.
"""
import json
from pathlib import Path
import re
import subprocess

APP = Path('apps/two-weeks-in-china')
DB_PACKAGES = {'@neondatabase/serverless', 'drizzle-orm', 'drizzle-kit'}
IMPORTS = {
    '#/lib/db/queries': '#/lib/content/queries',
    '#/lib/db/schema/countries': '#/lib/content/types',
    '#/lib/db/schema/pages': '#/lib/content/types',
    '#/lib/db/schema': '#/lib/content/types',
    '../db/queries': '../content/queries',
    '../db/schema/countries': '../content/types',
}
SCRIPTS = {
    'content:compile': 'tsc -p tsconfig.content-tools.json',
    'test:content': 'pnpm content:compile && node --test .content-tools/tests/content.test.js',
    'content:check': 'pnpm content:compile && node .content-tools/scripts/content/check.js',
    'content:export': 'pnpm content:compile && node .content-tools/scripts/content/export.js',
    'content:import': 'pnpm content:compile && node .content-tools/scripts/content/import.js',
    'content:verify-export': 'pnpm content:compile && node .content-tools/scripts/content/verify.js',
}


def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


def update_lockfile(source):
    lines = source.splitlines(keepends=True)
    start = lines.index('  apps/two-weeks-in-china:\n')
    end = next((i for i in range(start + 1, len(lines)) if re.match(r'^\S|^  \S', lines[i])), len(lines))
    block = lines[start:end]
    result = []
    removed = set()
    i = 0
    while i < len(block):
        match = re.match(r"^      ['\"]?([^'\"\n]+?)['\"]?:\s*$", block[i])
        if match and match.group(1) in DB_PACKAGES:
            removed.add(match.group(1))
            i += 1
            while i < len(block) and (block[i].startswith('        ') or not block[i].strip()):
                i += 1
            continue
        result.append(block[i])
        i += 1
    if removed != DB_PACKAGES:
        raise ValueError('Unexpected lockfile importer; refusing partial dependency removal')
    return ''.join(lines[:start] + result + lines[end:])


def main():
    if subprocess.check_output(['git', 'status', '--porcelain'], text=True).strip():
        raise ValueError('Preparation requires a clean checkout')
    branch = subprocess.check_output(['git', 'branch', '--show-current'], text=True).strip()
    if branch != 'codex/two-weeks-markdown-no-database':
        raise ValueError('Refusing to operate on a different branch')
    package_file = APP / 'package.json'
    package = json.loads(package_file.read_text())
    if package.get('name') != 'two-weeks-in-china' or package['scripts'].get('build') != 'next build':
        raise ValueError('Unexpected package baseline')
    if 'content:import' in package['scripts']:
        raise ValueError('Migration has already been applied')
    for group in ('dependencies', 'devDependencies'):
        for name in DB_PACKAGES:
            package.get(group, {}).pop(name, None)
    package['scripts'] = {key: value for key, value in package['scripts'].items() if not key.startswith('db:')}
    package['scripts'].update(SCRIPTS)
    package['scripts']['build'] = 'pnpm content:check && next build'
    changes = {package_file: json_bytes(package)}
    lock = Path('pnpm-lock.yaml')
    changes[lock] = update_lockfile(lock.read_text()).encode()
    tracked = subprocess.check_output(['git', 'ls-files', '-z', '--', str(APP)], text=True).split('\0')
    for name in filter(None, tracked):
        path = Path(name)
        if name.startswith(str(APP / 'lib/db') + '/') or path == APP / 'drizzle.config.ts':
            changes[path] = None
        elif path.suffix in ('.ts', '.tsx'):
            text = path.read_text()
            updated = text
            for old, new in IMPORTS.items():
                updated = updated.replace(old, new)
            if updated != text:
                changes[path] = updated.encode()
    turbo_file = Path('turbo.json')
    turbo = json.loads(turbo_file.read_text())
    task = turbo['tasks'].get('two-weeks-in-china#build')
    if task:
        task['env'] = [key for key in task.get('env', []) if key not in ('DATABASE_URL', 'DIRECT_URL')]
        if not task['env']:
            del task['env']
    changes[turbo_file] = json_bytes(turbo)
    config_file = APP / 'tsconfig.json'
    config = json.loads(config_file.read_text())
    if '.content-tools' not in config.setdefault('exclude', []):
        config['exclude'].append('.content-tools')
    changes[config_file] = json_bytes(config)
    ignore = APP / '.gitignore'
    changes[ignore] = (ignore.read_text().rstrip() + '\n\n# Local content tooling and raw migration exports\n'
        '.content-tools/\n.content-import-*/\n*content-export*.json\n').encode()
    agents_file = Path('AGENTS.md')
    agents = agents_file.read_text()
    replacements = {
        'two-weeks-in-china/  # Next.js app with Drizzle/Postgres':
            'two-weeks-in-china/  # Next.js app with repository Markdown/MDX and JSON',
        '`apps/two-weeks-in-china`: Next.js app with MDX and Drizzle/Postgres.':
            '`apps/two-weeks-in-china`: Next.js app with repository Markdown/MDX and JSON; no runtime database.',
        'Drizzle is used in `apps/web`, `apps/shortcuts`, and `apps/two-weeks-in-china`.':
            'Drizzle is used in `apps/web` and `apps/shortcuts`. `two-weeks-in-china` uses repository files.',
        'pnpm --filter two-weeks-in-china db:studio':
            'pnpm --filter two-weeks-in-china content:check',
    }
    for old, new in replacements.items():
        if old not in agents:
            raise ValueError('Root guidance changed; manual review required')
        agents = agents.replace(old, new)
    changes[agents_file] = agents.encode()
    for name in filter(None, tracked):
        path = Path(name)
        data = changes.get(path, path.read_bytes())
        if data is not None and path.suffix in ('.ts', '.tsx'):
            if re.search(rb"(?:lib/db|\.\./db/|from ['\"](?:drizzle|@neondatabase))", data):
                raise ValueError(f'Unconverted database reference: {path}')
    for path, data in changes.items():
        if data is None:
            path.unlink()
        else:
            path.write_bytes(data)
    print(f'Applied {len(changes)} scoped file changes; no database connection was used.')


if __name__ == '__main__':
    main()
