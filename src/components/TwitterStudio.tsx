import React, { useState } from 'react';
import { ProjectAnalysis } from '../types';
import { generateTwitterThread, TweetItem } from '../services/twitterThreadGenerator';
import { 
  MessageSquare, 
  Copy, 
  Check, 
  Sparkles, 
  Share2, 
  Send
} from 'lucide-react';

interface TwitterStudioProps {
  analysis: ProjectAnalysis | null;
}

export const TwitterStudio: React.FC<TwitterStudioProps> = ({ analysis }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const thread: TweetItem[] = analysis
    ? generateTwitterThread(analysis)
    : [];

  const handleCopyTweet = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const fullThreadText = thread.map((t) => t.text).join('\n\n---\n\n');
    navigator.clipboard.writeText(fullThreadText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-sky-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-sky-400" />
            <h1 className="text-xl font-extrabold text-white">X (Twitter) 5-Tweet Viral Thread Studio</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Cross-promote your repository launch with a 5-tweet viral thread complete with emojis, tech stack breakdowns, and repo links.
          </p>
        </div>

        <button
          onClick={handleCopyAll}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-neon transition-all shrink-0"
        >
          {copiedAll ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copiedAll ? 'Entire Thread Copied!' : 'Copy Full Thread'}</span>
        </button>
      </div>

      {/* Tweet Thread List */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {thread.map((tweet) => (
          <div key={tweet.id} className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3 relative hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 font-mono">Tweet {tweet.id} of {thread.length}</span>
              <div className="flex items-center space-x-3 text-xs text-gray-400">
                <span>{tweet.charCount} / 280 chars</span>
                <button
                  onClick={() => handleCopyTweet(tweet.id, tweet.text)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium"
                >
                  {copiedId === tweet.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === tweet.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-100 font-sans leading-relaxed whitespace-pre-line bg-[#090d16] p-4 rounded-xl border border-gray-800/80">
              {tweet.text}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};
