import React, { useCallback, useEffect, useState } from 'react';
import type { ConfigStatus, LinkedInPreflight } from '../types';
import { getLinkedInPreflight } from '../api/client';
import { GithubIcon, LinkedinIcon } from './Icons';
import {
  Plug,
  ShieldCheck,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Server,
  Info,
} from 'lucide-react';

interface IntegrationsViewProps {
  config: ConfigStatus | null;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ config }) => {
  const [preflight, setPreflight] = useState<LinkedInPreflight | null>(null);
  const [preflightError, setPreflightError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadPreflight = useCallback(async () => {
    setIsLoading(true);
    setPreflightError(null);
    try {
      setPreflight(await getLinkedInPreflight());
    } catch (error) {
      setPreflight(null);
      setPreflightError(error instanceof Error ? error.message : 'Preflight failed.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPreflight();
  }, [loadPreflight]);

  const linkedInConfigured = preflight?.configured ?? config?.linkedin_configured ?? false;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-indigo-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <Plug className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-extrabold text-white">Integrations & preflight</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
            M1 reports server-side configuration only. It does not start OAuth, store member tokens
            in the browser, or publish to LinkedIn.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-950/60 border border-amber-700/60 text-xs font-semibold text-amber-200 shrink-0">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>No live connections</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-start space-x-3">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          API keys and tokens are configured through server environment variables. They are never
          entered in this UI, returned by the API, or stored in browser storage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
                <GithubIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">GitHub</h2>
                <p className="text-[11px] text-gray-400">Public repository reads</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              Read-only
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#090d16] border border-gray-800">
              <span className="text-gray-400">Server-side token</span>
              <span
                className={`font-bold ${
                  config?.github_token_configured ? 'text-emerald-300' : 'text-amber-300'
                }`}
              >
                {config
                  ? config.github_token_configured
                    ? 'Configured'
                    : 'Not configured'
                  : 'Unknown'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              {config?.github_token_configured
                ? 'A GitHub token is configured on the server, which raises the API rate limit. The browser never receives it.'
                : 'Without a token, GitHub applies the public rate limit. Only public repositories are supported; private repositories require a server-side token and are not part of M1.'}
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Language model (optional)</h2>
                <p className="text-[11px] text-gray-400">OpenAI-compatible API or Ollama</p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                config?.llm_configured
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                  : 'bg-gray-800 text-gray-400 border-gray-700'
              }`}
            >
              {config?.llm_configured ? 'Configured' : 'Deterministic fallback'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#090d16] border border-gray-800">
              <span className="text-gray-400">Provider</span>
              <span className="font-mono text-cyan-300">{config?.llm_provider ?? 'unknown'}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#090d16] border border-gray-800">
              <span className="text-gray-400">Model</span>
              <span className="font-mono text-gray-200">{config?.llm_model ?? 'none'}</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Configure <span className="font-mono text-gray-300">LLM_PROVIDER</span>,{' '}
              <span className="font-mono text-gray-300">OPENAI_API_KEY</span>, and{' '}
              <span className="font-mono text-gray-300">OPENAI_MODEL</span> on the server, or use
              Ollama with <span className="font-mono text-gray-300">OLLAMA_BASE_URL</span> and{' '}
              <span className="font-mono text-gray-300">OLLAMA_MODEL</span>. Without a provider,
              drafts use the deterministic evidence-linked generator.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl space-y-4 border border-linkedin-blue/20">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-linkedin-blue/15 border border-linkedin-blue/30 flex items-center justify-center">
              <LinkedinIcon className="w-5 h-5 text-linkedin-blue" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">LinkedIn</h2>
              <p className="text-[11px] text-gray-400">Configuration preflight only</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                linkedInConfigured
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-gray-800 text-gray-400 border-gray-700'
              }`}
            >
              {linkedInConfigured ? 'Credentials present' : 'Not configured'}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-bold">
              Publishing disabled
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#090d16] border border-gray-800 space-y-3">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-white">Required LinkedIn products</span>
            </div>
            <ul className="space-y-1.5 text-gray-300">
              {(preflight?.required_products ?? []).map((product) => (
                <li key={product} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{product}</span>
                </li>
              ))}
              {!preflight && <li className="text-gray-500">Loading preflight details…</li>}
            </ul>

            <div className="pt-2 border-t border-gray-800 space-y-1.5">
              <span className="font-bold text-white block">Required scopes</span>
              <div className="flex flex-wrap gap-1.5">
                {(preflight?.required_scopes ?? config?.linkedin_required_scopes ?? []).map(
                  (scope) => (
                    <span
                      key={scope}
                      className="px-2 py-0.5 rounded bg-linkedin-blue/15 text-linkedin-light border border-linkedin-blue/30 font-mono text-[10px]"
                    >
                      {scope}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#090d16] border border-gray-800 space-y-2">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">M2 implementation steps</span>
            </div>
            <ol className="space-y-1.5 text-gray-300 list-decimal list-inside">
              {(preflight?.steps ?? []).map((step) => (
                <li key={step} className="leading-relaxed">
                  {step}
                </li>
              ))}
              {!preflight && <li className="text-gray-500">Loading steps…</li>}
            </ol>
          </div>
        </div>

        {preflight?.note && (
          <p className="text-[11px] text-amber-200 bg-amber-950/30 border border-amber-500/20 rounded-xl p-3 leading-relaxed">
            {preflight.note}
          </p>
        )}

        {preflightError && (
          <p className="text-[11px] text-red-200 bg-red-950/40 border border-red-500/30 rounded-xl p-3 leading-relaxed flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{preflightError}</span>
          </p>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-[10px] text-gray-500 max-w-lg leading-relaxed">
            Real posting requires an approved LinkedIn app, an HTTPS callback, member OAuth with
            state and PKCE, and encrypted server-side token storage. None of that is implemented in
            M1.
          </p>
          <button
            onClick={() => void loadPreflight()}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-xs font-semibold border border-gray-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Checking…' : 'Re-run preflight'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
