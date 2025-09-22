import { Button } from "@/components/ui/button"
import { Terminal } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const OnlineCompilerCard = () => {
  return (
    <Link
      href="/dashboard/compiler"
      className="group px-6 py-6 flex flex-row justify-between items-center border rounded-xl bg-card cursor-pointer 
      transition-all duration-300 ease-in-out glass-effect
      hover:bg-card/80 hover:border-primary hover:scale-[1.02] hover:neon-border hover:glow-cyan
      shadow-sm hover:shadow-lg hover:shadow-primary/20
      dark:hover:bg-card/60 cyber-grid"
    >
      <div className="flex flex-row justify-center items-start gap-4">
        <Button
          variant={"outline"}
          className="flex justify-center items-center bg-background group-hover:bg-primary/10 group-hover:border-blue-400 group-hover:text-blue-400 transition-all duration-300 shadow-sm hover:glow-blue rounded-xl"
          size={"icon"}
        >
          <Terminal size={30} className="transition-transform duration-300 group-hover:scale-110 group-hover:text-blue-400" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-primary group-hover:text-blue-400 transition-colors duration-300">Online Compiler</h1>
          <p className="text-sm text-muted-foreground max-w-[220px] group-hover:text-cyan-300 transition-colors duration-300">
            Write, run and debug code in multiple languages
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="w-[150px] h-[150px] flex items-center justify-center">
          <div className="text-6xl opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:drop-shadow-lg filter group-hover:hue-rotate-180">💻</div>
        </div>
      </div>
    </Link>
  )
}

export default OnlineCompilerCard