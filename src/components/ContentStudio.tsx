import React, { useEffect, useMemo, useState } from 'react';
import type {
  AnalysisResult,
  Claim,
  ContentDraft,
  DraftStyle,
  PostLength,
  Verification,
} from '../types';
import { LinkedinIcon } from './Icons';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Wand2,
  Tag,
  Monitor,
  Smartphone,
  ImageIcon,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Info,
} from 'lucide-react';

interface ContentStudioProps {
  analysis: AnalysisResult | null;
  draft: ContentDraft | null;
  isGenerating: boolean;
  error: string | null;
  onGenerate: (style: DraftStyle, length: PostLength) => void;
  onVerify: (text: string) => Promise<Verification>;
  onNavigateToVisual: () => void;
}

const STYLES: Array<{ id: DraftStyle; label: string }> = [
  { id: 'professional', label: 'Professional' },
  { id: 'technical', label: 'Technical' },
  { id: 'storytelling', label: 'Storytelling' },
  { id: 'educational', label: 'Educational' },
  { id: 'innovation', label: 'Innovation' },
  { id: 'career', label: 'Career' },
  { id: 'concise', label: 'Concise' },
];

const LENGTHS: Array<{ id: PostLength; label: string }> = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
];

function claimStyles(status: Claim['status']): string {
  if (status === 'supported') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  if (status === 'rejected') return 'bg-red-500/15 text-red-300 border-red-500/30';
  return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
}

