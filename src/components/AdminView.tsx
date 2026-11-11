import React from 'react';
import type { ConfigStatus } from '../types';
import { GithubIcon, LinkedinIcon } from './Icons';
import {
  KeyRound,
  RefreshCw,
  Server,
  Database,
  Cpu,
  CheckCircle2,
  XCircle,
  Info,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface AdminViewProps {
  config: ConfigStatus | null;
  configError: string | null;
  onRefresh: () => void;
}

function StatusBadge({ enabled, enabledLabel = 'Enabled', disabledLabel = 'Disabled' }: {
  enabled: boolean;
  enabledLabel?: string;
  disabledLabel?: string;
}) {
  return (
    <span
      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${
        enabled
          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          : 'bg-red-500/15 text-red-300 border-red-500/30'
      }`}
    >
      {enabled ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      <span>{enabled ? enabledLabel : disabledLabel}</span>
    </span>
  );
}

export const AdminView: React.FC<AdminViewProps> = ({ config, configError, onRefresh }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-indigo-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-extrabold text-white">Runtime & configuration</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
            Read-only view of the backend status. Secrets are configured through server environment
            variables and are never displayed here.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold border border-gray-700 transition-all shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh status</span>
        </button>
      </div>

      {configError && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start space-x-3 text-xs text-red-200">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-white block font-bold">Backend configuration unavailable</strong>
            <p className="leading-relaxed">{configError}</p>
            <p className="text-red-300/80 leading-relaxed">
              Start the FastAPI server from the {`backend/`} directory, then refresh.
            </p>
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-start space-x-3">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Never place API keys in frontend environment variables such as{' '}
          <span className="font-mono text-gray-200">VITE_*</span>. Anything built into the browser
          bundle is public. Server secrets belong in the backend environment only.
        </p>
      </div>

      {!config ? (
        <div className="glass-panel p-10 rounded-2xl text-center space-y-3">
          <Server className="w-10 h-10 text-gray-500 mx-auto" />
          <p className="text-sm font-semibold text-white">Waiting for backend configuration</p>
          <p className="text-xs text-gray-400">
            {configError
              ? 'The API could not be reached. See the error above.'
              : 'Loading status from the FastAPI backend…'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl space-y-1">
              <span className="text-[11px] text-gray-400 flex items-center space-x-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span>Application</span>
              </span>
              <strong className="block text-lg text-white font-mono">v{config.app_version}</strong>
              <span className="text-[10px] text-gray-500">
                Environment: {config.environment}
              </span>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-1">
              <span className="text-[11px] text-gray-400 flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Database</span>
              </span>
              <strong className="block text-lg text-white font-mono">{config.database}</strong>
              <span className="text-[10px] text-gray-500">Configured via DATABASE_URL</span>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-1">
              <span className="text-[11px] text-gray-400 flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Analysis engine</span>
              </span>
              <strong className="block text-lg text-white font-mono">
                {config.analysis_engine}
              </strong>
              <span className="text-[10px] text-gray-500">Deterministic, no code execution</span>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-1">
              <span className="text-[11px] text-gray-400 flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>LLM provider</span>
              </span>
              <strong className="block text-lg text-white font-mono">{config.llm_provider}</strong>
              <span className="text-[10px] text-gray-500">
                {config.llm_configured
                  ? `Configured${config.llm_model ? ` · ${config.llm_model}` : ''}`
                  : 'Not configured — deterministic drafts'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                Server-side credentials
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#090d16] border border-gray-800">
                  <span className="flex items-center space-x-2 text-gray-300">
                    <GithubIcon className="w-4 h-4 text-gray-400" />
                    <span>GitHub token</span>
                  </span>
                  <StatusBadge
                    enabled={config.github_token_configured}
                    enabledLabel="Configured"
                    disabledLabel="Not configured"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#090d16] border border-gray-800">
                  <span className="flex items-center space-x-2 text-gray-300">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>LLM credentials</span>
                  </span>
                  <StatusBadge
                    enabled={config.llm_configured}
                    enabledLabel="Configured"
                    disabledLabel="Not configured"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#090d16] border border-gray-800">
                  <span className="flex items-center space-x-2 text-gray-300">
                    <LinkedinIcon className="w-4 h-4 text-linkedin-blue" />
                    <span>LinkedIn credentials</span>
                  </span>
                  <StatusBadge
                    enabled={config.linkedin_configured}
                    enabledLabel="Present"
                    disabledLabel="Not present"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#090d16] border border-red-500/20">
                  <span className="flex items-center space-x-2 text-gray-300">
                    <LinkedinIcon className="w-4 h-4 text-red-400" />
                    <span>LinkedIn publishing</span>
                  </span>
                  <StatusBadge enabled={config.linkedin_publishing_enabled} />
                </div>
              </div>

              <p className="text-[10px] text-gray-500 leading-relaxed">
                Credential presence is reported as a boolean only. No secret value is returned by the
                API. LinkedIn publishing stays disabled in M1 even when credentials are present.
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                Capabilities
              </h3>
              <div className="space-y-2">
                {config.capabilities.map((capability) => (
                  <div
                    key={capability.id}
                    className="p-3 rounded-xl bg-[#090d16] border border-gray-800 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">{capability.label}</span>
                      <StatusBadge enabled={capability.enabled} />
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      {capability.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                CORS origins
              </h3>
              <div className="flex flex-wrap gap-2">
                {config.cors_origins.map((origin) => (
                  <span
                    key={origin}
                    className="px-2.5 py-1 rounded-lg bg-[#090d16] border border-gray-800 text-[11px] font-mono text-cyan-300"
                  >
                    {origin}
                  </span>
                ))}
                {config.cors_origins.length === 0 && (
                  <span className="text-xs text-gray-500">No origins configured.</span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Defined by the backend CORS_ORIGINS setting. Add the frontend origin for your
                deployment rather than allowing every origin.
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                Local commands
              </h3>
              <div className="space-y-2 text-[11px] font-mono">
                <p className="p-2.5 rounded-lg bg-[#090d16] border border-gray-800 text-gray-300 break-all">
                  cd backend && .venv\Scripts\python -m uvicorn app.main:app --reload
                </p>
                <p className="p-2.5 rounded-lg bg-[#090d16] border border-gray-800 text-gray-300 break-all">
                  npm run dev
                </p>
                <p className="p-2.5 rounded-lg bg-[#090d16] border border-gray-800 text-gray-300 break-all">
                  cd backend && .venv\Scripts\python -m pytest
                </p>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed flex items-start space-x-1.5">
                <Info className="w-3 h-3 shrink-0 mt-0.5" />
                <span>
                  The Vite dev server proxies <span className="font-mono">/api</span> to{' '}
                  <span className="font-mono">http://127.0.0.1:8000</span>. FastAPI interactive docs
                  are served at <span className="font-mono">/docs</span> while it runs.
                </span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
