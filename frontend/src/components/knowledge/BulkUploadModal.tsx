import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, FileText, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useApp } from '@/contexts/AppContext';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FileWithContent {
  file: File;
  content: string | null;
  error: string | null;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose }) => {
  const { projects, createKnowledgeBase, refreshKnowledgeBase } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [files, setFiles] = useState<FileWithContent[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedProjectId('');
      setFiles([]);
      setIsUploading(false);
      setProgress(0);
      setCurrentFileIndex(0);
      setError(null);
    }
  }, [isOpen]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Extract text content from supported file types
  const extractTextFromFile = async (file: File): Promise<string | null> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    try {
      if (extension === 'txt' || extension === 'md') {
        // Simple text files - read directly
        return await file.text();
      } else if (extension === 'pdf') {
        // For PDF files, we'll need a library like pdf.js
        // For now, return null and just attach the file
        return null;
      } else if (extension === 'doc' || extension === 'docx') {
        // For Word documents, we'd need a library like mammoth.js
        // For now, return null and just attach the file
        return null;
      }
      return null;
    } catch (error) {
      console.error(`Error extracting text from ${file.name}:`, error);
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length === 0) return;

    setError(null);
    
    // Process files and extract content
    const filesWithContent: FileWithContent[] = await Promise.all(
      selectedFiles.map(async (file) => {
        try {
          const content = await extractTextFromFile(file);
          return { file, content, error: null };
        } catch (error) {
          return {
            file,
            content: null,
            error: error instanceof Error ? error.message : 'Failed to process file'
          };
        }
      })
    );

    setFiles(filesWithContent);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleBulkUpload = async () => {
    if (!selectedProjectId) {
      setError('Please select a project before uploading');
      return;
    }

    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);
    setCurrentFileIndex(0);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const { file, content } = files[i];
      setCurrentFileIndex(i + 1);

      try {
        // Create the knowledge base item with filename as title
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        
        const kbData = {
          document_name: fileName,
          content: content || undefined,
          ai_summary: content ? `Uploaded from file: ${file.name}` : undefined,
          link_citations: [],
          related_projects: [selectedProjectId],
          date_added: new Date().toISOString().split('T')[0],
        };

        const createdKb = await createKnowledgeBase(kbData);

        // Upload the file attachment
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch(`/api/knowledge/${createdKb.id}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload attachment for ${file.name}`);
        }

        successCount++;
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        failCount++;
      }

      // Update progress
      setProgress(((i + 1) / files.length) * 100);
    }

    setIsUploading(false);

    // Show results
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} document${successCount > 1 ? 's' : ''}`);
      await refreshKnowledgeBase();
    }

    if (failCount > 0) {
      toast.error(`Failed to upload ${failCount} document${failCount > 1 ? 's' : ''}`);
    }

    if (successCount > 0 && failCount === 0) {
      onClose();
    }
  };

  const canStartUpload = selectedProjectId && files.length > 0 && !isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-modal max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-glass">Bulk Upload Documents</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-8rem)] pr-4">
          <div className="space-y-6">
            {/* Project Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-glass">
                Select Project <span className="text-danger">*</span>
              </label>
              <Select 
                value={selectedProjectId} 
                onValueChange={setSelectedProjectId}
                disabled={isUploading}
              >
                <SelectTrigger className="glass-input text-glass">
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent className="glass-modal !rounded-lg">
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id} className="text-glass">
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-glass-muted">
                All uploaded documents will be linked to this project
              </p>
            </div>

            {/* File Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-glass">Select Files</label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".txt,.md,.doc,.docx,.pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleFileSelect}
                disabled={isUploading}
                className="glass-button w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {files.length > 0 ? `${files.length} file(s) selected` : 'Select Files'}
              </Button>
              <p className="text-xs text-glass-muted">
                Supported formats: .txt, .md, .doc, .docx, .pdf
              </p>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-glass">Selected Files</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {files.map((fileWithContent, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 glass-card p-3 rounded-lg"
                    >
                      <FileText className="h-4 w-4 text-glass-muted flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-glass truncate">
                          {fileWithContent.file.name}
                        </p>
                        {fileWithContent.content && (
                          <p className="text-xs text-glass-muted">
                            Content extracted ({fileWithContent.content.length} chars)
                          </p>
                        )}
                        {fileWithContent.error && (
                          <p className="text-xs text-danger">{fileWithContent.error}</p>
                        )}
                      </div>
                      {!isUploading && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="glass-button text-danger hover:text-danger h-6 w-6 p-0 flex-shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-glass">
                  <span>Uploading documents...</span>
                  <span>
                    {currentFileIndex} / {files.length}
                  </span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Warning if no project selected */}
            {!selectedProjectId && files.length > 0 && !isUploading && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select a project before starting the upload
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
            className="glass-button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleBulkUpload}
            disabled={!canStartUpload}
            className="glass-button text-glass"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length > 0 ? `${files.length} Document${files.length > 1 ? 's' : ''}` : 'Documents'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadModal;