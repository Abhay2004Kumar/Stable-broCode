"use client";

import AddNewButton from "@/features/dashboard/components/add-new-btn";
import OnlineCompilerCard from "@/features/dashboard/components/go-to-compiler";

import Image from "next/image";
import ProjectTable from "@/features/dashboard/components/project-table";
import { getAllPlaygroundForUser , deleteProjectById ,editProjectById , duplicateProjectById} from "@/features/playground/actions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Project } from "@/features/dashboard/types";

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <Image src="/empty-state.svg" alt="No projects" width={192} height={192} className="mb-4" />
    <h2 className="text-xl font-semibold text-gray-500">No projects found</h2>
    <p className="text-gray-400">Create a new project to get started!</p>
  </div>
);

const DashboardMainPage = () => {
  const [playgrounds, setPlaygrounds] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaygrounds = async () => {
      try {
        const data = await getAllPlaygroundForUser();
        setPlaygrounds((data as Project[]) || []);
        console.log(data);
      } catch (error) {
        console.error('Error fetching playgrounds:', error);
        toast.error('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaygrounds();
  }, []);

  // Wrapper functions to match expected signatures
  const handleDeleteProject = async (id: string): Promise<void> => {
    try {
      await deleteProjectById(id);
      // Refresh the list after deletion
      const updatedPlaygrounds = await getAllPlaygroundForUser();
      setPlaygrounds((updatedPlaygrounds as Project[]) || []);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const handleEditProject = async (id: string, data: { title: string; description: string }): Promise<void> => {
    try {
      await editProjectById(id, data);
      // Refresh the list after editing
      const updatedPlaygrounds = await getAllPlaygroundForUser();
      setPlaygrounds((updatedPlaygrounds as Project[]) || []);
    } catch (error) {
      console.error('Error editing project:', error);
      throw error;
    }
  };

  const handleDuplicateProject = async (id: string): Promise<void> => {
    try {
      await duplicateProjectById(id);
      // Refresh the list after duplication
      const updatedPlaygrounds = await getAllPlaygroundForUser();
      setPlaygrounds((updatedPlaygrounds as Project[]) || []);
    } catch (error) {
      console.error('Error duplicating project:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-500">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-start items-center min-h-screen mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <AddNewButton />
        <OnlineCompilerCard />
      </div>
      <div className="mt-10 flex flex-col justify-center items-center w-full">
        {playgrounds.length === 0 ? (
          <EmptyState />
        ) : (
          <ProjectTable
            projects={playgrounds}
            onDeleteProject={handleDeleteProject}
            onUpdateProject={handleEditProject}
            onDuplicateProject={handleDuplicateProject}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardMainPage;
