import { WebContainer } from '@webcontainer/api';

// Singleton class to manage WebContainer instance
class WebContainerService {
  private static instance: WebContainerService | null = null;
  private webcontainerInstance: WebContainer | null = null;
  private mountPromise: Promise<void> | null = null;
  private isBooting = false;
  private bootPromise: Promise<WebContainer> | null = null;
  private activeUsers = 0;
  private currentProjectId: string | null = null; // Track current project
  private isProjectSwitching = false; // Lock to prevent concurrent switches

  private constructor() {}

  public static getInstance(): WebContainerService {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService();
    }
    return WebContainerService.instance;
  }

  public async getWebContainer(projectId?: string): Promise<WebContainer> {
    // Wait if another project switch is in progress
    while (this.isProjectSwitching) {
      console.log('Waiting for ongoing project switch to complete...');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // If a different project is being accessed, cleanup the existing container
    if (projectId && this.currentProjectId && projectId !== this.currentProjectId) {
      this.isProjectSwitching = true;
      try {
        console.log(`Switching from project ${this.currentProjectId} to ${projectId}. Cleaning up WebContainer...`);
        await this.forceCleanup();
      } finally {
        this.isProjectSwitching = false;
      }
    }
    
    // Set the current project ID
    if (projectId) {
      this.currentProjectId = projectId;
    }
    
    this.activeUsers++;
    
    if (this.webcontainerInstance) {
      return this.webcontainerInstance;
    }

    if (this.bootPromise) {
      return this.bootPromise;
    }

    this.isBooting = true;
    this.bootPromise = WebContainer.boot();
    
    try {
      this.webcontainerInstance = await this.bootPromise;
      console.log(`WebContainer booted for project: ${this.currentProjectId || 'unknown'}`);
      return this.webcontainerInstance;
    } catch (error) {
      this.bootPromise = null;
      this.isBooting = false;
      throw error;
    } finally {
      this.bootPromise = null;
      this.isBooting = false;
    }
  }

  public async mountFiles(files: Record<string, any>, projectId?: string): Promise<void> {
    const instance = await this.getWebContainer(projectId);
    
    // Always mount files if there's no mount promise or we just switched projects
    // (mountPromise would be null after forceCleanup)
    if (!this.mountPromise) {
      console.log(`Mounting files for project: ${this.currentProjectId || 'unknown'}`);
      console.log('Files to mount:', Object.keys(files));
      this.mountPromise = instance.mount(files);
    }
    
    return this.mountPromise;
  }

  public async spawn(command: string, args: string[] = [], projectId?: string): Promise<any> {
    const instance = await this.getWebContainer(projectId);
    return instance.spawn(command, args);
  }

  public releaseInstance(): void {
    this.activeUsers--;
    
    // Only tear down if no components are using the instance
    if (this.activeUsers <= 0) {
      this.teardown();
    }
  }

  public teardown(): void {
    if (this.webcontainerInstance) {
      this.webcontainerInstance.teardown();
      this.webcontainerInstance = null;
    }
    this.mountPromise = null;
    this.bootPromise = null;
    this.activeUsers = 0;
    this.currentProjectId = null;
    console.log('WebContainer teardown completed');
  }

  // Force cleanup without checking active users - used for project switching
  private async forceCleanup(): Promise<void> {
    console.log('Force cleaning up WebContainer for project switch...');
    
    if (this.webcontainerInstance) {
      try {
        // Clear the file system before teardown
        await this.clearFileSystem();
        // Kill any running processes
        await this.killAllProcesses();
        
        // Safe teardown with null check
        if (this.webcontainerInstance) {
          console.log('Calling teardown on WebContainer instance');
          this.webcontainerInstance.teardown();
        }
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
      this.webcontainerInstance = null;
    } else {
      console.log('forceCleanup: No WebContainer instance to clean up');
    }
    
    this.mountPromise = null;
    this.bootPromise = null;
    // Don't reset activeUsers in force cleanup to maintain user count
  }

  // Clear the WebContainer file system
  private async clearFileSystem(): Promise<void> {
    if (!this.webcontainerInstance) {
      console.warn('clearFileSystem: WebContainer instance is null');
      return;
    }
    
    try {
      console.log('Clearing WebContainer file system...');
      // List all files/directories in root
      const files = await this.webcontainerInstance.fs.readdir('/');
      
      // Remove all files and directories
      for (const file of files) {
        // Skip system directories that shouldn't be removed
        if (['tmp', 'proc', 'dev', 'sys'].includes(file)) {
          continue;
        }
        
        try {
          // Use rm with recursive and force flags to remove both files and directories
          await this.webcontainerInstance.fs.rm(`/${file}`, { recursive: true, force: true });
          console.log(`Removed: /${file}`);
        } catch (error) {
          console.warn(`Failed to remove /${file}:`, error);
        }
      }
    } catch (error) {
      console.warn('Error clearing file system:', error);
    }
  }

  // Kill all running processes
  private async killAllProcesses(): Promise<void> {
    if (!this.webcontainerInstance) {
      console.warn('killAllProcesses: WebContainer instance is null');
      return;
    }
    
    try {
      console.log('Killing all running processes...');
      // Try to kill common development servers
      const killCommands = [
        ['pkill', '-f', 'npm'],
        ['pkill', '-f', 'node'],
        ['pkill', '-f', 'react-scripts'],
        ['pkill', '-f', 'express'],
        ['pkill', '-f', 'vite'],
        ['pkill', '-f', 'webpack']
      ];
      
      for (const [cmd, ...args] of killCommands) {
        try {
          if (!this.webcontainerInstance) break; // Double check during iteration
          const process = await this.webcontainerInstance.spawn(cmd, args);
          await process.exit;
        } catch (error) {
          // Ignore errors as processes might not exist
        }
      }
    } catch (error) {
      console.warn('Error killing processes:', error);
    }
  }

  // Get current project ID for debugging
  public getCurrentProjectId(): string | null {
    return this.currentProjectId;
  }

  // Reset everything - for debugging purposes
  public async forceReset(): Promise<void> {
    console.log('FORCE RESET: Completely resetting WebContainer service...');
    this.isProjectSwitching = true;
    try {
      if (this.webcontainerInstance) {
        try {
          await this.clearFileSystem();
          await this.killAllProcesses();
        } catch (error) {
          console.warn('Error during force reset cleanup:', error);
        }
        this.webcontainerInstance.teardown();
      }
      this.webcontainerInstance = null;
      this.mountPromise = null;
      this.bootPromise = null;
      this.currentProjectId = null;
      this.activeUsers = 0;
      this.isBooting = false;
    } finally {
      this.isProjectSwitching = false;
    }
  }

  public onServerReady(callback: (port: number, url: string) => void): void {
    if (this.webcontainerInstance) {
      this.webcontainerInstance.on('server-ready', callback);
    }
  }


}

const webContainerServiceInstance = WebContainerService.getInstance();

// Add global debug function for testing
if (typeof window !== 'undefined') {
  (window as any).resetWebContainer = () => {
    console.log('Manual WebContainer reset triggered from console');
    return webContainerServiceInstance.forceReset();
  };
  
  (window as any).getWebContainerInfo = () => {
    return {
      currentProjectId: webContainerServiceInstance.getCurrentProjectId(),
      hasInstance: webContainerServiceInstance['webcontainerInstance'] !== null,
      activeUsers: webContainerServiceInstance['activeUsers']
    };
  };
}

export default webContainerServiceInstance;
