import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import MainChat from './components/MainChat';
import ChatInput from './components/ChatInput';
import PDFViewer from './components/PDFViewer';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [messages, setMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePdfUrl, setActivePdfUrl] = useState(null);
  const [activePage, setActivePage] = useState(null);

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    // Create a local blob URL for the PDF viewer
    const fileUrl = URL.createObjectURL(file);
    setActivePdfUrl(fileUrl);
    setActivePage(1);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.message) {
        setUploadSuccess(true);
        // Reset success state after 5 seconds
        setTimeout(() => setUploadSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      // Could show a toast notification here
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Error:** Failed to upload document. ${error.response?.data?.error || error.message}`
      }]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (text) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsGenerating(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/ask`, {
        params: { question: text }
      });

      if (response.data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `**Error:** ${response.data.error}`
        }]);
      } else {
        // Add assistant message with citations
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.answer,
          citations: response.data.citations
        }]);
      }
    } catch (error) {
      console.error('Error asking question:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Error:** Failed to get an answer. ${error.response?.data?.error || error.message}`
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0f] text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Sidebar
        isUploading={isUploading}
        uploadSuccess={uploadSuccess}
        onFileUpload={handleFileUpload}
      />

      <main className="flex-1 flex relative h-full">
        <div className="flex-1 flex flex-col relative h-full">
          <ChatInput
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
          />
          <MainChat
            messages={messages}
            isGenerating={isGenerating}
            onCitationClick={(page) => setActivePage(page)}
          />
        </div>

        <PDFViewer
          pdfUrl={activePdfUrl}
          activePage={activePage}
          onClose={() => {
            setActivePdfUrl(null);
            setActivePage(null);
          }}
        />
      </main>
    </div>
  );
}

export default App;
