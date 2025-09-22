"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    // Small delay to show loading state before navigation
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };
   
  return (
    <div className="z-20 flex flex-col items-center justify-start min-h-screen py-2 mt-10 bg-background transition-colors duration-300 relative overflow-hidden cyber-grid">
      {/* Futuristic background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-cyan-950/20 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="flex flex-col justify-center items-center my-5 relative z-10">
      <Image 
        src={"/hero.svg"} 
        alt="Hero-Section" 
        height={500}  
        width={500}
        className="cursor-pointer animate-float hover:scale-105 transition-transform duration-300 drop-shadow-lg hover:drop-shadow-2xl hover:drop-shadow-blue-500/50 hover:glow-blue"
      />
      
      <h1 className="z-20 text-6xl mt-5 font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-500 tracking-tight leading-[1.3] animate-slide-in hover:glow-blue transition-all duration-500 cursor-default">
        Intelligent Editor
      </h1>
      </div>
     

      <p className="mt-2 text-lg text-center text-muted-foreground px-5 py-10 max-w-2xl animate-fade-in relative">
        <span className="text-blue-400 font-semibold">BroCode</span> is a powerful and intelligent code editor that enhances
        your coding experience with advanced features and seamless integration.
        It is designed to help you write, debug, and optimize your code
        efficiently with <span className="text-cyan-400 font-medium">cutting-edge technology</span>.
      </p>
      <Button 
        variant={"brand"} 
        className="mb-4 cursor-pointer button-shadow hover-lift relative z-10" 
        size={"lg"}
        onClick={handleGetStarted}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            Get Started
            <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
