import React, { useState, useEffect } from 'react';
import { X, FileText, Link, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { marked } from 'marked';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CreateKnowledgeBase, UpdateKnowledgeBase, KnowledgeBase } from '@/types/mockData';
import { useApp } from '@/contexts/AppContext';

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
  
  const { createKnowledgeBase, updateKnowledgeBase } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [newCitation, setNewCitation] = useState('');
  const [citations, setCitations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
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
      form.reset({
        document_name: knowledgeBase.document_name,
        content: knowledgeBase.content || '',
        ai_summary: knowledgeBase.ai_summary || '',
        link_citations: citations
      });
    } else {
      setCitations([]);
      form.reset({
        document_name: '',
        content: '',
        ai_summary: '',
        link_citations: []
      });
    }
  }, [knowledgeBase, form]);
  
  const onSubmit = async (values: KnowledgeBaseFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const data = {
        ...values,
        link_citations: citations
      };
      
      if (knowledgeBase) {
        await updateKnowledgeBase(knowledgeBase.id, data as UpdateKnowledgeBase);
        toast.success('Document updated successfully!');
      } else {
        await createKnowledgeBase(data as CreateKnowledgeBase);
        toast.success('Document created successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error saving knowledge base document:', error);
      // Extract user-friendly error message
      let errorMessage = 'Failed to save document. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
        // Try to extract more specific error details from API response
        if ((error as any).details && (error as any).details.detail) {
          const details = (error as any).details.detail;
          if (Array.isArray(details) && details.length > 0) {
            // Extract field-specific errors
            const fieldErrors = details.map((d: any) => {
              if (d.loc && d.loc.length > 0) {
                const fieldName = d.loc[d.loc.length - 1];
                return `${fieldName}: ${d.msg}`;
              }
              return d.msg;
            });
            errorMessage = fieldErrors.join(', ');
          }
        }
      }
      setError(errorMessage);
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
      <DialogContent className="glass-modal !max-w-[90%] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-glass">
            {knowledgeBase ? 'Edit Document' : 'Create New Document'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(85vh-8rem)] pr-4">
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
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="glass-card w-full">
                <TabsTrigger value="content" className="data-[state=active]:glass-glow">
                  Content
                </TabsTrigger>
                <TabsTrigger value="summary" className="data-[state=active]:glass-glow">
                  AI Summary
                </TabsTrigger>
                <TabsTrigger value="citations" className="data-[state=active]:glass-glow">
                  Citations
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-glass">Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter document content (supports Markdown)" 
                          className="glass-input text-glass min-h-[300px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="summary" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="ai_summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-glass">AI Summary</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter AI-generated summary" 
                          className="glass-input text-glass min-h-[200px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="citations" className="space-y-4 mt-4">
                <div className="space-y-4">
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
              </TabsContent>
            </Tabs>
            
            </form>
          </Form>
        </ScrollArea>
        
        {error && (
          <div className="px-4 pb-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-4 border-t border-glass-border mt-4">
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
            className="glass-button"
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