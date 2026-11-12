import React from 'react';
import type { ConfigStatus } from '../types';
import { Sparkles, Server, Cpu, RefreshCw, Settings2, Lock, CheckCircle2, Sun, Moon } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';

interface NavbarProps {
  config: ConfigStatus | null;
  configError: string | null;
  activeRepoName?: string;
  isAnalyzing?: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
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
  theme,
  onToggleTheme,
  onOpenAdmin,
  onRefreshConfig,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md border-b border-slate-200 dark:border-gray-800/60 px-4 lg:px-8 py-3 transition-all shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-[1px] shadow-sm shrink-0">
            <div className="w-full h-full bg-white dark:bg-[#090d16] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-cyan-400 animate-pulse-slow" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight gradient-text">RepoVision</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                M2{config ? ` · v${config.app_version}` : ''}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium hidden sm:block">
              Evidence-first GitHub repository intelligence
            </p>
          </div>
        </div>

        {activeRepoName && (
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/50 text-xs text-indigo-700 dark:text-indigo-200 shrink-0">
            {isAnalyzing ? (
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 animate-spin" />
            ) : (
              <GithubIcon className="w-3.5 h-3.5 text-slate-600 dark:text-gray-300" />
            )}
            <span className="truncate max-w-[18rem]">
              {isAnalyzing ? 'Analyzing' : 'Snapshot'}:{' '}
              <strong className="text-slate-900 dark:text-white font-mono">{activeRepoName}</strong>
            </span>
          </div>
        )}

        <div className="flex items-center space-x-2 shrink-0">
          <div
            className={`hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
              config
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                : configError
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60'
                  : 'bg-slate-100 dark:bg-gray-800/70 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-gray-700'
            }`}
            title={configError ?? 'FastAPI backend status'}
          >
            <Server className="w-3.5 h-3.5" />
            <span>{config ? 'API online' : configError ? 'API offline' : 'Connecting…'}</span>
          </div>

          <div
            className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-cyan-50 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 text-[11px] font-semibold border border-cyan-200 dark:border-cyan-800/50"
            title={config ? 'Configured LLM provider. Without one, drafts use the deterministic generator.' : 'Loading configuration'}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="truncate max-w-[14rem]">{config ? llmLabel(config) : 'LLM unknown'}</span>
          </div>

          <div
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-linkedin-blue/10 text-linkedin-blue dark:text-linkedin-light text-[11px] font-semibold border border-blue-200 dark:border-linkedin-blue/30"
            title={
              config?.linkedin_publishing_enabled
                ? 'LinkedIn publishing is enabled. Every post requires explicit confirmation.'
                : 'LinkedIn publishing is disabled until the server is configured and enabled.'
            }
          >
            <LinkedinIcon className="w-3.5 h-3.5 text-linkedin-blue" />
            <span className="flex items-center space-x-1">
              {config?.linkedin_publishing_enabled ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Lock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              )}
              <span>{config?.linkedin_publishing_enabled ? 'Publishing on' : 'Publishing off'}</span>
            </span>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 transition-all"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          <button
            onClick={onRefreshConfig}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 transition-all"
            title="Refresh backend configuration"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAdmin}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 transition-all text-xs font-semibold text-slate-700 dark:text-gray-200"
          >
            <Settings2 className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
            <span className="hidden sm:inline">Runtime</span>
          </button>
        </div>
      </div>
    </header>
  );
};