export const ContentStudio: React.FC<ContentStudioProps> = ({
  analysis,
  draft,
  isGenerating,
  error,
  onGenerate,
  onVerify,
  onNavigateToVisual,
}) => {
  const [body, setBody] = useState(draft?.body ?? '');
  const [hashtags, setHashtags] = useState<string[]>(draft?.hashtags ?? []);
  const [selectedStyle, setSelectedStyle] = useState<DraftStyle>(draft?.style ?? 'professional');
  const [selectedLength, setSelectedLength] = useState<PostLength>(draft?.length ?? 'medium');
  const [newHashtag, setNewHashtag] = useState('');
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [verification, setVerification] = useState<Verification | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    if (!draft) return;
    setBody(draft.body);
    setHashtags(draft.hashtags);
    setSelectedStyle(draft.style);
    setSelectedLength(draft.length);
    setVerification(null);
  }, [draft]);

  const evidenceById = useMemo(() => {
    const map = new Map<string, string>();
    analysis?.evidence.forEach((item) => map.set(item.id, `${item.path} — ${item.excerpt}`));
    return map;
  }, [analysis]);

  if (!analysis) {
    return (
      <div className="glass-panel p-12 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12">
        <FileText className="w-12 h-12 text-indigo-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No active repository analysis</h2>
        <p className="text-xs text-gray-400">
          Analyze a public GitHub repository first. Content is generated only from stored evidence
          for that analysis.
        </p>
      </div>
    );
  }

  const handleGenerate = (style: DraftStyle, length: PostLength) => {
    setSelectedStyle(style);
    setSelectedLength(length);
    onGenerate(style, length);
  };

  const handleCopyText = async () => {
    const tagText = hashtags.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)).join(' ');
    await navigator.clipboard.writeText(`${body}\n\n${tagText}`.trim());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLinkedIn = () => {
    window.open(
      'https://www.linkedin.com/feed/?shareActive=true',
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const result = await onVerify(body);
      setVerification(result);
    } catch (verifyFailure) {
      setVerification(null);
      setVerifyError(
        verifyFailure instanceof Error ? verifyFailure.message : 'Verification failed.',
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddHashtag = () => {
    const cleaned = newHashtag.trim().replace(/^#+/, '');
    if (!cleaned) return;
    if (!hashtags.some((tag) => tag.toLowerCase() === cleaned.toLowerCase())) {
      setHashtags((current) => [...current, cleaned]);
    }
    setNewHashtag('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-cyan-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-white">Grounded LinkedIn Content Studio</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Drafts are generated from the selected snapshot and checked against stored evidence.
            Publish from Visual Studio after connecting LinkedIn, or copy the text manually.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <button
            onClick={onNavigateToVisual}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs border border-gray-700 transition-all"
          >
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <span>Design banner & PDF</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-linkedin-blue to-cyan-600 hover:from-linkedin-hover hover:to-cyan-500 text-white font-bold text-xs shadow-neon-linkedin transition-all shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to clipboard' : 'Copy post'}</span>
          </button>

          <button
            onClick={handleOpenLinkedIn}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#0a66c2]/20 hover:bg-[#0a66c2]/30 text-linkedin-light font-semibold text-xs border border-linkedin-blue/40 transition-all"
            title="Opens LinkedIn in a new tab. No post is created automatically."
          >
            <LinkedinIcon className="w-4 h-4" />
            <span>Open LinkedIn</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start space-x-3">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          Publishing is optional and requires an explicit confirmation in Visual Studio. Copy the
          text or open LinkedIn to publish manually if no connection is configured.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start space-x-3 text-xs text-red-200">
          <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Draft settings
              </label>
              <button
                onClick={() => handleGenerate(selectedStyle, selectedLength)}
                disabled={isGenerating}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-bold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Generating…' : 'Regenerate draft'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleGenerate(style.id, selectedLength)}
                  disabled={isGenerating}
                  className={`py-2 rounded-lg text-[11px] font-bold transition-all border disabled:opacity-50 ${
                    selectedStyle === style.id
                      ? 'bg-indigo-600 text-white border-indigo-400'
                      : 'bg-[#090d16] text-gray-400 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {LENGTHS.map((length) => (
                <button
                  key={length.id}
                  onClick={() => handleGenerate(selectedStyle, length.id)}
                  disabled={isGenerating}
                  className={`py-2 rounded-lg text-[11px] font-bold capitalize transition-all border disabled:opacity-50 ${
                    selectedLength === length.id
                      ? 'bg-cyan-600 text-white border-cyan-400'
                      : 'bg-[#090d16] text-gray-400 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {length.label}
                </button>
              ))}
            </div>

            {draft && (
              <p className="text-[10px] text-gray-500 font-mono">
                Generator: {draft.generator}
                {draft.model ? ` · ${draft.model}` : ''} · draft ID {draft.id.slice(0, 8)}
              </p>
            )}
          </div>

          {draft?.hooks && draft.hooks.length > 0 && (
            <div className="glass-card p-4 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2">
                <Wand2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Opening options
                </span>
              </div>
              <div className="space-y-2">
                {draft.hooks.map((hook, index) => (
                  <button
                    key={`${hook}-${index}`}
                    onClick={() => {
                      const paragraphs = body.split('\n\n');
                      paragraphs[0] = hook;
                      setBody(paragraphs.join('\n\n'));
                      setVerification(null);
                    }}
                    className="w-full text-left p-3 rounded-xl text-xs transition-all border bg-[#090d16] text-gray-300 border-gray-800 hover:border-indigo-500/30"
                  >
                    <span className="text-[10px] font-bold uppercase text-indigo-400 block mb-1">
                      Option {index + 1}
                    </span>
                    {hook}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Post body (editable)
              </label>
              <div className="flex items-center space-x-3 text-xs text-gray-400">
                <span className={body.length > 2900 ? 'text-red-400' : ''}>
                  {body.length} / 2900
                </span>
                <button
                  onClick={handleCopyText}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={14}
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                setVerification(null);
              }}
              disabled={isGenerating}
              className="w-full p-4 bg-[#090d16] border border-gray-700/80 rounded-xl text-xs text-slate-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-y disabled:opacity-60"
            />

            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-[10px] text-gray-500">
                Editing is local. Verify after edits to check numbers, URLs, first-person voice, and
                unsupported technology claims.
              </p>
              <button
                onClick={handleVerify}
                disabled={isVerifying || !body.trim()}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-700/60 hover:bg-emerald-700 disabled:opacity-50 text-emerald-100 text-[11px] font-bold border border-emerald-600/40"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isVerifying ? 'Checking…' : 'Verify against evidence'}</span>
              </button>
            </div>

            {verifyError && (
              <p className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-[11px] text-red-200">
                {verifyError}
              </p>
            )}

            {verification && (
              <div
                className={`p-3 rounded-lg border text-[11px] ${
                  verification.ok
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/40 border-red-500/40 text-red-200'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold">
                  {verification.ok ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>
                    {verification.ok
                      ? 'No blocked claims were detected.'
                      : `${verification.claims.length} issue(s) detected.`}
                  </span>
                </div>
                {verification.claims.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {verification.claims.map((claim, index) => (
                      <li key={`${claim.claim}-${index}`} className="leading-relaxed">
                        <span className="font-semibold">{claim.claim}</span>
                        <span className="block text-red-300/90">{claim.reason}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-purple-400" />
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Hashtags
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-xs text-indigo-300 font-medium"
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => setHashtags((current) => current.filter((item) => item !== tag))}
                    className="text-gray-400 hover:text-red-400 font-bold ml-1"
                    aria-label={`Remove #${tag}`}
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
                onChange={(event) => setNewHashtag(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleAddHashtag()}
                placeholder="Add hashtag"
                className="flex-1 px-3 py-1.5 bg-[#090d16] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAddHashtag}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          {draft && (draft.warnings.length > 0 || draft.claims.length > 0) && (
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                Claims & evidence
              </h3>

              {draft.warnings.length > 0 && (
                <div className="space-y-2">
                  {draft.warnings.map((warning) => (
                    <p
                      key={warning}
                      className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-200 leading-relaxed"
                    >
                      {warning}
                    </p>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {draft.claims.map((claim, index) => (
                  <div key={`${claim.claim}-${index}`} className="p-3 rounded-xl bg-[#090d16] border border-gray-800 text-[11px]">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-gray-200 leading-relaxed">{claim.claim}</p>
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase shrink-0 ${claimStyles(claim.status)}`}>
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{claim.reason}</p>
                    {claim.evidence_ids.length > 0 && (
                      <div className="mt-1.5 space-y-1">
                        {claim.evidence_ids.map((evidenceId) => (
                          <p key={evidenceId} className="text-[10px] font-mono text-indigo-300 break-words">
                            {evidenceId}: {evidenceById.get(evidenceId) ?? 'Evidence not found in result.'}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {draft.claims.length === 0 && (
                  <p className="text-[11px] text-gray-400">
                    This draft has no sentence-level evidence mapping. Re-run the automated verifier
                    before publishing.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-2">
              <LinkedinIcon className="w-4 h-4 text-linkedin-blue" />
              <span>LinkedIn post preview</span>
            </span>

            <div className="flex items-center space-x-1 bg-[#090d16] p-1 rounded-lg border border-gray-800">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded text-xs transition-all ${
                  previewMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Desktop view"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 rounded text-xs transition-all ${
                  previewMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Mobile view"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className={`mx-auto transition-all ${previewMode === 'mobile' ? 'max-w-xs' : 'w-full'}`}>
            <div className="bg-[#1b1f23] text-gray-200 rounded-xl border border-gray-700/80 shadow-2xl overflow-hidden font-sans">
              <div className="p-4 flex items-start space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                  You
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-white text-sm">Your profile</span>
                    <span className="text-xs text-gray-400">• Preview</span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">
                    Placeholder identity — no LinkedIn account is connected
                  </p>
                  <div className="flex items-center space-x-1 text-[10px] text-gray-400 mt-0.5">
                    <span>Draft</span>
                    <span>•</span>
                    <span>Public</span>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-3 text-xs leading-relaxed text-gray-200 whitespace-pre-line font-sans">
                {body || 'Generate a draft to preview the post body.'}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {hashtags.map((tag) => (
                    <span key={tag} className="text-linkedin-blue font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f1215] border-y border-gray-800 p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <span className="block text-xs font-bold text-gray-300">
                  Attach the exported banner or PDF carousel manually
                </span>
                <span className="text-[10px] text-gray-500">
                  Visual Studio creates a real PNG or PDF in this browser.
                </span>
              </div>

              <div className="px-4 py-3 flex items-center justify-between text-[10px] text-gray-500 border-b border-gray-800/80">
                <span>Engagement metrics are not available in this build.</span>
                <span>No simulated activity</span>
              </div>
            </div>
          </div>

          {draft?.cta && (
            <div className="glass-card p-4 rounded-2xl text-[11px] text-gray-300">
              <span className="font-bold text-white block mb-1">Call to action</span>
              {draft.cta}
            </div>
          )}

          <div className="glass-card p-4 rounded-2xl text-[11px] text-gray-400 space-y-1">
            <p className="font-bold text-white">Manual publishing checklist</p>
            <p>1. Verify the draft against evidence.</p>
            <p>2. Export media from Visual Studio.</p>
            <p>3. Copy the post and open LinkedIn.</p>
            <p>4. Review the final text and media before publishing.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
