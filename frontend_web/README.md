# 🛡️ Sentinel AI — Premium RAG Document Assistant

A **hackathon-ready**, premium UI/UX redesign of an AI-powered PDF assistant with RAG (Retrieval-Augmented Generation). Built with React, Tailwind CSS, and Framer Motion.

---

## ✨ Features

### 🎨 **Premium UI/UX Design**
- **Glassmorphism** cards with backdrop blur
- **Dark gradient theme** (deep blue/purple tones)
- **Smooth animations** (Framer Motion)
- **Modern typography** (Inter font)
- **Subtle shadows & depth**
- **Rounded corners & clean spacing**

### 🧠 **Smart Features**
- **Student Level Selector** (Class 4, 6, 8, 10)
  - Adjusts answer complexity based on grade level
  - Visual color-coded badges
- **Document Insights Cards**
  - Summary
  - Topics Covered
  - Key Terms
  - Document Info (pages, topics, terms count)
- **Interactive Quiz Generator**
  - MCQ-based quizzes from document content
  - Real-time scoring
  - Visual feedback (correct/incorrect)
  - Progress tracking
  - Retry functionality

### 📄 **PDF Experience**
- **Smooth PDF viewer** with page navigation
- **Citation highlighting** — click citations to jump to source pages
- **Active page indicator**
- **Animated slide-in/out**

### 💬 **Chat UX**
- **AI & User avatars**
- **Typing animation** (dot pulse)
- **"Thinking..." state**
- **Citation badges** (clickable)
- **Generate Quiz button** after AI responses
- **Empty state** with suggested prompts
- **Markdown support** in responses

### 🎯 **Layout**
```
┌─────────────────────────────────────────────────────────┐
│  Header (Logo, AMD Badge, Level Selector)              │
├──────────┬──────────────────────────────┬──────────────┤
│          │                              │              │
│ Sidebar  │  Center Column               │  PDF Viewer  │
│          │  ┌────────────────────────┐  │              │
│ - Upload │  │ Insight Cards          │  │ - Document   │
│ - Files  │  └────────────────────────┘  │ - Page Nav   │
│          │  ┌────────────────────────┐  │ - Citations  │
│          │  │ Chat Messages          │  │              │
│          │  │ - User/AI bubbles      │  │              │
│          │  │ - Citations            │  │              │
│          │  │ - Quiz cards           │  │              │
│          │  └────────────────────────┘  │              │
│          │  ┌────────────────────────┐  │              │
│          │  │ Input Bar              │  │              │
│          │  └────────────────────────┘  │              │
└──────────┴──────────────────────────────┴──────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python backend running on `http://localhost:8000`

### Installation
```bash
cd frontend_web
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

### Build
```bash
npm run build
```

---

## 📦 Tech Stack

| Technology       | Purpose                          |
|------------------|----------------------------------|
| **React 19**     | UI framework                     |
| **Vite**         | Build tool & dev server          |
| **Tailwind CSS** | Utility-first styling            |
| **Framer Motion**| Animations & transitions         |
| **Lucide React** | Icon library                     |
| **Axios**        | HTTP client                      |
| **React Markdown**| Markdown rendering              |

---

## 🎨 Design System

### Color Palette
```css
--bg-base:        #06060f  /* Deep dark base */
--bg-surface:     #0c0c1a  /* Surface layer */
--bg-elevated:    #12121f  /* Elevated cards */

--accent:         #6366f1  /* Indigo primary */
--accent-light:   #a5b4fc  /* Light indigo */

--success:        #10b981  /* Emerald */
--warning:        #f59e0b  /* Amber */
--danger:         #ef4444  /* Red */
```

### Typography
- **Font**: Inter (system fallback)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Sizes**: 10px–22px (responsive)

### Spacing
- **Padding**: 8px, 12px, 16px, 20px, 24px
- **Gap**: 5px, 8px, 10px, 12px, 16px
- **Border Radius**: 8px, 10px, 12px, 14px, 16px, 20px

---

## 📂 Component Structure

```
src/
├── App.jsx                    # Main app container
├── index.css                  # Global styles & design tokens
├── main.jsx                   # React entry point
└── components/
    ├── Header.jsx             # Top bar (logo, AMD badge, level selector)
    ├── Sidebar.jsx            # Left panel (upload, file list)
    ├── InsightCards.jsx       # Document insight cards (collapsible)
    ├── ChatWindow.jsx         # Chat container + input bar
    ├── ChatMessage.jsx        # Individual message bubble
    ├── QuizCard.jsx           # Quiz UI (questions, scoring, retry)
    └── PDFViewer.jsx          # Right panel (PDF iframe)
