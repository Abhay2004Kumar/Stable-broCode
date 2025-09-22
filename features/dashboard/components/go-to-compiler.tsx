import { Button } from "@/components/ui/button"
import { Terminal } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const OnlineCompilerCard = () => {
  return (
    <Link
      href="/dashboard/compiler"
      className="group px-6 py-6 flex flex-row justify-between items-center border rounded-lg bg-card cursor-pointer 
      transition-all duration-300 ease-in-out
      hover:bg-card/80 hover:border-primary hover:scale-[1.02]
      shadow-sm hover:shadow-lg hover:shadow-primary/20
      dark:hover:bg-card/60"
    >
      <div className="flex flex-row justify-center items-start gap-4">
        <Button
          variant={"outline"}
          className="flex justify-center items-center bg-background group-hover:bg-primary/5 group-hover:border-primary group-hover:text-primary transition-colors duration-300 shadow-sm"
          size={"icon"}
        >
          <Terminal size={30} className="transition-transform duration-300 group-hover:scale-110" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-primary">Online Compiler</h1>
          <p className="text-sm text-muted-foreground max-w-[220px]">
            Write, run and debug code in multiple languages
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="w-[150px] h-[150px] flex items-center justify-center">
          <div className="text-6xl opacity-80 group-hover:opacity-100 transition-opacity duration-300">💻</div>
        </div>
      </div>
    </Link>
  )
}

export default OnlineCompilerCard