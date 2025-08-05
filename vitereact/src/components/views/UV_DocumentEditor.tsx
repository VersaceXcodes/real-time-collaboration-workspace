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

  useEffect(() => {
    // Potentially Setup WebSocket Connection for real-time updates
    // Assuming `socket` is managed globally within the store

    return () => {
      // Clean up WebSocket connection on component unmount
    };
  }, [document_id]);

  return (
    <>
      <div className="min-h-screen flex flex-col p-4 bg-gray-100">
        {isLoading && <div>Loading document...</div>}
        {error && <div className="text-red-600">Error loading document: {error.message}</div>}
        
        <textarea
          className="w-full h-full p-2 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring" 
          value={documentContent}
          onChange={handleContentChange}
          disabled={isLoading || !!error}
          aria-label="Document content editor"
        />
      
        <button
          className="mt-4 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
          onClick={handleSave}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </>
  );
};

export default UV_DocumentEditor;