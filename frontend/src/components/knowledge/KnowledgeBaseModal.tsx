import React, { useState, useEffect } from 'react';
import { X, Link } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { marked } from 'marked';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CreateKnowledgeBase, UpdateKnowledgeBase, KnowledgeBase } from '@/types/mockData';
import { useCreateKnowledgeBase, useUpdateKnowledgeBase } from '@/hooks/useQueries';
import FileUpload from './FileUpload';

const knowledgeBaseSchema = z.object({
  document_name: z.string().min(1, 'Document name is required'),
  content: z.string().optional(),
  ai_summary: z.string().optional(),
  link_citations: z.array(z.string()).optional()
});

type KnowledgeBaseFormValues = z.infer<typeof knowledgeBaseSchema>;

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  knowledgeBase?: KnowledgeBase | null;
}

const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ isOpen, onClose, knowledgeBase }) => {
  // Configure marked with GFM support
  useEffect(() => {
    marked.use({
      gfm: true,
      breaks: false,
      pedantic: false
    });
  }, []);
  
  const createKnowledgeBaseMutation = useCreateKnowledgeBase();
  const updateKnowledgeBaseMutation = useUpdateKnowledgeBase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCitation, setNewCitation] = useState('');
  const [citations, setCitations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [attachmentFilename, setAttachmentFilename] = useState<string | undefined>(undefined);
  
  const form = useForm<KnowledgeBaseFormValues>({
    resolver: zodResolver(knowledgeBaseSchema),
    defaultValues: {
      document_name: '',
      content: '',
      ai_summary: '',
      link_citations: []
    }
  });
  
  useEffect(() => {
    if (knowledgeBase) {
      const citations = knowledgeBase.link_citations || [];
      setCitations(citations);
      // Check if there's an attachment by fetching metadata
      fetchAttachmentInfo(knowledgeBase.id);
      form.reset({
        document_name: knowledgeBase.document_name,
        content: knowledgeBase.content || '',
        ai_summary: knowledgeBase.ai_summary || '',
        link_citations: citations
      });
    } else {
      setCitations([]);
      setAttachmentFilename(undefined);
      form.reset({
        document_name: '',
        content: '',
        ai_summary: '',
        link_citations: []
      });
    }
  }, [knowledgeBase, form]);
  
  const fetchAttachmentInfo = async (id: string) => {
    try {
      const response = await fetch(`/api/knowledge/${id}`);
      if (response.ok) {
        const data = await response.json();
        setAttachmentFilename(data.filename);
      }
    } catch (error) {
      console.error('Error fetching attachment info:', error);
    }
  };
  
  const onSubmit = async (values: KnowledgeBaseFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const data = {
        ...values,
        link_citations: citations
      };
      
      if (knowledgeBase) {
        await updateKnowledgeBaseMutation.mutateAsync({ id: knowledgeBase.id, updates: data as UpdateKnowledgeBase });
      } else {
        await createKnowledgeBaseMutation.mutateAsync(data as CreateKnowledgeBase);
      }
      onClose();
    } catch (error) {
      console.error('Error saving knowledge base document:', error);
      setError('Failed to save document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const addCitation = () => {
    if (newCitation.trim()) {
      setCitations([...citations, newCitation.trim()]);
      setNewCitation('');
    }
  };
  
  const removeCitation = (index: number) => {
    setCitations(citations.filter((_, i) => i !== index));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-modal max-w-2xl max-h-[85vh] gap-1">
        <DialogHeader>
          <DialogTitle className="text-glass">
            {knowledgeBase ? 'Edit Document' : 'Create New Document'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(75vh-8rem)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pr-2">
              <FormField
                control={form.control}
                name="document_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass">Document Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter document name"
                        className="glass-input text-glass"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass">Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter document content (supports Markdown)"
                        className="glass-input text-glass min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator className="my-4" />
              
              <FormField
                control={form.control}
                name="ai_summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-glass">AI Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter AI-generated summary"
                        className="glass-input text-glass min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-glass">Citations</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add citation URL"
                    value={newCitation}
                    onChange={(e) => setNewCitation(e.target.value)}
                    className="glass-input text-glass flex-1"
                  />
                  <Button type="button" onClick={addCitation} className="glass-button">
                    Add
                  </Button>
                </div>
                
                {citations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-glass">Citations:</h4>
                    {citations.map((citation, index) => (
                      <div key={index} className="flex items-center gap-2 glass-card p-3 rounded-lg">
                        <Link className="h-4 w-4 text-glass-muted flex-shrink-0" />
                        <a
                          href={citation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-glass hover:text-primary truncate flex-1"
                        >
                          {citation}
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCitation(index)}
                          className="glass-button text-danger hover:text-danger h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-glass">Attachment</h3>
                <div className="text-sm text-glass-muted">
                  {knowledgeBase ? (
                    <p>Upload or manage file attachments for this document.</p>
                  ) : (
                    <p className="text-warning">Please save the document first before uploading attachments.</p>
                  )}
                </div>
                <FileUpload
                  knowledgeId={knowledgeBase?.id}
                  currentFilename={attachmentFilename}
                  onUploadSuccess={(filename) => setAttachmentFilename(filename)}
                  onDeleteSuccess={() => setAttachmentFilename(undefined)}
                />
              </div>
            </form>
          </Form>
        </ScrollArea>
        
        {error && (
          <div className="pt-2">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="glass-button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="glass-button text-glass"
            onClick={form.handleSubmit(onSubmit)}
          >
            {isSubmitting ? 'Saving...' : knowledgeBase ? 'Update Document' : 'Create Document'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeBaseModal;