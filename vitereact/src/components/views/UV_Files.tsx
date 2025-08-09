import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Search, Calendar, User } from 'lucide-react';

interface Document {
  document_id: string;
  title: string;
  content: string;
  last_edited_at: string;
  created_by: string;
  workspace_id: string;
}

const fetchDocuments = async (token: string) => {
  const { data } = await axios.get<Document[]>(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/documents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

const createDocument = async ({ title, content }: { title: string; content: string }, token: string) => {
  const { data } = await axios.post<Document>(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/documents`, 
    { title, content }, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

const UV_Files: React.FC = () => {
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');

  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: () => fetchDocuments(authToken!),
    enabled: !!authToken,
  });

  const createDocumentMutation = useMutation({
    mutationFn: (docData: { title: string; content: string }) => createDocument(docData, authToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsCreateDialogOpen(false);
      setNewDocTitle('');
      setNewDocContent('');
    },
  });

  const filteredDocuments = documents?.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateDocument = () => {
    if (newDocTitle.trim()) {
      createDocumentMutation.mutate({
        title: newDocTitle.trim(),
        content: newDocContent.trim() || 'Start writing your document here...'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 ml-64 pt-16">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents & Files</h1>
            <p className="text-gray-600 mt-2">Create, edit, and collaborate on documents</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
                <DialogDescription>
                  Create a new collaborative document that your team can edit together.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    className="col-span-3"
                    placeholder="Enter document title"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="content" className="text-right">
                    Content
                  </Label>
                  <textarea
                    id="content"
                    value={newDocContent}
                    onChange={(e) => setNewDocContent(e.target.value)}
                    className="col-span-3 min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Start writing your document..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreateDocument}
                  disabled={!newDocTitle.trim() || createDocumentMutation.isPending}
                >
                  {createDocumentMutation.isPending ? 'Creating...' : 'Create Document'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading documents...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Error loading documents: {error.message}</p>
          </div>
        )}

        {/* Documents Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No documents found' : 'No documents yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Create your first document to get started with collaboration'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Document
                  </Button>
                )}
              </div>
            ) : (
              filteredDocuments.map((document) => (
                <Card key={document.document_id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link to={`/document/${document.document_id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 ml-3">
                          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {document.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm text-gray-600 line-clamp-3 mb-4">
                        {document.content.length > 150 
                          ? `${document.content.substring(0, 150)}...` 
                          : document.content
                        }
                      </CardDescription>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(document.last_edited_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {document.created_by}
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UV_Files;