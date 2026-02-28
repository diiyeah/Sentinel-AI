import React from 'react';

export default function StatCard({ label, value, icon: Icon, colorClass }) {
    return (
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50 flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${colorClass}`} />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
            </div>
            <span className="text-2xl font-bold text-slate-200">{value}</span>
        </div>
    );
}
