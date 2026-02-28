import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MainChat({ messages, isGenerating, onCitationClick }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isGenerating]);

    return (
        <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col relative scroll-smooth bg-[#0a0a0f]">
            {/* Background gradients */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

            {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto mt-[-10vh]">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative">
                        <Sparkles className="w-8 h-8 text-indigo-400" />
                        <div className="absolute inset-0 bg-indigo-400/20 blur-xl rounded-2xl -z-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-200 mb-3">How can I help you today?</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Upload a PDF document from the sidebar to start asking questions. I'll search through your knowledge base and provide cited answers.
                    </p>
                </div>
            ) : (
                <div className="max-w-4xl w-full mx-auto flex flex-col gap-8 pb-32">
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex gap-5 w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role === 'assistant' && (
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg mt-1">
                                    <Bot className="w-5 h-5 text-indigo-400" />
                                </div>
                            )}

                            <div className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-sm ${message.role === 'user'
                                ? 'bg-indigo-600 text-white shadow-indigo-500/20 rounded-tr-sm'
                                : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-sm backdrop-blur-sm'
                                }`}>
                                {message.role === 'assistant' ? (
                                    <div className="prose prose-invert prose-indigo max-w-none text-[15px] leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                                        <ReactMarkdown>{message.content}</ReactMarkdown>

                                        {message.citations && message.citations.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-wrap gap-2 items-center">
                                                <span className="text-xs text-slate-400 font-medium">Sources:</span>
                                                {message.citations.map((page, i) => (
                                                    <span key={i} onClick={() => onCitationClick && onCitationClick(page)} className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium cursor-pointer hover:bg-indigo-500/30 transition-colors">
                                                        Page {page}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-[15px] leading-relaxed">{message.content}</p>
                                )}
                            </div>

                            {message.role === 'user' && (
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-700/50 border border-slate-600/50 flex items-center justify-center shadow-lg mt-1">
                                    <User className="w-5 h-5 text-slate-300" />
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {isGenerating && (
                        <div className="flex gap-5 w-full justify-start">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg mt-1">
                                <Bot className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-sm px-6 py-5 flex flex-col gap-3 min-w-[120px]">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} className="h-4" />
                </div>
            )}
        </div>
    );
}
