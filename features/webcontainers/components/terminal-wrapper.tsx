"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamic import with no SSR to prevent xterm from being rendered server-side
const TerminalComponent = dynamic(() => import('./terminal'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-zinc-900 rounded-lg">
      <div className="text-center">
        <Loader2 className="h-6 w-6 animate-spin text-white mb-2 mx-auto" />
        <p className="text-sm text-gray-400">Loading Terminal...</p>
      </div>
    </div>
  ),
});

interface TerminalWrapperProps {
  webcontainerUrl?: string;
  className?: string;
  theme?: "dark" | "light";
}

export interface TerminalRef {
  writeToTerminal: (data: string) => void;
  clearTerminal: () => void;
  focusTerminal: () => void;
}

const TerminalWrapper = React.forwardRef<TerminalRef, TerminalWrapperProps>((props, ref) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Render nothing on server, loading state on client until mounted
  if (!isClient) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-900 rounded-lg">
        <div className="text-center">
          <div className="h-6 w-6 bg-gray-600 rounded-full animate-pulse mb-2 mx-auto" />
          <p className="text-sm text-gray-400">Initializing Terminal...</p>
        </div>
      </div>
    );
  }

  return <TerminalComponent {...props} ref={ref} />;
});

TerminalWrapper.displayName = 'TerminalWrapper';

export default TerminalWrapper;