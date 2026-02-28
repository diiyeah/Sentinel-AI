import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSendMessage, isGenerating }) {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isGenerating) {
            onSendMessage(input);
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="w-full bg-[#0a0a0f] pt-8 pb-4 px-8 z-20 shrink-0">
            <div className="max-w-4xl mx-auto">
                <form
                    onSubmit={handleSubmit}
                    className="relative flex items-end gap-2 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl shadow-black/50 p-2 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all duration-300"
                >
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question about your documents..."
                        className="w-full max-h-48 min-h-[60px] bg-transparent border-none resize-none px-6 py-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 text-[17px] font-medium scrollbar-thin scrollbar-thumb-slate-700 leading-relaxed"
                        rows={1}
                        disabled={isGenerating}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isGenerating}
                        className="shrink-0 p-3 rounded-xl bg-indigo-600 text-white disabled:bg-slate-700 disabled:text-slate-500 hover:bg-indigo-500 transition-colors h-[48px] w-[48px] flex items-center justify-center m-2 shadow-lg group"
                    >
                        <Send className="w-5 h-5 -ml-0.5 group-hover:scale-110 transition-transform" />
                    </button>
                </form>
                <p className="text-center text-xs text-slate-500 mt-3 font-medium">
                    AI can make mistakes. Verify important information using the citations provided.
                </p>
            </div>
        </div>
    );
}
