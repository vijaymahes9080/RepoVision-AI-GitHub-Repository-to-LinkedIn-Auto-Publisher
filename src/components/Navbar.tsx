import React from 'react';
import type { ConfigStatus } from '../types';
import { Sparkles, Server, Cpu, RefreshCw, Settings2, Lock, CheckCircle2 } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';

interface NavbarProps {
  config: ConfigStatus | null;
  configError: string | null;
  activeRepoName?: string;
  isAnalyzing?: boolean;
  onOpenAdmin: () => void;
  onRefreshConfig: () => void;
}

function llmLabel(config: ConfigStatus): string {
  if (!config.llm_configured) {
    return 'No LLM · deterministic';
  }
  const provider = config.llm_provider.replace(/_/g, ' ');
  return config.llm_model ? `${provider} · ${config.llm_model}` : provider;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  configError,
  activeRepoName,
  isAnalyzing,
  onOpenAdmin,
  onRefreshConfig,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/80 backdrop-blur-md border-b border-gray-800/60 px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-[1px] shadow-neon shrink-0">
            <div className="w-full h-full bg-[#090d16] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse-slow" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight gradient-text">RepoVision</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                M2{config ? ` · v${config.app_version}` : ''}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium hidden sm:block">
              Evidence-first GitHub repository intelligence
            </p>
          </div>
        </div>

        {activeRepoName && (
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-xs text-indigo-200 shrink-0">
            {isAnalyzing ? (
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            ) : (
              <GithubIcon className="w-3.5 h-3.5 text-gray-300" />
            )}
            <span className="truncate max-w-[18rem]">
              {isAnalyzing ? 'Analyzing' : 'Snapshot'}:{' '}
              <strong className="text-white font-mono">{activeRepoName}</strong>
            </span>
          </div>
        )}

        <div className="flex items-center space-x-2 shrink-0">
          <div
            className={`hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
              config
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                : configError
                  ? 'bg-red-950/60 text-red-300 border-red-800/60'
                  : 'bg-gray-800/70 text-gray-400 border-gray-700'
            }`}
            title={configError ?? 'FastAPI backend status'}
          >
            <Server className="w-3.5 h-3.5" />
            <span>{config ? 'API online' : configError ? 'API offline' : 'Connecting…'}</span>
          </div>

          <div
            className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-cyan-950/50 text-cyan-300 text-[11px] font-semibold border border-cyan-800/50"
            title={config ? 'Configured LLM provider. Without one, drafts use the deterministic generator.' : 'Loading configuration'}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[14rem]">{config ? llmLabel(config) : 'LLM unknown'}</span>
          </div>

          <div
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-linkedin-blue/10 text-linkedin-light text-[11px] font-semibold border border-linkedin-blue/30"
            title={
              config?.linkedin_publishing_enabled
                ? 'LinkedIn publishing is enabled. Every post requires explicit confirmation.'
                : 'LinkedIn publishing is disabled until the server is configured and enabled.'
            }
          >
            <LinkedinIcon className="w-3.5 h-3.5 text-linkedin-blue" />
            <span className="flex items-center space-x-1">
              {config?.linkedin_publishing_enabled ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
              <span>{config?.linkedin_publishing_enabled ? 'Publishing on' : 'Publishing off'}</span>
            </span>
          </div>

          <button
            onClick={onRefreshConfig}
            className="p-2 rounded-lg bg-gray-900/80 hover:bg-gray-800 border border-gray-700/60 text-gray-300 transition-all"
            title="Refresh backend configuration"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAdmin}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-900/80 hover:bg-gray-800 border border-gray-700/60 transition-all text-xs font-semibold text-gray-200"
          >
            <Settings2 className="w-4 h-4 text-indigo-300" />
            <span className="hidden sm:inline">Runtime</span>
          </button>
        </div>
      </div>
    </header>
  );
};
