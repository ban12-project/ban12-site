---
title: "自动化部署 Next.js"
excerpt: '使用 Github Actions 构建 Next.js 项目，并上传至你自己的 VPS'
coverImage: 'https://assets.ban12.com/blog/self-hosted-nextjs-with-github-actions/actions-hero.svg'
date: '2024-06-05T01:39:53.723Z'
author:
  name: Coda
  picture: 'https://avatars.githubusercontent.com/u/23135654?v=4'
ogImage:
  url: 'https://assets.ban12.com/blog/self-hosted-nextjs-with-github-actions/actions-hero.svg'
---

# 目标 🎯

- [准备 Github Actions 环境](#准备-github-actions-环境)
- [处理私有的 .env.local 环境变量](#处理私有的-envlocal-环境变量)
- [压缩构建好的文件](#压缩构建好的文件)
- [授权 Github Actions SCP/SSH 访问 VPS](#授权-github-actions-scpssh-访问-vps)
- [SCP 上传文件到 VPS](#scp-上传文件到-vps)
- [使用 SSH 连接到VPS，更新 git、解压文件、重启 pm2 服务](#使用-ssh-连接到vps更新-git解压文件重启-pm2-服务)
- [完整配置文件](#完整配置文件)

## 所有 Secrets Variables

| type     | name             | value description                                                                                     |
| -------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| secret   | ENV_LOCAL        | .env.local 私有环境变量                                                                               |
| secret   | SSH_PRIVATE_KEY  | ssh 私钥                                                                                              |
| secret   | VPS_HOST         | VPS IP                                                                                                |
| secret   | VPS_USER         | VPS User                                                                                              |
| secret   | ~~TURBO_TOKEN~~  | turborepo token 发现使用 turborepo remote cache 后，命中缓存不会生成 .next 构建产物所以这个目前没有用 |
| variable | ROOT_PATH        | 项目相对于项目根的子目录，我使用的 nomorepo 所以有这个 path, 如果你没有可以自行调整                   |
| variable | VPS_PROJECT_PATH | VPS 上项目根路径                                                                                      |
| variable | ~~TURBO_TEAM~~   | turbo team name                                                                                       |

注意要确保每一步执行 shell 当前路径正确、Github Actions 每一个 step 都会重置到项目根路径

如果在 SSH EOF 中的 Shell 提示 `xxx: command not found`, 检查是否是 nvm 或者 fnm 安装的 nodejs。尝试在 SSH EOF 后面紧跟 `source ~/.bashrc` or `source ~/.nvm/nvm.sh`。如果还是不行建议不使用包管理器安装 nodejs 会得到解决的。 fnm 安装的 nodejs 截止 `fnm@v1.37.0` `ubuntu 20` `bash` 我无论如何都没找到解决办法, 作罢 😊, 放弃了包管理器安装 nodejs

```bash
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << 'EOF'
  source ~/.bashrc
  source ~/.nvm/nvm.sh

  # ...
EOF
```

## 准备 Github Actions 环境

```yml
# 迁出仓库代码，fetch-depth: 2 获取最近两次 commit 可以是0 表示获取所有记录 tag 分支
- name: Check out code
  uses: actions/checkout@v4
  with:
    fetch-depth: 2

# 我项目使用的 pnpm
- uses: pnpm/action-setup@v4
  with:
    version: latest

# nodejs 环境
- name: Setup Node.js environment
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'pnpm'

# 安装依赖
- name: Install dependencies
  run: pnpm install
```

## 处理私有的 .env.local 环境变量

项目构建时候会使用私有的 `secret` 这个文件应该会被 `.gitignore` 忽略掉，Git 仓库中不会有也不应该有。[Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

实际项目中将 `.env.local` 环境变量文件内容复制到 GitHub project secret 中

[your project] -> Settings -> Secrets and variables -> Actions -> New repository secret

Name `ENV_LOCAL`

Secret [私有 env 文件内容]

```yml
- name: Create .env.local file
  # echo 后面的引号不能删除，会导致写入文件内容为空
  run: echo "${{ secrets.ENV_LOCAL }}" > ${{ vars.ROOT_PATH }}/.env.local
```

## 压缩构建好的文件

```yml
- name: Build
  run: |
    cd ${{ vars.ROOT_PATH }}
    pnpm build

- name: Compress build output
  run: |
    cd ${{ vars.ROOT_PATH }}
    tar -czf build-output.tar.gz .next
```

## 授权 Github Actions SCP/SSH 访问 VPS

使用 ssh-keygen 生成公私钥对

```bash
ssh-keygen -t rsa -b 4096 -C "[your email]"
```

将公钥复制到 VPS 上

```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub [vps-user]@[vps-ip]
```

复制私钥文件内容然后在 Github Actions Secret 新建一个名为 `SSH_PRIVATE_KEY` 的 Secret

```bash
# 获取私钥内容
cat ~/.ssh/id_rsa
```

确认 VPS SSH 开启 PubkeyAuthentication, 登录你的VPS然后检查 `/etc/ssh/sshd_config` 的`PubkeyAuthentication yes` 如果是 `no` 修改后重启你的 sshd 服务

```bash
# 重启 sshd
service sshd restart
```

## SCP 上传文件到 VPS

```yml
- name: Copy files via SCP
  env:
    SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
    VPS_USER: ${{ secrets.VPS_USER }}
    VPS_HOST: ${{ secrets.VPS_HOST }}
    VPS_PROJECT_PATH: ${{ vars.VPS_PROJECT_PATH }}/${{ vars.ROOT_PATH }}
  run: |
    mkdir -p ~/.ssh
    echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
    cd ${{ vars.ROOT_PATH }}
    scp -o StrictHostKeyChecking=no build-output.tar.gz $VPS_USER@$VPS_HOST:$VPS_PROJECT_PATH
    scp -o StrictHostKeyChecking=no .env.local $VPS_USER@$VPS_HOST:$VPS_PROJECT_PATH
```

## 使用 SSH 连接到VPS，更新 git、解压文件、重启 pm2 服务

```yml
- name: Deploy to VPS
  env:
    VPS_USER: ${{ secrets.VPS_USER }}
    VPS_HOST: ${{ secrets.VPS_HOST }}
  run: |
    ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << 'EOF'
      cd ${{ vars.VPS_PROJECT_PATH }}/${{ vars.ROOT_PATH }}
      git fetch origin
      git reset --hard origin/main
      tar -xzf build-output.tar.gz
      rm build-output.tar.gz
      pm2 restart shortcuts --update-env || pm2 start "pnpm start" --name shortcuts
    EOF
```

EOF 里面的 shell 不能使用 env 的变量，所以使用 `${{}}` 这种形式。这个坑趟得我好苦 😭

## 完整配置文件

```yml
name: Deploy Next.js App

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    # To use Turborepo Remote Caching, set the following environment variables for the job.
    # env:
    #   TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
    #   TURBO_TEAM: ${{ vars.TURBO_TEAM }}

    steps:
      - name: Check out code
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - uses: pnpm/action-setup@v4
        with:
          version: latest

      - name: Setup Node.js environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Create .env.local file
        run: echo "${{ secrets.ENV_LOCAL }}" > ${{ vars.ROOT_PATH }}/.env.local

      - name: Build
        run: |
          cd ${{ vars.ROOT_PATH }}
          pnpm build

      - name: Compress build output
        run: |
          cd ${{ vars.ROOT_PATH }}
          tar -czf build-output.tar.gz .next

      - name: Copy files via SCP
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          VPS_USER: ${{ secrets.VPS_USER }}
          VPS_HOST: ${{ secrets.VPS_HOST }}
          VPS_PROJECT_PATH: ${{ vars.VPS_PROJECT_PATH }}/${{ vars.ROOT_PATH }}
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          cd ${{ vars.ROOT_PATH }}
          scp -o StrictHostKeyChecking=no build-output.tar.gz $VPS_USER@$VPS_HOST:$VPS_PROJECT_PATH
          scp -o StrictHostKeyChecking=no .env.local $VPS_USER@$VPS_HOST:$VPS_PROJECT_PATH

      - name: Deploy to VPS
        env:
          VPS_USER: ${{ secrets.VPS_USER }}
          VPS_HOST: ${{ secrets.VPS_HOST }}
        run: |
          ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << 'EOF'
            cd ${{ vars.VPS_PROJECT_PATH }}/${{ vars.ROOT_PATH }}
            git fetch origin
            git reset --hard origin/main
            tar -xzf build-output.tar.gz
            rm build-output.tar.gz
            pm2 restart shortcuts --update-env || pm2 start "pnpm start" --name shortcuts
          EOF
```
