type ToolHeaderProps = {
  title: string;
  description: string;
};

export default function ToolHeader({ title, description }: ToolHeaderProps) {
  return (
    <header className="mb-8 max-w-2xl">
      <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
        {title}
      </h1>
      <p className="mt-3 text-pretty text-sm leading-6 text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </header>
  );
}
