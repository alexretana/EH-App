import React, { useState, useEffect, useMemo } from 'react';
import { Plus, FileText, Calendar, Edit, Trash2, Eye, Link, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { marked } from 'marked';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import KnowledgeBaseModal from '@/components/knowledge/KnowledgeBaseModal';
import { KnowledgeBase } from '@/types/mockData';

const KnowledgeBaseView: React.FC = () => {
  // Configure marked with GFM support
  useEffect(() => {
    marked.use({
      gfm: true,
      breaks: false,
      pedantic: false
    });
  }, []);
  const { knowledgeBase, isLoading, deleteKnowledgeBase, projects } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReadModalOpen, setIsReadModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<KnowledgeBase | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setIsSearching(true);
    }
    
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsSearching(false);
    }, 2500); // 2.5 second delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, debouncedSearchQuery]);

  const handleCreateDocument = () => {
    setCurrentDocument(null);
    setIsModalOpen(true);
  };

  const handleEditDocument = (doc: KnowledgeBase) => {
    setCurrentDocument(doc);
    setIsModalOpen(true);
  };

  const handleReadDocument = (doc: KnowledgeBase) => {
    setCurrentDocument(doc);
    setIsReadModalOpen(true);
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteKnowledgeBase(id);
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentDocument(null);
  };

  const closeReadModal = () => {
    setIsReadModalOpen(false);
    setCurrentDocument(null);
  };

  // Filter knowledge base items by selected project and search query
  const filteredKnowledgeBase = useMemo(() => {
    // First apply project filter
    let filtered = knowledgeBase;
    if (selectedProjectId !== 'all') {
      filtered = knowledgeBase.filter((doc) => {
        // Check if this document has any project references
        const hasProjectReference = doc.related_entity_ids?.some((entityId: string, index: number) => {
          return doc.entity_types?.[index] === 'project' && entityId === selectedProjectId;
        });
        
        return hasProjectReference;
      });
    }
    
    // Then apply search filter within the project-filtered results
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.document_name.toLowerCase().includes(query) ||
        (doc.ai_summary && doc.ai_summary.toLowerCase().includes(query)) ||
        (doc.content && doc.content.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [knowledgeBase, selectedProjectId, debouncedSearchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-6 rounded-xl">
          <p className="text-glass">Loading documents...</p>
        </div>
      </div>
    );
  }


  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-glass">Knowledge Base</h1>
          <div className="flex items-center gap-3">
            <Button className="glass-button text-[var(--text)]" onClick={handleCreateDocument}>
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-glass-muted" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input text-glass pl-10 pr-10 w-full"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-glass-muted animate-spin" />
            )}
          </div>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="glass-input text-glass w-[200px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent className="glass-modal !rounded-lg">
              <SelectItem value="all" className="text-glass">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id} className="text-glass">
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredKnowledgeBase.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 glass-card rounded-xl p-8">
            <FileText className="h-12 w-12 text-glass-muted mb-4" />
            <h2 className="text-2xl font-semibold text-glass mb-4">
              {selectedProjectId === 'all' ? 'No Documents Yet' : 'No Documents for Selected Project'}
            </h2>
            <p className="text-glass-muted mb-6 text-center max-w-md">
              {selectedProjectId === 'all'
                ? 'Create your first knowledge base document to store important information related to your projects.'
                : 'No knowledge base documents found for this project. Try selecting a different project or create a new document.'}
            </p>
            <Button className="glass-button text-[var(--text)]" onClick={handleCreateDocument}>
              <Plus className="h-4 w-4 mr-2" />
              Create Document
            </Button>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredKnowledgeBase.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ y: -5 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                >
                <Card className="glass-card glass-hover-level-1 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg text-glass line-clamp-2">{doc.document_name}</CardTitle>
                      <Badge variant="outline" className="glass-button ml-2">
                        <FileText className="h-3 w-3 mr-1" />
                        Doc
                      </Badge>
                    </div>
                    <CardDescription className="text-glass-muted flex items-center text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(doc.date_added).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-glass text-sm line-clamp-3">
                      {doc.ai_summary || doc.content?.substring(0, 150) || 'No content available'}
                    </p>
                    {doc.link_citations && doc.link_citations.length > 0 && (
                      <div className="flex items-center mt-2 text-xs text-glass-muted">
                        <Link className="h-3 w-3 mr-1" />
                        {doc.link_citations.length} citation{doc.link_citations.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="glass-button w-full"
                          onClick={() => handleReadDocument(doc)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Read
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="glass-button w-full"
                          onClick={() => handleEditDocument(doc)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="glass-button text-danger hover:text-danger"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    </div>
                  </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      
      <KnowledgeBaseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        knowledgeBase={currentDocument}
      />
      
      {/* Read Document Modal */}
      <Dialog open={isReadModalOpen} onOpenChange={closeReadModal}>
        <DialogContent className="glass-modal max-w-[90%] md:max-w-[75%] lg:max-w-[65%] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-glass">
              {currentDocument?.document_name}
            </DialogTitle>
          </DialogHeader>
          
          {currentDocument && (
            <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
              <div className="space-y-6">
              {currentDocument.ai_summary && (
                <div className="glass-card p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-glass mb-2">AI Summary</h3>
                  <p className="text-glass">{currentDocument.ai_summary}</p>
                </div>
              )}
              
              {currentDocument.content && (
                <div className="glass-card p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-glass mb-2">Content</h3>
                  <div
                    className="prose prose-invert max-w-none text-glass"
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(currentDocument.content)
                    }}
                  />
                </div>
              )}
              
              {currentDocument.link_citations && currentDocument.link_citations.length > 0 && (
                <div className="glass-card p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-glass mb-2">Citations</h3>
                  <div className="space-y-2">
                    {currentDocument.link_citations.map((citation, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Link className="h-4 w-4 text-glass-muted flex-shrink-0" />
                        <a
                          href={citation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-glass hover:text-primary truncate"
                        >
                          {citation}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-glass-muted">
                <span>Added: {new Date(currentDocument.date_added).toLocaleDateString()}</span>
                <span>Last updated: {new Date(currentDocument.updated_at).toLocaleDateString()}</span>
              </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KnowledgeBaseView;