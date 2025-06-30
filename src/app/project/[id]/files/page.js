"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useParams } from "next/navigation";
import { FiUpload, FiFile, FiTrash2, FiDownload, FiImage, FiVideo, FiMusic, FiFileText, FiArchive, FiCode } from "react-icons/fi";
import { format } from "date-fns";

export default function FilesPage() {
  const { id: projectId } = useParams();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/files?projectId=${projectId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to load files");
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setIsUploading(true);
      setError(null);
      
      try {
        for (const file of acceptedFiles) {
          // Simulate upload progress
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
          
          // Here you would typically upload to your storage service (e.g., S3)
          // For now, we'll just simulate the upload
          const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file), // In production, this would be the storage URL
            projectId: parseInt(projectId),
          };

          // Simulate progress
          for (let progress = 0; progress <= 100; progress += 20) {
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          const response = await fetch("/api/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fileData),
          });

          if (!response.ok) {
            throw new Error("Failed to upload file");
          }

          const newFile = await response.json();
          setFiles((prev) => [...prev, newFile]);
          
          // Remove from progress tracking
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }
      } catch (error) {
        console.error("Error uploading files:", error);
        setError("Failed to upload files. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [projectId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB max file size
  });

  const handleDelete = async (fileId) => {
    if (!confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      const response = await fetch(`/api/files?fileId=${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      setFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
      setError("Failed to delete file. Please try again.");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return FiImage;
    if (type.startsWith('video/')) return FiVideo;
    if (type.startsWith('audio/')) return FiMusic;
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FiFileText;
    if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return FiArchive;
    if (type.includes('javascript') || type.includes('html') || type.includes('css') || type.includes('json')) return FiCode;
    return FiFile;
  };

  const getFileTypeColor = (type) => {
    if (type.startsWith('image/')) return 'text-green-400';
    if (type.startsWith('video/')) return 'text-purple-400';
    if (type.startsWith('audio/')) return 'text-blue-400';
    if (type.includes('pdf') || type.includes('document')) return 'text-red-400';
    if (type.includes('zip') || type.includes('archive')) return 'text-yellow-400';
    if (type.includes('code') || type.includes('javascript') || type.includes('html')) return 'text-orange-400';
    return 'text-gray-400';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 7 * 24) {
      return format(date, 'EEEE');
    } else {
      return format(date, 'MMM d');
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      {/* Header - responsive */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Files</h1>
        
        {/* Upload area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? "border-purple-500 bg-purple-500/10 scale-105"
              : "border-gray-600 hover:border-gray-500 hover:bg-gray-800/50"
          } ${isUploading ? "pointer-events-none opacity-75" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full bg-gray-700 flex items-center justify-center">
              <FiUpload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <p className="text-sm sm:text-base text-gray-300 mb-2">
              {isDragActive
                ? "Drop the files here..."
                : isUploading
                ? "Uploading files..."
                : "Drag and drop files here, or click to select"}
            </p>
            <p className="text-xs text-gray-500">
              Maximum file size: 50MB
            </p>
          </div>
        </div>

        {/* Upload progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-4 space-y-2">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300 truncate">{fileName}</span>
                  <span className="text-xs text-gray-400">{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6 rounded-full bg-gray-800 flex items-center justify-center">
            <FiFile className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">No files yet</h3>
          <p className="text-sm sm:text-base text-gray-500">Upload your first file to get started!</p>
        </div>
      ) : (
        <>
          {/* Desktop view - hidden on mobile */}
          <div className="hidden lg:block bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 bg-gray-750 font-medium text-gray-300">
              <div className="col-span-5">Name</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-3">Uploaded by</div>
              <div className="col-span-2">Actions</div>
            </div>

            {files.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 hover:bg-gray-700/50 items-center transition-colors"
                >
                  <div className="col-span-5 flex items-center">
                    <FileIcon className={`h-5 w-5 mr-3 ${getFileTypeColor(file.type)}`} />
                    <span className="truncate text-white">{file.name}</span>
                  </div>
                  <div className="col-span-2 text-gray-400">
                    {formatFileSize(file.size)}
                  </div>
                  <div className="col-span-3 flex items-center">
                    {file.uploader?.imageUrl && (
                      <img
                        src={file.uploader.imageUrl}
                        alt={`${file.uploader.firstName} ${file.uploader.lastName}`}
                        className="h-6 w-6 rounded-full mr-2"
                      />
                    )}
                    <span className="truncate text-gray-300">
                      {file.uploader ? `${file.uploader.firstName} ${file.uploader.lastName}` : 'Unknown'}
                    </span>
                  </div>
                  <div className="col-span-2 flex space-x-2">
                    <button
                      onClick={() => window.open(file.url, "_blank")}
                      className="p-2 text-gray-400 hover:text-blue-400 rounded-lg transition-colors"
                      title="Download"
                    >
                      <FiDownload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile view - card layout */}
          <div className="lg:hidden space-y-3">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <FileIcon className={`h-8 w-8 ${getFileTypeColor(file.type)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm leading-tight break-words">
                          {file.name}
                        </h3>
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{formatDate(file.createdAt)}</span>
                        </div>
                        {/* Uploader info */}
                        <div className="flex items-center space-x-2 mt-3">
                          {file.uploader?.imageUrl ? (
                            <img
                              src={file.uploader.imageUrl}
                              alt={`${file.uploader.firstName} ${file.uploader.lastName}`}
                              className="h-5 w-5 rounded-full"
                            />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-gray-600 flex items-center justify-center">
                              <span className="text-xs text-white">
                                {file.uploader?.firstName?.[0] || 'U'}
                              </span>
                            </div>
                          )}
                          <span className="text-xs text-gray-400">
                            {file.uploader ? `${file.uploader.firstName} ${file.uploader.lastName}` : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex space-x-2 ml-3">
                      <button
                        onClick={() => window.open(file.url, "_blank")}
                        className="p-2 text-gray-400 hover:text-blue-400 rounded-lg transition-colors bg-gray-700 hover:bg-gray-600"
                        title="Download"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-2 text-gray-400 hover:text-red-400 rounded-lg transition-colors bg-gray-700 hover:bg-gray-600"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
