import Link from "next/link";
import { Github as LucideGithub } from "lucide-react";
import Image from "next/image";

interface ProjectLink {
  href: string | null;
  text: string;
  description: string;
  icon: string;
  iconDark?: string;
  isNew?: boolean;
}

export function Footer() {
  const socialLinks = [
    {
      href: "https://github.com/Abhay2004Kumar",
      icon: (
        <LucideGithub className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-110" />
      ),
    },
  ];

  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col items-center space-y-6 text-center">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="BroCode Logo" width={32} height={32} />
          <span className="text-lg font-bold text-foreground">BroCode</span>
        </div>

        {/* Tagline */}
        <p className="text-muted-foreground max-w-md">
          Empowering developers with an intelligent code editor for seamless coding experiences.
        </p>

        {/* Social Links */}
        <div className="flex gap-4">
          {socialLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              {link.icon}
            </Link>
          ))}
        </div>

        {/* Copyright Notice */}
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Abhay Kumar. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