```

---

## 🧩 Key Components

### `Header.jsx`
- **Logo** with gradient background
- **AMD Ryzen AI badge**
- **Student Level Selector** (dropdown with color-coded badges)

### `Sidebar.jsx`
- **Drag-and-drop upload zone**
- **File list** with metadata (size, time)
- **Active file highlighting**
- **Online status indicator**

### `InsightCards.jsx`
- **4 insight cards**: Summary, Topics, Key Terms, Document Info
- **Collapsible** with smooth animation
- **Color-coded** icons and borders

### `ChatWindow.jsx`
- **Empty state** with suggested prompts
- **Message list** with auto-scroll
- **Typing indicator** (animated dots)
- **Input bar** with glassmorphism

### `ChatMessage.jsx`
- **User/AI avatars**
- **Markdown rendering**
- **Citation badges** (clickable)
- **Generate Quiz button**

### `QuizCard.jsx`
- **MCQ questions** with A/B/C/D options
- **Real-time feedback** (correct/incorrect)
- **Progress bar**
- **Score screen** with percentage & grade
- **Retry button**

### `PDFViewer.jsx`
- **Animated slide-in/out**
- **Page navigation** via citations
- **Active page banner**
- **Empty state** when no PDF loaded

---

## 🎯 Student Level Selector

Adjusts AI response complexity based on grade level:

| Level      | Complexity                          | Color  |
|------------|-------------------------------------|--------|
| **Class 4**| Very simple (easy words, short)     | Green  |
| **Class 6**| Moderate (balanced explanation)     | Blue   |
| **Class 8**| Intermediate (more detail)          | Purple |
| **Class 10**| Advanced (technical + detailed)    | Amber  |

The level is passed to the backend as a prefix:
```javascript
const levelPrefix = `[Explain at ${studentLevel} level] `;
```

---

## 🧪 Quiz Feature

### Flow
1. User asks a question → AI responds
2. User clicks **"Generate Quiz"** button
3. Quiz card appears with 4 MCQs
4. User selects an answer → instant feedback
5. User clicks **"Next"** → next question
6. After all questions → **Score screen** with percentage & grade
7. User can **"Try Again"** to reset

### Quiz Data Structure
```javascript
{
  questions: [
    {
      question: "What is the primary function of an OS?",
      options: ["Manage resources", "Create docs", "Browse web", "Play games"],
      correct: 0  // index of correct option
    },
    // ...
  ]
}
```

---

## 🎨 Animation Details

### Framer Motion Animations
- **Fade-in**: `initial={{ opacity: 0 }}` → `animate={{ opacity: 1 }}`
- **Slide-up**: `initial={{ y: 10 }}` → `animate={{ y: 0 }}`
- **Scale**: `initial={{ scale: 0.9 }}` → `animate={{ scale: 1 }}`
- **Slide-in (PDF)**: `initial={{ width: 0 }}` → `animate={{ width: 460 }}`

### CSS Animations
- **Spin**: Loading spinner (360° rotation)
- **Dot pulse**: Typing indicator (scale + opacity)
- **Shimmer**: Logo text gradient animation

---

## 🔌 API Integration

### Backend Endpoints
```javascript
POST /upload          // Upload PDF
GET  /ask?question=   // Ask question (returns answer + citations)
```

### Request/Response
```javascript
// Upload
FormData: { file: <PDF file> }
Response: { message: "File uploaded successfully" }

// Ask
Params: { question: "[Explain at Class 10 level] What is a process?" }
Response: {
  answer: "A process is...",
  citations: [5, 12, 18]  // page numbers
}
```

---

## 🎯 Hackathon Tips

### What Makes This Stand Out
✅ **Premium UI** — Glassmorphism, gradients, smooth animations  
✅ **Smart Features** — Level selector, insights, quiz generator  
✅ **Polished UX** — Empty states, loading states, error handling  
✅ **Modern Stack** — React 19, Tailwind, Framer Motion  
✅ **Clean Code** — Component-based, reusable, well-documented  

### Demo Script
1. **Upload PDF** → Show drag-and-drop + processing animation
2. **Insight Cards** → Highlight summary, topics, key terms
3. **Ask Question** → Show typing animation + citation badges
4. **Click Citation** → PDF jumps to source page
5. **Change Level** → Show how answer complexity changes
6. **Generate Quiz** → Complete quiz + show score screen

---

## 📝 Customization

### Change Colors
Edit `src/index.css`:
```css
:root {
  --accent: #6366f1;  /* Change primary color */
  --bg-base: #06060f; /* Change background */
}
```

### Add More Quiz Questions
Edit `src/App.jsx`:
```javascript
const MOCK_QUIZ = [
  { question: "...", options: [...], correct: 0 },
  // Add more questions
];
```

### Adjust Layout Widths
- **Sidebar**: `width: 260px` in `Sidebar.jsx`
- **PDF Viewer**: `width: 460px` in `PDFViewer.jsx`
- **Chat Max Width**: `maxWidth: 760px` in `ChatWindow.jsx`

---

## 🐛 Troubleshooting

### "vite not recognized"
```bash
npm install  # Install dependencies first
```

### PDF not loading
- Check CORS settings on backend
- Ensure PDF URL is a valid blob URL

### Citations not working
- Verify backend returns `citations` array
- Check `onCitationClick` prop is passed correctly

---

## 📄 License

MIT License — Free to use for hackathons, projects, and portfolios.

---

## 🙌 Credits

- **Design Inspiration**: Perplexity AI, Notion, ChatGPT
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Font**: Inter (Google Fonts)

---

## 🚀 Next Steps

- [ ] Add real-time quiz generation via backend API
- [ ] Implement PDF text highlighting for citations
- [ ] Add voice input for questions
- [ ] Support multiple file formats (DOCX, TXT)
- [ ] Add dark/light theme toggle
- [ ] Implement user authentication
- [ ] Add chat history persistence

---

**Built with ❤️ for hackathons and beyond.**
