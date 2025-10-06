import type { Component } from 'solid-js';
import { createSignal, Show, For, onMount } from 'solid-js';
import { Plus, Edit2, Eye, FileText, Calendar } from 'lucide-solid';
import { knowledgeApi, type KnowledgeBase, type KnowledgeBaseCreate } from '../services/api';
import { KnowledgeModal } from '../components/KnowledgeModal';

export const KnowledgeBaseView: Component = () => {
  const [documents, setDocuments] = createSignal<KnowledgeBase[]>([]);
  const [showModal, setShowModal] = createSignal(false);
  const [selectedDocument, setSelectedDocument] = createSignal<KnowledgeBase | null>(null);
  const [loading, setLoading] = createSignal(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const documentsData = await knowledgeApi.getAll();
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    loadData();
  });

  const handleCreateDocument = () => {
    setSelectedDocument(null);
    setShowModal(true);
  };

  const handleViewDocument = (document: KnowledgeBase) => {
    setSelectedDocument(document);
    setShowModal(true);
  };

  const handleEditDocument = (document: KnowledgeBase) => {
    setSelectedDocument(document);
    setShowModal(true);
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold">Knowledge Base</h1>
        <button
          onClick={handleCreateDocument}
          class="flex items-center space-x-2 px-4 py-2 bg-primary text-bg-dark rounded-lg hover:bg-primary/80 transition-colors"
        >
          <Plus size={20} />
          <span>Add Document</span>
        </button>
      </div>

      <Show when={loading()}>
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p class="mt-4 text-text-muted">Loading documents...</p>
        </div>
      </Show>

      <Show when={!loading() && documents().length === 0}>
        <div class="text-center py-12">
          <FileText size={48} class="mx-auto text-text-muted mb-4" />
          <h2 class="text-2xl font-semibold text-text-muted">No documents yet</h2>
          <p class="mt-2 text-text-muted">Create your first knowledge base document to get started.</p>
        </div>
      </Show>

      <Show when={!loading() && documents().length > 0}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <For each={documents()}>
            {(document) => (
              <div class="bg-bg-light border border-border rounded-lg p-6 card-hover">
                <div class="flex justify-between items-start mb-4">
                  <h3 class="text-lg font-semibold text-primary">{document.document_name}</h3>
                  <Show when={document.content || document.ai_summary}>
                    <FileText size={16} class="text-text-muted" />
                  </Show>
                </div>

                <div class="space-y-3">
                  <Show when={document.content}>
                    <p class="text-sm text-text line-clamp-3">
                      {truncateContent(document.content || '')}
                    </p>
                  </Show>

                  <Show when={!document.content && document.ai_summary}>
                    <p class="text-sm text-text-muted italic line-clamp-3">
                      AI Summary: {truncateContent(document.ai_summary || '')}
                    </p>
                  </Show>

                  <div class="flex items-center text-xs text-text-muted">
                    <Calendar size={12} class="mr-1" />
                    <span>Last updated: {formatDate(document.updated_at)}</span>
                  </div>

                  <Show when={document.related_entities && document.related_entities.length > 0}>
                    <div class="text-xs text-text-muted">
                      <span class="font-medium">Related to:</span>
                      <div class="mt-1">
                        {document.related_entities?.slice(0, 2).join(', ')}
                        {document.related_entities && document.related_entities.length > 2 && ` +${document.related_entities.length - 2} more`}
                      </div>
                    </div>
                  </Show>
                </div>

                <div class="flex justify-end space-x-2 mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => handleViewDocument(document)}
                    class="flex items-center space-x-1 px-3 py-1 text-sm bg-info text-bg-dark rounded hover:bg-info/80 transition-colors"
                  >
                    <Eye size={14} />
                    <span>Read</span>
                  </button>
                  <button
                    onClick={() => handleEditDocument(document)}
                    class="flex items-center space-x-1 px-3 py-1 text-sm bg-warning text-bg-dark rounded hover:bg-warning/80 transition-colors"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Modal */}
      <KnowledgeModal
        show={showModal()}
        onClose={() => setShowModal(false)}
        document={selectedDocument()}
        onSave={() => {
          setShowModal(false);
          loadData();
        }}
      />
    </div>
  );
};