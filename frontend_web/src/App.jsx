import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import PDFViewer from './components/PDFViewer';
import InsightCards from './components/InsightCards';
import QuizPanel from './components/QuizPanel';

const API_BASE_URL = 'http://localhost:8000';

// Fallback quiz used when backend doesn't provide one
function buildFallbackQuiz(fileName) {
  return [
    {
      question: `What type of document is "${fileName}"?`,
      options: ['A research paper', 'A study guide / notes', 'A legal document', 'A news article'],
      correct: 1,
      explanation: 'Based on the file name and typical upload patterns, this appears to be study material.',
      page: 1,
    },
    {
      question: 'What is the best way to study from a document?',
      options: [
        'Read once and memorize',
        'Highlight key points and review regularly',
        'Skip to the last page',
        'Only read the headings',
      ],
      correct: 1,
      explanation: 'Active recall and spaced repetition with highlighted key points is the most effective study method.',
      page: 2,
    },
    {
      question: 'Which feature of Sentinel AI helps you understand a document faster?',
      options: ['PDF download', 'RAG-based Q&A with citations', 'Font resizing', 'Dark mode'],
      correct: 1,
      explanation: 'RAG (Retrieval-Augmented Generation) lets you ask questions and get answers with exact page citations.',
      page: 1,
    },
    {
      question: 'What does a citation badge (e.g. "p.5") do in Sentinel AI?',
      options: [
        'Downloads the page',
        'Jumps the PDF viewer to that page',
        'Highlights the text',
        'Copies the text',
      ],
      correct: 1,
      explanation: 'Clicking a citation badge navigates the PDF viewer directly to the referenced page.',
      page: 5,
    },
    {
      question: 'What is the purpose of the Student Level selector?',
      options: [
        'Changes the font size',
        'Adjusts answer complexity for your grade level',
        'Filters documents by grade',
        'Sets a reading timer',
      ],
      correct: 1,
      explanation: 'The level selector tells the AI to explain concepts at the appropriate complexity for Class 4 through Class 10.',
      page: 1,
    },
  ];
}

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [messages, setMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePdfUrl, setActivePdfUrl] = useState(null);
  const [activePdfName, setActivePdfName] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [studentLevel, setStudentLevel] = useState('Class 10');
  const [insights, setInsights] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('chat'); // 'chat' | 'quiz'
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  /* ── Upload ─────────────────────────────────── */
  const handleFileUpload = async (file) => {
    setIsUploading(true);
    const fileUrl = URL.createObjectURL(file);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.message) {
        const entry = { name: file.name, url: fileUrl, size: file.size, uploadedAt: new Date() };
        setUploadedFiles(prev => prev.find(f => f.name === file.name) ? prev : [...prev, entry]);
        setActivePdfUrl(fileUrl);
        setActivePdfName(file.name);
        setActivePage(1);
        setInsights({
          summary: `This document covers key academic concepts. Use the chat to ask questions and get cited answers.`,
          topics: ['Core Concepts', 'Key Definitions', 'Important Principles', 'Applications'],
          definitions: ['Process', 'Algorithm', 'System', 'Module', 'Interface'],
          pageCount: '~20+ pages',
        });

        // Auto-generate quiz after upload
        autoGenerateQuiz(file.name);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Upload Error:** ${err.response?.data?.error || err.message}`,
      }]);
    } finally {
      setIsUploading(false);
    }
  };

  const autoGenerateQuiz = async (fileName) => {
    setIsGeneratingQuiz(true);
    try {
      // Try to get quiz from backend
      const res = await axios.get(`${API_BASE_URL}/quiz`).catch(() => null);
      if (res?.data?.questions) {
        setQuizQuestions(res.data.questions);
      } else {
        // Use fallback quiz
        await new Promise(r => setTimeout(r, 1200)); // simulate generation
        setQuizQuestions(buildFallbackQuiz(fileName));
      }
    } catch {
      setQuizQuestions(buildFallbackQuiz(fileName));
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectFile = (file) => {
    setActivePdfUrl(file.url);
    setActivePdfName(file.name);
    setActivePage(1);
  };

  /* ── Chat ───────────────────────────────────── */
  const handleSendMessage = async (text) => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsGenerating(true);

    try {
      const levelPrefix = `[Explain at ${studentLevel} level] `;
      const res = await axios.get(`${API_BASE_URL}/ask`, {
        params: { question: levelPrefix + text },
      });

      if (res.data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${res.data.error}` }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: res.data.answer,
          citations: res.data.citations,
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Error:** ${err.response?.data?.error || err.message}`,
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-root">
      <Header
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        studentLevel={studentLevel}
        onLevelChange={setStudentLevel}
        sidebarTab={sidebarTab}
        onTabChange={setSidebarTab}
        hasDocuments={uploadedFiles.length > 0}
        isGeneratingQuiz={isGeneratingQuiz}
      />

      <div className="app-body">
        <Sidebar
          isUploading={isUploading}
          uploadedFiles={uploadedFiles}
          onFileUpload={handleFileUpload}
          onSelectFile={handleSelectFile}
          activePdfName={activePdfName}
        />

        <div className="center-col">
          {insights && sidebarTab === 'chat' && <InsightCards insights={insights} />}

          {sidebarTab === 'quiz' ? (
            <QuizPanel
              questions={quizQuestions}
              isGenerating={isGeneratingQuiz}
              hasDocuments={uploadedFiles.length > 0}
              onCitationClick={(page) => setActivePage(page)}
              onRegenerate={() => activePdfName && autoGenerateQuiz(activePdfName)}
            />
          ) : (
            <ChatWindow
              messages={messages}
              isGenerating={isGenerating}
              onSendMessage={handleSendMessage}
              onCitationClick={(page) => setActivePage(page)}
              hasDocuments={uploadedFiles.length > 0}
            />
          )}
        </div>

        <PDFViewer
          pdfUrl={activePdfUrl}
          pdfName={activePdfName}
          activePage={activePage}
          onClose={() => { setActivePdfUrl(null); setActivePdfName(null); setActivePage(null); }}
        />
      </div>
    </div>
  );
}
