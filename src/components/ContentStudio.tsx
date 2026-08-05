import React, { useState } from 'react';
import { GeneratedContent, PostLength, User } from '../types';
import { LinkedinIcon } from './Icons';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  ThumbsUp, 
  MessageSquare, 
  Repeat, 
  Send, 
  Globe, 
  ArrowRight,
  Wand2,
  Tag,
  Monitor,
  Smartphone,
  ImageIcon
} from 'lucide-react';

interface ContentStudioProps {
  content: GeneratedContent | null;
  onUpdateContent: (content: GeneratedContent) => void;
  user: User;
  onNavigateToVisual: () => void;
  onNavigateToScheduler: () => void;
}

export const ContentStudio: React.FC<ContentStudioProps> = ({
  content,
  onUpdateContent,
  user,
  onNavigateToVisual,
  onNavigateToScheduler
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [newHashtag, setNewHashtag] = useState('');

  if (!content) {
    return (
      <div className="glass-panel p-12 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12">
        <FileText className="w-12 h-12 text-indigo-400 mx-auto animate-bounce" />
        <h2 className="text-xl font-bold text-white">No Active Repository Analysis</h2>
        <p className="text-xs text-gray-400">
          Please run a repository analysis in the Repo Analyzer tab first to generate your AI content suite.
        </p>
      </div>
    );
  }

  const getCurrentText = () => {
    if (content.customBodyText !== undefined) return content.customBodyText;
    if (content.selectedLength === 'short') return content.bodyShort;
    if (content.selectedLength === 'long') return content.bodyLong;
    return content.bodyMedium;
  };

  const handleLengthChange = (length: PostLength) => {
    let newText = content.bodyMedium;
    if (length === 'short') newText = content.bodyShort;
    if (length === 'long') newText = content.bodyLong;

    onUpdateContent({
      ...content,
      selectedLength: length,
      customBodyText: newText,
    });
  };

  const handleHookSelect = (idx: number) => {
    const selectedHook = content.hooks[idx];
    const currentBody = getCurrentText();
    const lines = currentBody.split('\n');
    lines[0] = selectedHook;

    onUpdateContent({
      ...content,
      selectedHookIndex: idx,
      customBodyText: lines.join('\n'),
    });
  };

  const handleTextChange = (text: string) => {
    onUpdateContent({
      ...content,
      customBodyText: text,
    });
  };

  const handleAddHashtag = () => {
    if (!newHashtag.trim()) return;
    const tag = newHashtag.startsWith('#') ? newHashtag.trim() : `#${newHashtag.trim()}`;
    if (!content.hashtags.includes(tag)) {
      onUpdateContent({
        ...content,
        hashtags: [...content.hashtags, tag],
      });
    }
    setNewHashtag('');
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    onUpdateContent({
      ...content,
      hashtags: content.hashtags.filter((t) => t !== tagToRemove),
    });
  };

  const handleCopyText = () => {
    const textToCopy = `${getCurrentText()}\n\n${content.hashtags.join(' ')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-cyan-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-white">LinkedIn AI Content Studio</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Customize AI-generated post hooks, body copy, hashtags, and preview your post in authentic LinkedIn format.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateToVisual}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs border border-gray-700 transition-all"
          >
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <span>Design Banners & PDF</span>
          </button>

          <button
            onClick={onNavigateToScheduler}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-linkedin-blue to-indigo-600 hover:from-linkedin-hover hover:to-indigo-500 text-white font-bold text-xs shadow-neon-linkedin transition-all"
          >
            <LinkedinIcon className="w-4 h-4" />
            <span>Schedule / Publish</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: AI Post Controls & Editor (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Post Length Selector */}
          <div className="glass-card p-4 rounded-2xl space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
              Post Body Format & Length
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['short', 'medium', 'long'] as PostLength[]).map((len) => (
                <button
                  key={len}
                  onClick={() => handleLengthChange(len)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                    content.selectedLength === len
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-neon'
                      : 'bg-[#090d16] text-gray-400 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {len === 'short' ? '⚡ Short Hook' : len === 'medium' ? '📝 Medium Post' : '🔥 Deep Dive'}
                </button>
              ))}
            </div>
          </div>

          {/* AI Hook Selector */}
          <div className="glass-card p-4 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2">
              <Wand2 className="w-4 h-4 text-cyan-400" />
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                AI Hook Selector (High Conversion Hooks)
              </label>
            </div>

            <div className="space-y-2">
              {content.hooks.map((hook, idx) => (
                <button
                  key={idx}
                  onClick={() => handleHookSelect(idx)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all border ${
                    content.selectedHookIndex === idx
                      ? 'bg-indigo-950/60 text-cyan-300 border-indigo-500/60 font-semibold'
                      : 'bg-[#090d16] text-gray-300 border-gray-800 hover:border-indigo-500/30'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase text-indigo-400 block mb-1">
                    Option {idx + 1}
                  </span>
                  {hook}
                </button>
              ))}
            </div>
          </div>

          {/* Post Body Editor Textarea */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Post Body Text (Editable)
              </label>
              <div className="flex items-center space-x-3 text-xs text-gray-400">
                <span>{getCurrentText().length} chars</span>
                <button
                  onClick={handleCopyText}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={12}
              value={getCurrentText()}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full p-4 bg-[#090d16] border border-gray-700/80 rounded-xl text-xs text-slate-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-y"
            />
          </div>

          {/* Hashtags Manager */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-purple-400" />
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                AI Hashtag Suite ({content.hashtags.length} Tags)
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {content.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-xs text-indigo-300 font-medium"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveHashtag(tag)}
                    className="text-gray-400 hover:text-red-400 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHashtag()}
                placeholder="Add hashtag (e.g. #MachineLearning)"
                className="flex-1 px-3 py-1.5 bg-[#090d16] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAddHashtag}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* AI Image Generation Prompts */}
          <div className="glass-card p-5 rounded-2xl space-y-3 border border-purple-500/20">
            <div className="flex items-center space-x-2">
              <Wand2 className="w-4 h-4 text-purple-400" />
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-300">
                AI Image Generation Prompts (DALL-E / Midjourney)
              </label>
            </div>

            {content.aiImagePrompts.map((prompt, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#090d16] border border-gray-800 space-y-2 text-xs">
                <p className="text-gray-300 leading-relaxed font-mono text-[11px]">{prompt}</p>
                <button
                  onClick={() => handleCopyPrompt(prompt)}
                  className="flex items-center space-x-1 px-2 py-1 rounded bg-purple-950/80 hover:bg-purple-900 text-purple-300 text-[10px] font-semibold border border-purple-800/50"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedPrompt ? 'Prompt Copied!' : 'Copy DALL-E Prompt'}</span>
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: LinkedIn Live Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-2">
              <LinkedinIcon className="w-4 h-4 text-linkedin-blue" />
              <span>Live LinkedIn Post Preview</span>
            </span>

            <div className="flex items-center space-x-1 bg-[#090d16] p-1 rounded-lg border border-gray-800">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded text-xs transition-all ${
                  previewMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 rounded text-xs transition-all ${
                  previewMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className={`mx-auto transition-all ${previewMode === 'mobile' ? 'max-w-xs' : 'w-full'}`}>
            <div className="bg-[#1b1f23] text-gray-200 rounded-xl border border-gray-700/80 shadow-2xl overflow-hidden font-sans">
              
              <div className="p-4 flex items-start space-x-3">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border border-indigo-500/40 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-white text-sm hover:underline cursor-pointer">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-400">• 1st</span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">
                    Software Engineer & Open Source Author
                  </p>
                  <div className="flex items-center space-x-1 text-[10px] text-gray-400 mt-0.5">
                    <span>Just now</span>
                    <span>•</span>
                    <Globe className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="px-4 pb-3 text-xs leading-relaxed text-gray-200 whitespace-pre-line font-sans">
                {getCurrentText()}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {content.hashtags.map((tag) => (
                    <span key={tag} className="text-linkedin-blue font-semibold hover:underline cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f1215] border-y border-gray-800 p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <span className="block text-xs font-bold text-gray-300">
                  Media Attachment (Banner / 10-Slide PDF Carousel)
                </span>
                <span className="text-[10px] text-gray-500">
                  Design in Visual Studio tab to attach high-DPI assets
                </span>
              </div>

              <div className="px-4 py-2 flex items-center justify-between text-[11px] text-gray-400 border-b border-gray-800/80">
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 rounded-full bg-linkedin-blue flex items-center justify-center">
                    <ThumbsUp className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Vijay Mahes and 142 others</span>
                </div>
                <span>28 comments • 12 reposts</span>
              </div>

              <div className="px-2 py-1.5 grid grid-cols-4 gap-1 text-[11px] font-semibold text-gray-400 text-center">
                <button className="flex items-center justify-center space-x-1.5 p-2 rounded hover:bg-gray-800 transition-all">
                  <ThumbsUp className="w-4 h-4 text-gray-400" />
                  <span className="hidden sm:inline">Like</span>
                </button>
                <button className="flex items-center justify-center space-x-1.5 p-2 rounded hover:bg-gray-800 transition-all">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="hidden sm:inline">Comment</span>
                </button>
                <button className="flex items-center justify-center space-x-1.5 p-2 rounded hover:bg-gray-800 transition-all">
                  <Repeat className="w-4 h-4 text-gray-400" />
                  <span className="hidden sm:inline">Repost</span>
                </button>
                <button className="flex items-center justify-center space-x-1.5 p-2 rounded hover:bg-gray-800 transition-all">
                  <Send className="w-4 h-4 text-gray-400" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
