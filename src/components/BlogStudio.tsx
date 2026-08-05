import React, { useState } from 'react';
import { ProjectAnalysis } from '../types';
import { generateMarkdownArticle } from '../services/blogGenerator';
import { 
  FileText, 
  Copy, 
  Check, 
  Sparkles, 
  Share2, 
  Download
} from 'lucide-react';

interface BlogStudioProps {
  analysis: ProjectAnalysis | null;
}

export const BlogStudio: React.FC<BlogStudioProps> = ({ analysis }) => {
  const [copied, setCopied] = useState(false);

  const articleMarkdown = analysis
    ? generateMarkdownArticle(analysis)
    : '';

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(articleMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-emerald-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-extrabold text-white">Dev.to / Medium / Hashnode Article Generator</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Generates long-form technical Markdown articles formatted for Dev.to, Medium, and Hashnode publishing.
          </p>
        </div>

        <button
          onClick={handleCopyMarkdown}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-neon transition-all shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Markdown Article Copied!' : 'Copy Markdown Article'}</span>
        </button>
      </div>

      {/* Markdown Code Area */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
            Generated Technical Article (Markdown Format)
          </span>
          <span className="text-xs text-gray-400 font-mono">{articleMarkdown.length} characters</span>
        </div>

        <textarea
          rows={16}
          readOnly
          value={articleMarkdown}
          className="w-full p-4 bg-[#090d16] border border-gray-800 rounded-xl text-xs text-slate-200 font-mono leading-relaxed"
        />
      </div>

    </div>
  );
};
