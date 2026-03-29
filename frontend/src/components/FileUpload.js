import React, { useState, useRef } from 'react';
import { Upload, X, File, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from './ui/button';

const FileUpload = ({ 
  onFilesSelected, 
  maxFiles = 5, 
  maxSizeMB = 10,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.zip'],
  existingFiles = []
}) => {
  const [files, setFiles] = useState(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    
    if (file.size > maxSize) {
      alert(`File ${file.name} is too large. Maximum size is ${maxSizeMB}MB`);
      return false;
    }
    
    return true;
  };

  const handleFiles = async (fileList) => {
    const newFiles = Array.from(fileList);
    
    if (files.length + newFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = newFiles.filter(validateFile);
    
    if (validFiles.length === 0) return;

    setUploading(true);

    // Upload each file
    const uploadedFiles = [];
    for (const file of validFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            url: data.file_url,
            uploaded: true
          });
        } else {
          alert(`Failed to upload ${file.name}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Error uploading ${file.name}`);
      }
    }

    const updatedFiles = [...files, ...uploadedFiles];
    setFiles(updatedFiles);
    setUploading(false);

    if (onFilesSelected) {
      onFilesSelected(updatedFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (onFilesSelected) {
      onFilesSelected(updatedFiles);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6" />;
    }
    return <File className="w-6 h-6" />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed ${
          dragActive ? 'border-purple-500 bg-purple-50' : 'border-[#0A0A0A]'
        } rounded-lg p-8 text-center transition-colors ${
          uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          className="hidden"
        />
        
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" strokeWidth={2} />
        
        <p className="font-bold mb-2">
          {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
        </p>
        <p className="text-sm text-gray-600">
          Maximum {maxFiles} files, up to {maxSizeMB}MB each
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Supported: Images, PDF, Word documents, ZIP files
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="font-bold text-sm">Uploaded Files ({files.length}/{maxFiles})</p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-[#0A0A0A] rounded-lg"
            >
              <div className="text-gray-600">
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{file.name}</p>
                <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
              </div>
              {file.uploaded && (
                <div className="text-green-600">
                  <Check className="w-5 h-5" />
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="p-1 hover:bg-red-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
