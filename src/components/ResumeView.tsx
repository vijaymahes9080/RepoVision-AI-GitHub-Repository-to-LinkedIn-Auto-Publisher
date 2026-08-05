import React, { useState } from 'react';
import { ProjectAnalysis } from '../types';
import { generateResumeBullets, ResumeBullet } from '../services/resumeBulletGenerator';
import { 
  FileText, 
  Copy, 
  Check, 
  Sparkles, 
  Award,
  Briefcase
} from 'lucide-react';

interface ResumeViewProps {
  analysis: ProjectAnalysis | null;
}

export const ResumeView: React.FC<ResumeViewProps> = ({ analysis }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const bullets: ResumeBullet[] = analysis
    ? generateResumeBullets(analysis)
    : [];

  const handleCopyBullet = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const fullText = bullets.map((b) => `• ${b.bulletText}`).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-purple-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-extrabold text-white">AI Resume / CV Experience Bullet Generator</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Converts your analyzed GitHub repository into high-impact, quantifiable resume bullets ready for software engineering CVs.
          </p>
        </div>

        <button
          onClick={handleCopyAll}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-neon transition-all shrink-0"
        >
          {copiedAll ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copiedAll ? 'All Bullets Copied!' : 'Copy All Bullets'}</span>
        </button>
      </div>

      {/* Bullets List */}
      <div className="space-y-4">
        {bullets.map((bullet) => (
          <div key={bullet.id} className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">{bullet.category}</span>
              <button
                onClick={() => handleCopyBullet(bullet.id, bullet.bulletText)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium"
              >
                {copiedId === bullet.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === bullet.id ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-100 font-mono leading-relaxed bg-[#090d16] p-4 rounded-xl border border-gray-800">
              • {bullet.bulletText}
            </p>

            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-semibold pt-1">
              <Award className="w-3.5 h-3.5" />
              <span>Quantifiable Impact: {bullet.quantifiableImpact}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
