import { useState, useEffect, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';
import { TemplateFolder } from '@/features/playground/libs/path-to-json';
import webContainerService from '../service/webContainerService';

interface UseWebContainerProps {
  templateData: TemplateFolder;
  projectId?: string;
}

interface UseWebContainerReturn {
  serverUrl: string | null;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  destroy: () => void;
}

export const useWebContainer = ({ templateData, projectId }: UseWebContainerProps): UseWebContainerReturn => {
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [instance, setInstance] = useState<WebContainer | null>(null);
  const [lastProjectId, setLastProjectId] = useState<string | undefined>(projectId);

  useEffect(() => {
    let mounted = true;
    let webContainerInstance: WebContainer | null = null;

    async function initializeWebContainer() {
      try {
        console.log(`useWebContainer: Initializing for project ${projectId}`);
        console.log(`useWebContainer: Last project was ${lastProjectId}`);
        
        // Reset state when project changes
        if (projectId !== lastProjectId) {
          console.log('useWebContainer: Project changed, resetting state');
          setServerUrl(null);
          setError(null);
          setIsLoading(true);
        }
        
        // Use the singleton service to get the WebContainer instance with project ID
        webContainerInstance = await webContainerService.getWebContainer(projectId);
        
        if (!mounted) return;
        
        setInstance(webContainerInstance);
        setIsLoading(false);
        setLastProjectId(projectId);
      } catch (err) {
        console.error('Failed to initialize WebContainer:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize WebContainer');
          setIsLoading(false);
        }
      }
    }

    initializeWebContainer();

    return () => {
      mounted = false;
      // Let the service handle the cleanup
      if (webContainerInstance) {
        webContainerService.releaseInstance();
      }
    };
  }, [projectId, lastProjectId]); // Re-run when projectId changes

  const writeFileSync = useCallback(async (path: string, content: string): Promise<void> => {
    if (!instance) {
      throw new Error('WebContainer instance is not available');
    }

    try {
      // Ensure the folder structure exists
      const pathParts = path.split('/');
      const folderPath = pathParts.slice(0, -1).join('/'); // Extract folder path

      if (folderPath) {
        await instance.fs.mkdir(folderPath, { recursive: true }); // Create folder structure recursively
      }

      // Write the file
      await instance.fs.writeFile(path, content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to write file';
      console.error(`Failed to write file at ${path}:`, err);
      throw new Error(`Failed to write file at ${path}: ${errorMessage}`);
    }
  }, [instance]);

  // Clean up function
  const destroy = useCallback(() => {
    if (instance) {
      webContainerService.releaseInstance();
      setInstance(null);
      setServerUrl(null);
    }
  }, [instance]);

  return { serverUrl, isLoading, error, instance, writeFileSync, destroy };
};