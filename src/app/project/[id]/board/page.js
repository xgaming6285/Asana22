"use client";

import React, { useEffect, useState } from "react";
import BoardColumns from "./components/BoardColumns";
import { useTaskModal } from "@/app/context/TaskModalContext";
import { Button } from "@/app/components/MaterialTailwind";
import { useParams } from "next/navigation";
import projectService from "@/app/services/projectService";
import membershipService from "@/app/services/membershipService";
import { PlusCircleIcon, Squares2X2Icon, SparklesIcon } from "@heroicons/react/24/outline";

export default function BoardPage() {
  const params = useParams();
  const { id: projectId } = params;
  const { openTaskModal } = useTaskModal();
  const [project, setProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loadingProjectDetails, setLoadingProjectDetails] = useState(true);

  useEffect(() => {
    if (projectId) {
      setLoadingProjectDetails(true);
      Promise.all([
        projectService.getProjectById(projectId),
        membershipService.getProjectMembers(projectId),
      ])
        .then(([projectData, membersData]) => {
          setProject(projectData);
          setProjectMembers(membersData || []);
        })
        .catch((error) => {
          console.error("Failed to fetch project details or members:", error);
          setProject({ name: "Project Board" });
          setProjectMembers([]);
        })
        .finally(() => {
          setLoadingProjectDetails(false);
        });
    } else {
      setLoadingProjectDetails(false);
      setProject({ name: "Project Board" });
    }
  }, [projectId]);

  const handleOpenCreateTaskModal = () => {
    openTaskModal({
      projectId,
      projectMembers: Array.isArray(projectMembers) ? projectMembers : [],
      onTaskUpdated: () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("refreshTasks"));
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-6 sm:p-8 border-b border-gray-700/50 backdrop-blur-sm bg-gray-900/80 sticky top-0">
        <div className="container mx-auto">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Title Section */}
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              {loadingProjectDetails ? (
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl animate-pulse flex-shrink-0"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-700/50 rounded-lg w-48 animate-pulse"></div>
                    <div className="h-3 bg-gray-700/30 rounded w-32 animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur opacity-50"></div>
                    <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 p-2.5 rounded-xl">
                      <Squares2X2Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
                      {project?.name || "Project Board"}
                    </h1>
                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4" />
                      Kanban Board View
                    </p>
                  </div>
                </>
              )}
            </div>
            
            {/* Action Button */}
            <div className="flex-shrink-0">
              <Button
                onClick={handleOpenCreateTaskModal}
                className="relative overflow-hidden group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 px-6 py-3 text-sm font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <PlusCircleIcon className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Create Task</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-700/50">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Active Project</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-700/50">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">{projectMembers.length} Members</span>
            </div>
          </div>
        </div>
      </header>

      {/* Board Content */}
      <main className="relative z-10 flex-grow p-4 sm:p-8 overflow-hidden">
        <div className="container mx-auto h-full">
          {projectId ? (
            <BoardColumns projectId={projectId} projectMembers={projectMembers} />
          ) : (
            <div className="flex justify-center items-center h-full">
              <div className="text-center p-8 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 max-w-md">
                <div className="text-6xl mb-6 animate-bounce">📋</div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Project Not Found
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
                </p>
                <div className="mt-6 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
