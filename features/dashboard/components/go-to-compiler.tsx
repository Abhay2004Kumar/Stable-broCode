import { Button } from "@/components/ui/button"
import { Terminal } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const OnlineCompilerCard = () => {
  return (
    <Link
      href="/dashboard/compiler"
      className="group px-6 py-6 flex flex-row justify-between items-center border rounded-lg bg-muted cursor-pointer 
      transition-all duration-300 ease-in-out
      hover:bg-background hover:border-[#E93F3F] hover:scale-[1.02]
      shadow-[0_2px_10px_rgba(0,0,0,0.08)]
      hover:shadow-[0_10px_30px_rgba(233,63,63,0.15)]"
    >
      <div className="flex flex-row justify-center items-start gap-4">
        <Button
          variant={"outline"}
          className="flex justify-center items-center bg-white group-hover:bg-[#fff8f8] group-hover:border-[#E93F3F] group-hover:text-[#E93F3F] transition-colors duration-300"
          size={"icon"}
        >
          <Terminal size={30} className="transition-transform duration-300 group-hover:scale-110" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-[#e93f3f]">Online Compiler</h1>
          <p className="text-sm text-muted-foreground max-w-[220px]">
            Write, run and debug code in multiple languages
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="w-[150px] h-[150px] flex items-center justify-center">
          <div className="text-6xl">💻</div>
        </div>
      </div>
    </Link>
  )
}

export default OnlineCompilerCard