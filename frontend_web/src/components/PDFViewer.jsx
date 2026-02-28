import React from 'react';
import { FileText, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PDFViewer({ pdfUrl, activePage, onClose }) {
    if (!pdfUrl) {
        return (
            <div className="w-[500px] h-full bg-slate-900 border-l border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-500 z-10 hidden xl:flex">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-slate-400 mb-2">No Document Loaded</h3>
                <p className="text-sm">Upload a PDF to view it here.</p>
            </div>
        );
    }

    // Append the page hash if we have an active page
    const viewUrl = activePage ? `${pdfUrl}#page=${activePage}` : pdfUrl;

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 500, opacity: 1 }}
            className="w-[500px] h-full bg-slate-900 border-l border-slate-800 flex flex-col z-10 shrink-0 shadow-2xl relative"
        >
            <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900 shrink-0">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium text-slate-200">Document Viewer</span>
                    {activePage && (
                        <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
                            Page {activePage}
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 bg-slate-950/50 p-2">
                <iframe
                    src={viewUrl}
                    className="w-full h-full rounded-lg border border-slate-800 bg-white"
                    title="PDF Viewer"
                />
            </div>
        </motion.div>
    );
}
