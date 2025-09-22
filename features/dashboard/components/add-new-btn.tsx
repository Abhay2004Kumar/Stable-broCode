"use client";
import TemplateSelectionModal from "@/components/modal/template-selector-modal";
import { Button } from "@/components/ui/button"
import { createPlayground } from "@/features/playground/actions";
import { Plus } from 'lucide-react'
import Image from "next/image"
import { useRouter } from "next/navigation";
import { useState } from "react"
import { toast } from "sonner";

const AddNewButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<{
    title: string;
    template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
    description?: string;
  } | null>(null)
  const router = useRouter()

  const handleSubmit = async(data: {
    title: string;
    template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
    description?: string;
  }) => {
    setSelectedTemplate(data)
    const res = await createPlayground(data);
    toast("Playground created successfully");
    // Here you would typically handle the creation of a new playground
    // with the selected template data
    console.log("Creating new playground:", data)
    setIsModalOpen(false)
    router.push(`/playground/${res?.id}`)
  }

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group px-6 py-6 flex flex-row justify-between items-center border rounded-xl bg-card cursor-pointer 
        transition-all duration-300 ease-in-out glass-effect
        hover:bg-card/80 hover:border-primary hover:scale-[1.02] hover:neon-border hover:glow-blue
        shadow-sm hover:shadow-lg hover:shadow-primary/20
        dark:hover:bg-card/60 cyber-grid"
      >
        <div className="flex flex-row justify-center items-start gap-4">
          <Button
            variant={"outline"}
            className="flex justify-center items-center bg-background group-hover:bg-primary/10 group-hover:border-cyan-400 group-hover:text-cyan-400 transition-all duration-300 shadow-sm hover:glow-cyan rounded-xl"
            size={"icon"}
          >
            <Plus size={30} className="transition-transform duration-300 group-hover:rotate-90 group-hover:text-cyan-400" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-primary group-hover:text-cyan-400 transition-colors duration-300">Add New</h1>
            <p className="text-sm text-muted-foreground max-w-[220px] group-hover:text-blue-300 transition-colors duration-300">Create a new playground</p>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <Image
            src={"/add-new.svg"}
            alt="Create new playground"
            width={150}
            height={150}
            className="transition-all duration-300 group-hover:scale-110 opacity-80 group-hover:opacity-100 group-hover:drop-shadow-lg"
          />
        </div>
      </div>
      
      <TemplateSelectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmit}
      />
    </>
  )
}

export default AddNewButton
