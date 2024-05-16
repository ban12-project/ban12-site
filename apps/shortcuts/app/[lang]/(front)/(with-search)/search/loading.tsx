import { Loader } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-2 text-zinc-500/90">
      <Loader className="h-6 w-6 animate-spin" />
      <p>Loading</p>
    </div>
  )
}
