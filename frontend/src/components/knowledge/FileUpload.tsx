import React, { useRef, useState } from 'react';
import { Upload, X, File, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploadProps {
  knowledgeId?: string;
  currentFilename?: string;
  onUploadSuccess?: (filename: string) => void;
  onDeleteSuccess?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  knowledgeId, 
  currentFilename,
  onUploadSuccess,
  onDeleteSuccess 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filename, setFilename] = useState<string | undefined>(currentFilename);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !knowledgeId) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/knowledge/${knowledgeId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      setFilename(data.filename);
      toast.success('File uploaded successfully!');
      onUploadSuccess?.(data.filename);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async () => {
    if (!knowledgeId || !filename) return;

    try {
      const response = await fetch(`/api/knowledge/${knowledgeId}/download`);
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('File downloaded successfully!');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async () => {
    if (!knowledgeId) return;

    try {
      const response = await fetch(`/api/knowledge/${knowledgeId}/attachment`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setFilename(undefined);
      toast.success('File deleted successfully!');
      onDeleteSuccess?.();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        disabled={!knowledgeId || isUploading}
      />
      
      {filename ? (
        <div className="glass-card p-4 rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <File className="h-5 w-5 text-glass-muted flex-shrink-0" />
            <span className="text-sm text-glass truncate flex-1">{filename}</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="glass-button flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="glass-button text-danger hover:text-danger"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={handleFileSelect}
          disabled={!knowledgeId || isUploading}
          className="glass-button w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload File Attachment'}
        </Button>
      )}
    </div>
  );
};

export default FileUpload;