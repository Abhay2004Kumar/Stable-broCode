"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import type { TemplateFolder } from "@/features/playground/libs/path-to-json";
import { transformToWebContainerFormat } from "../hooks/transformer";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import webContainerService from '../service/webContainerService';

// Import safe terminal wrapper to avoid SSR issues with xterm
import TerminalComponent from './terminal-wrapper';

// Helper function to convert TemplateFolder to the expected format
function convertToTemplateItems(template: TemplateFolder): any {
  return {
    folderName: template.folderName,
    items: template.items.map(item => {
      if ('items' in item) {
        // It's a TemplateFolder
        return convertToTemplateItems(item);
      } else {
        // It's a TemplateFile
        return {
          filename: item.filename,
          fileExtension: item.fileExtension,
          content: item.content
        };
      }
    })
  };
}

interface WebContainerPreviewProps {
  templateData: TemplateFolder;
  serverUrl: string;
  isLoading: boolean;
  error: string | null;
  forceResetup?: boolean; // Optional prop to force re-setup
  projectId?: string; // Add project ID
}



const WebContainerPreview: React.FC<WebContainerPreviewProps> = ({
  templateData,
  error: propError,
  isLoading,
  serverUrl,
  forceResetup = false,
  projectId,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loadingState, setLoadingState] = useState({
    transforming: false,
    mounting: false,
    installing: false,
    starting: false,
    ready: false,
  });
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isSetupInProgress, setIsSetupInProgress] = useState(false);
  
  // Refs
  const terminalRef = useRef<any>(null);

  // Reset setup state when forceResetup changes or projectId changes
  useEffect(() => {
    if (forceResetup) {
      setIsSetupComplete(false);
      setIsSetupInProgress(false);
      setPreviewUrl("");
      setCurrentStep(0);
      setSetupError(null);
      setLoadingState({
        transforming: false,
        mounting: false,
        installing: false,
        starting: false,
        ready: false,
      });
    }
  }, [forceResetup]);

  // Reset setup when projectId changes (project switching)
  useEffect(() => {
    console.log(`WebContainerPreview: Project ID changed to: ${projectId}`);
    
    // Clear terminal when switching projects
    if (terminalRef.current?.clearTerminal) {
      terminalRef.current.clearTerminal();
    }
    
    setIsSetupComplete(false);
    setIsSetupInProgress(false);
    setPreviewUrl("");
    setCurrentStep(0);
    setSetupError(null);
    setLoadingState({
      transforming: false,
      mounting: false,
      installing: false,
      starting: false,
      ready: false,
    });
  }, [projectId]);

  // Setup WebContainer effect
  useEffect(() => {
    const isMountedRef = { current: true };
    
    async function setupWebContainer() {
      console.log(`setupWebContainer called for project: ${projectId}, isSetupInProgress: ${isSetupInProgress}, isSetupComplete: ${isSetupComplete}`);
      
      if (!isMountedRef.current || isSetupInProgress || (isSetupComplete && !forceResetup)) {
        console.log('setupWebContainer: Skipping setup due to conditions');
        return;
      }

      try {
        console.log('setupWebContainer: Starting setup process...');
        setIsSetupInProgress(true);
        setSetupError(null);
        setCurrentStep(0);

        // Step 1: Transform template data to WebContainer format
        setLoadingState(prev => ({ ...prev, transforming: true }));
        const convertedTemplate = convertToTemplateItems(templateData);
        const files = transformToWebContainerFormat(convertedTemplate);
        setCurrentStep(1);

        setLoadingState((prev) => ({
          ...prev,
          transforming: false,
          mounting: true,
        }));
        setCurrentStep(2);

        // Step 2: Mount files
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("📁 Mounting files to WebContainer...\r\n");
        }
        
        await webContainerService.mountFiles(files, projectId);
        
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("✅ Files mounted successfully\r\n");
        }

        setLoadingState((prev) => ({
          ...prev,
          mounting: false,
          installing: true,
        }));
        setCurrentStep(3);

        // Step 3: Install dependencies
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("📦 Installing dependencies...\r\n");
        }
        
        const installProcess = await webContainerService.spawn("npm", ["install"], projectId);

        // Stream install output to terminal
        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              // Write directly to terminal
              if (terminalRef.current?.writeToTerminal) {
                terminalRef.current.writeToTerminal(data);
              }
            },
          })
        );

        const installExitCode = await installProcess.exit;

        if (installExitCode !== 0) {
          throw new Error(`Failed to install dependencies. Exit code: ${installExitCode}`);
        }

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("✅ Dependencies installed successfully\r\n");
        }

        setLoadingState((prev) => ({
          ...prev,
          installing: false,
          starting: true,
        }));
        setCurrentStep(4);

        // Step 4: Start the server
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("🚀 Starting development server...\r\n");
        }
        
        const startProcess = await webContainerService.spawn("npm", ["run", "start"], projectId);

        // Listen for server ready event
        webContainerService.onServerReady((port: number, url: string) => {
          console.log(`Server ready on port ${port} at ${url}`);
          if (terminalRef.current?.writeToTerminal) {
            terminalRef.current.writeToTerminal(`🌐 Server ready at ${url}\r\n`);
          }
          setPreviewUrl(url);
          setLoadingState((prev) => ({
            ...prev,
            starting: false,
            ready: true,
          }));
          setIsSetupComplete(true);
          setIsSetupInProgress(false);
        });

        // Handle start process output - stream to terminal
        startProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              if (terminalRef.current?.writeToTerminal) {
                terminalRef.current.writeToTerminal(data);
              }
            },
          })
        );

      } catch (err) {
        console.error("Error setting up container:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(` Error: ${errorMessage}\r\n`);
        }
        if (isMountedRef.current) {
          setSetupError(errorMessage);
          setLoadingState({
            transforming: false,
            mounting: false,
            installing: false,
            starting: false,
            ready: false,
          });
        }
      }
    }

    setupWebContainer();

    // Cleanup function to prevent memory leaks
    return () => {
      isMountedRef.current = false;
      webContainerService.releaseInstance();
    };
  }, [templateData, forceResetup, isSetupComplete, isSetupInProgress, projectId]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-6 rounded-lg bg-gray-50 dark:bg-gray-900">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <h3 className="text-lg font-medium">Initializing WebContainer</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Setting up your development environment...
          </p>
        </div>
      </div>
    );
  }

  const error = propError || setupError;
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg max-w-md">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-5 w-5" />
            <h3 className="font-semibold">Error</h3>
          </div>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const getStepIcon = (stepIndex: number) => {
    if (currentStep > stepIndex) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (currentStep === stepIndex) {
      return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    }
    return <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700" />;
  };

  const getStepText = (stepIndex: number, label: string) => {
    if (currentStep > stepIndex) {
      return <span className="text-sm text-green-500">{label}</span>;
    }
    if (currentStep === stepIndex) {
      return <span className="text-sm font-medium">{label}</span>;
    }
    return <span className="text-sm text-gray-500">{label}</span>;
  };

  return (
    <div className="h-full w-full flex flex-col">
      {!previewUrl ? (
        <div className="h-full flex flex-col">
          <div className="w-full max-w-md p-6 m-5 rounded-lg bg-white dark:bg-zinc-800 shadow-sm mx-auto">
           

            <Progress
              value={(currentStep / totalSteps) * 100}
              className="h-2 mb-6"
            />

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                {getStepIcon(1)}
                {getStepText(1, "Transforming template data")}
              </div>
              <div className="flex items-center gap-3">
                {getStepIcon(2)}
                {getStepText(2, "Mounting files")}
              </div>
              <div className="flex items-center gap-3">
                {getStepIcon(3)}
                {getStepText(3, "Installing dependencies")}
              </div>
              <div className="flex items-center gap-3">
                {getStepIcon(4)}
                {getStepText(4, "Starting development server")}
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className="flex-1 p-4">
            <TerminalComponent
              ref={terminalRef}
              theme="dark"
              className="h-full w-full"
            />
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* Preview */}
          <div className="flex-1">
            <iframe
              src={previewUrl}
              className="w-full h-full border-none"
              title="WebContainer Preview"
            />
          </div>
          
          {/* Terminal at bottom when preview is ready */}
          <div className="h-64 border-t">
            <TerminalComponent
              ref={terminalRef}
              theme="dark"
              className="h-full w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WebContainerPreview;