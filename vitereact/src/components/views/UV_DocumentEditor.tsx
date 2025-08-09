import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';
import axios from 'axios';

interface Document {
  document_id: string;
  title: string;
  content: string;
  last_edited_at: string;
  version: string;
}

const fetchDocumentContent = async (documentId: string, token: string) => {
  const { data } = await axios.get<Document>(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/documents/${documentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

const saveDocumentContent = async ({ documentId, content }: { documentId: string; content: string }, token: string) => {
  await axios.patch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/documents/${documentId}`, { content }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const UV_DocumentEditor: React.FC = () => {
  const { document_id } = useParams<{ document_id: string }>();
  const [documentContent, setDocumentContent] = useState<string>('');
  const authToken = useAppStore(state => state.authentication_state.auth_token);

  const { data: documentData, isLoading, error } = useQuery({
    queryKey: ['documentContent', document_id],
    queryFn: () => fetchDocumentContent(document_id!, authToken!),
    enabled: !!document_id && !!authToken,
  });

  const mutation = useMutation({
    mutationFn: (content: string) => saveDocumentContent({ documentId: document_id!, content }, authToken!)
  });

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocumentContent(e.target.value);
  };

  const handleSave = () => {
    if (documentData && documentContent !== documentData.content) {
      mutation.mutate(documentContent);
    }
  };

  useEffect(() => {
    if (documentData && documentData.content) {
      setDocumentContent(documentData.content);
    }
  }, [documentData]);

  // Auto-save functionality
  useEffect(() => {
    if (!documentData || !documentContent || documentContent === documentData.content) {
      return;
    }

    const autoSaveTimer = setTimeout(() => {
      mutation.mutate(documentContent);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [documentContent, documentData, mutation]);

  useEffect(() => {
    // Potentially Setup WebSocket Connection for real-time updates
    // Assuming `socket` is managed globally within the store

    return () => {
      // Clean up WebSocket connection on component unmount
    };
  }, [document_id]);

  return (
    <div className="min-h-screen bg-gray-50 ml-64 pt-16">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {documentData?.title || 'Loading...'}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Last edited: {documentData?.last_edited_at ? new Date(documentData.last_edited_at).toLocaleString() : 'Never'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              onClick={handleSave}
              disabled={mutation.isPending || isLoading}
            >
              {mutation.isPending ? 'Saving...' : 'Save Document'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading document...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Error loading document: {error.message}</p>
          </div>
        )}

        {/* Document Editor */}
        {!isLoading && !error && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <textarea
                className="w-full h-96 p-4 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed" 
                value={documentContent}
                onChange={handleContentChange}
                disabled={isLoading || !!error}
                aria-label="Document content editor"
                placeholder="Start writing your document here..."
              />
              
              {/* Status Bar */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                <div>
                  {documentContent.length} characters
                </div>
                <div className="flex items-center space-x-4">
                  {mutation.isSuccess && (
                    <span className="text-green-600">✓ Saved</span>
                  )}
                  {mutation.isError && (
                    <span className="text-red-600">✗ Save failed</span>
                  )}
                  <span>Auto-save enabled</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UV_DocumentEditor;