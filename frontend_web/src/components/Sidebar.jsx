import React from 'react';
import { Bot, FileText, UploadCloud, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ isUploading, uploadSuccess, onFileUpload }) {
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileUpload(e.target.files[0]);
        }
    };

    return (
        <div className="w-80 h-full bg-slate-900 border-r border-slate-800 flex flex-col p-6 shadow-2xl relative z-10">
            <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <Bot className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Sentinel AI
                    </h1>
                    <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-0.5">Notes Assistant</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-6">
                <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                        Knowledge Base
                    </h3>

                    <div className="relative group cursor-pointer">
                        <input
                            type="file"
                            accept=".pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                        <div className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 gap-3
              ${uploadSuccess
                                ? 'border-emerald-500/50 bg-emerald-500/5'
                                : isUploading
                                    ? 'border-indigo-500/50 bg-indigo-500/5'
                                    : 'border-slate-700 bg-slate-800/50 group-hover:border-indigo-500/50 group-hover:bg-slate-800'
                            }`}>

                            <AnimatePresence mode="wait">
                                {uploadSuccess ? (
                                    <motion.div
                                        key="success"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="flex flex-col items-center text-emerald-400"
                                    >
                                        <CheckCircle2 className="w-8 h-8 mb-2" />
                                        <p className="text-sm font-medium">Ready to Analyze</p>
                                    </motion.div>
                                ) : isUploading ? (
                                    <motion.div
                                        key="uploading"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="flex flex-col items-center text-indigo-400"
                                    >
                                        <UploadCloud className="w-8 h-8 mb-2 animate-bounce" />
                                        <p className="text-sm font-medium">Processing PDF...</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="idle"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="flex flex-col items-center text-slate-400 group-hover:text-indigo-400 transition-colors"
                                    >
                                        <FileText className="w-8 h-8 mb-2" />
                                        <p className="text-sm font-medium">Drop PDF to index</p>
                                        <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {uploadSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
                    >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-slate-200 truncate">Document Indexed</p>
                            <p className="text-xs text-slate-400">Vector store is updated</p>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/50 text-xs text-slate-500 flex justify-between items-center">
                <span>Sentinel v1.0</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> System Online</span>
            </div>
        </div>
    );
}
