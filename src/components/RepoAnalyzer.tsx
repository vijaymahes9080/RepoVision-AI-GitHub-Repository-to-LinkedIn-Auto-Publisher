import React, { useState } from 'react';
import type { AnalysisResult, AnalysisRun, TechCategory, Technology } from '../types';
import { GithubIcon } from './Icons';
import {
  Search,
  Sparkles,
  Cpu,
  Layers,
  Code2,
  Star,
  GitFork,
  CheckCircle2,
  ArrowRight,
  Zap,
  Boxes,
  Database,
  Cloud,
  BrainCircuit,
  Wrench,
  XCircle,
  GitCommit,
  FileCode2,
  TestTube2,
  ShieldAlert,
  Info,
  ExternalLink,
} from 'lucide-react';

interface RepoAnalyzerProps {
  analysis: AnalysisResult | null;
  run: AnalysisRun | null;
  isStarting: boolean;
  error: string | null;
  onAnalyze: (repoUrl: string, branch?: string) => void;
  onNavigateToContent: () => void;
}

function categoryIcon(category: TechCategory) {
  switch (category) {
    case 'Frontend':
      return <Code2 className="w-3.5 h-3.5 text-cyan-400" />;
    case 'Backend':
      return <Cpu className="w-3.5 h-3.5 text-indigo-400" />;
    case 'Database':
      return <Database className="w-3.5 h-3.5 text-emerald-400" />;
    case 'Cloud/DevOps':
      return <Cloud className="w-3.5 h-3.5 text-blue-400" />;
    case 'AI/ML':
      return <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />;
    default:
      return <Wrench className="w-3.5 h-3.5 text-amber-400" />;
  }
}

const TechCard: React.FC<{ technology: Technology }> = ({ technology }) => (
  <div className="p-3 rounded-xl bg-[#090d16] border border-gray-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-2">
    <div className="flex items-center justify-between">
      {categoryIcon(technology.category)}
      <span className="text-[10px] font-bold text-indigo-300">
        {technology.confidence}% evidence
      </span>
    </div>
    <div>
      <span className="block text-xs font-bold text-white truncate">{technology.name}</span>
      <span className="text-[10px] text-gray-400">
        {technology.category}
        {technology.inferred ? ' · README mention only' : ''}
      </span>
    </div>
  </div>
);

export const RepoAnalyzer: React.FC<RepoAnalyzerProps> = ({
  analysis,
  run,
  isStarting,
  error,
  onAnalyze,
  onNavigateToContent,
}) => {
  const [repoUrl, setRepoUrl] = useState(analysis?.repo.url ?? '');
  const [branch, setBranch] = useState('');

  const isAnalyzing =
    isStarting || (run !== null && (run.status === 'queued' || run.status === 'running'));

  const handleAnalyze = () => {
    const target = repoUrl.trim();
    if (!target) return;
    onAnalyze(target, branch.trim() || undefined);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 lg:p-8 border border-indigo-500/20 bg-gradient-to-r from-[#0d1117] via-indigo-950/40 to-[#0d1117]">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Evidence-first static analysis</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Analyze a public GitHub repository
          </h1>
          <p className="text-xs lg:text-sm text-gray-300 leading-relaxed">
            RepoVision fetches a bounded snapshot of the repository, detects technologies from
            manifests, extracts documented features from the README, and links every finding to a
            stored evidence excerpt. Repository code is never executed.
          </p>
        </div>
      </div>

      <div className="glass-card p-5 lg:p-6 rounded-2xl space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
          Public GitHub repository URL
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <GithubIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleAnalyze()}
              placeholder="https://github.com/owner/repository"
              className="w-full pl-11 pr-4 py-3 bg-[#090d16] border border-gray-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !repoUrl.trim()}
            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-neon transition-all disabled:opacity-50 shrink-0"
          >
            {isAnalyzing ? (
              <>
                <Zap className="w-4 h-4 text-cyan-300 animate-spin" />
                <span>Analyzing…</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyze repository</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-[11px] text-gray-400 sm:w-32 shrink-0" htmlFor="branch-input">
            Branch (optional)
          </label>
          <input
            id="branch-input"
            type="text"
            value={branch}
            onChange={(event) => setBranch(event.target.value)}
            placeholder="Default branch"
            className="w-full sm:max-w-xs px-3 py-2 bg-[#090d16] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
          <button
            type="button"
            onClick={() => {
              setRepoUrl('https://github.com/tiangolo/fastapi');
              setBranch('');
            }}
            className="text-[11px] text-indigo-300 hover:text-cyan-300 text-left"
          >
            Use example URL
          </button>
        </div>

        <p className="text-[11px] text-gray-500 leading-relaxed">
          Only <span className="font-mono text-gray-400">https://github.com/owner/repo</span> is
          accepted. Private repositories are not supported. A server-side GitHub token raises the
          API rate limit; no token is ever sent to this browser.
        </p>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start space-x-3 text-xs text-red-200">
            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-white block font-bold">Repository analysis failed</strong>
              <p className="text-red-200 leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </div>

      {isAnalyzing && run && (
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/40 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
            <span>{run.stage}</span>
            <span className="font-mono">{run.progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.max(3, run.progress)}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400">
            Branch: <span className="font-mono text-gray-300">{run.branch ?? 'default'}</span>.
            Analysis runs on the server and is limited to the configured file and byte budgets.
          </p>
        </div>
      )}

      {analysis && !isAnalyzing && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                <GithubIcon className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white font-mono break-all">
                  {analysis.repo.owner}/{analysis.repo.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  Snapshot analyzed
                </span>
                {analysis.repo.archived && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
                    Archived
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                {analysis.summary.description || analysis.repo.description || 'No repository description was found.'}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-400 pt-1 flex-wrap">
                <span className="flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <strong className="text-white">{analysis.repo.stars.toLocaleString()}</strong> stars
                </span>
                <span className="flex items-center space-x-1">
                  <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                  <strong className="text-white">{analysis.repo.forks.toLocaleString()}</strong> forks
                </span>
                <span className="flex items-center space-x-1">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  <strong className="text-white">{analysis.repo.language ?? 'Unknown'}</strong>
                </span>
                <span className="flex items-center space-x-1 font-mono">
                  <GitCommit className="w-3.5 h-3.5 text-gray-400" />
                  {analysis.snapshot.commit_sha.slice(0, 8)} · {analysis.snapshot.branch}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={analysis.repo.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs border border-gray-700 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open GitHub</span>
              </a>
              <button
                onClick={onNavigateToContent}
                className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-neon transition-all"
              >
                <span>Content Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl">
              <span className="text-[11px] text-gray-400 block">Files in snapshot</span>
              <strong className="text-lg font-mono text-white">{analysis.metrics.file_count.toLocaleString()}</strong>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <span className="text-[11px] text-gray-400 block">Files analyzed</span>
              <strong className="text-lg font-mono text-white">{analysis.metrics.analyzed_file_count}</strong>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <span className="text-[11px] text-gray-400 block">Technologies detected</span>
              <strong className="text-lg font-mono text-white">{analysis.technologies.length}</strong>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <span className="text-[11px] text-gray-400 block">Evidence items</span>
              <strong className="text-lg font-mono text-white">{analysis.evidence.length}</strong>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Boxes className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                  Technology signals
                </h3>
              </div>
              <span className="text-[11px] text-gray-400">
                Manifest and configuration evidence only
              </span>
            </div>
            {analysis.technologies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {analysis.technologies.map((technology) => (
                  <TechCard key={technology.name} technology={technology} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No technologies were detected in the analyzed files.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Problem & solution</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#090d16] border border-red-500/20 space-y-1">
                  <span className="font-bold text-red-400 block">Problem statement</span>
                  <p className="text-gray-300 leading-relaxed">
                    {analysis.summary.problem_statement ||
                      'Not explicitly documented in the analyzed README. No problem statement was invented.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#090d16] border border-emerald-500/20 space-y-1">
                  <span className="font-bold text-emerald-400 block">Solution</span>
                  <p className="text-gray-300 leading-relaxed">
                    {analysis.summary.solution ||
                      'Not explicitly documented in the analyzed README. No solution was invented.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Documented features</span>
              </h3>

              <div className="space-y-2 text-xs">
                {analysis.features.length > 0 ? (
                  analysis.features.map((feature) => (
                    <div key={feature.title} className="flex items-start space-x-2.5 p-2 rounded-lg bg-[#090d16]/70">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-200 font-medium">{feature.title}</span>
                        <span className="block text-[10px] text-gray-500 font-mono">
                          {feature.evidence_ids.join(', ')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">
                    No feature list was found in the README. Features are not guessed from the
                    repository name.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-5 rounded-2xl space-y-3 md:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Inferred architecture</span>
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">{analysis.architecture.summary}</p>
              {analysis.architecture.components.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {analysis.architecture.components.map((component) => (
                    <div key={component.name} className="p-3 rounded-xl bg-[#090d16] border border-gray-800 text-xs">
                      <span className="font-bold text-white block">{component.name}</span>
                      <span className="text-gray-400 leading-relaxed">{component.role}</span>
                    </div>
                  ))}
                </div>
              )}
              {analysis.architecture.data_flow.length > 0 && (
                <div className="text-[11px] text-gray-400 space-y-1">
                  {analysis.architecture.data_flow.map((flow) => (
                    <p key={flow}>• {flow}</p>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-amber-300/80 flex items-center space-x-1">
                <Info className="w-3 h-3" />
                <span>Structural inference from manifests, not a runtime architecture review.</span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-5 rounded-2xl space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center space-x-2">
                  <TestTube2 className="w-4 h-4 text-emerald-400" />
                  <span>Testing & CI</span>
                </h3>
                <p className="text-xs text-gray-300">
                  Test files detected: <strong className="text-white">{analysis.testing.test_file_count}</strong>
                </p>
                <p className="text-xs text-gray-400">
                  {analysis.testing.frameworks.length > 0
                    ? analysis.testing.frameworks.join(', ')
                    : 'No test framework detected.'}
                </p>
                <p className="text-xs text-gray-400">
                  {analysis.testing.ci_systems.length > 0
                    ? analysis.testing.ci_systems.join(', ')
                    : 'No CI configuration detected.'}
                </p>
                <p className="text-[10px] text-amber-300/80">Tests were not executed.</p>
              </div>

              <div className="glass-card p-5 rounded-2xl space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Security review</span>
                </h3>
                <p className="text-xs text-gray-300">
                  Static review items: <strong className="text-white">{analysis.security.findings.length}</strong>
                </p>
                <p className="text-xs text-gray-400">
                  License: {analysis.security.license ?? 'not detected'}
                </p>
                <p className="text-[10px] text-gray-500">
                  Dependency scan: {analysis.security.dependency_scan.status.replace('_', ' ')}. No
                  CVE count or security grade is produced.
                </p>
              </div>
            </div>
          </div>

          {analysis.api_endpoints.length > 0 && (
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center space-x-2">
                <FileCode2 className="w-4 h-4 text-purple-400" />
                <span>Route declarations detected</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.api_endpoints.map((endpoint) => (
                  <span
                    key={endpoint}
                    className="px-2.5 py-1 rounded-lg bg-[#090d16] border border-gray-800 text-[11px] font-mono text-cyan-300"
                  >
                    {endpoint}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center space-x-2">
                <FileCode2 className="w-4 h-4 text-indigo-400" />
                <span>Evidence index</span>
              </h3>
              <span className="text-[10px] text-gray-500">
                Commit {analysis.snapshot.commit_sha.slice(0, 8)} · excerpts are redacted and capped
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {analysis.evidence.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-[#090d16] border border-gray-800 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-[10px] text-gray-500 font-mono">
                    <span className="text-indigo-300">
                      {item.id} · {item.category}
                    </span>
                    <span>
                      {item.path}
                      {item.line_start ? `:${item.line_start}` : ''}
                    </span>
                    <span>{item.confidence}%</span>
                  </div>
                  <p className="text-gray-300 font-mono text-[11px] leading-relaxed mt-1 whitespace-pre-wrap break-words">
                    {item.excerpt}
                  </p>
                </div>
              ))}
              {analysis.evidence.length === 0 && (
                <p className="text-xs text-gray-400">No evidence items were stored for this snapshot.</p>
              )}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center space-x-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Limitations</span>
            </h3>
            <ul className="space-y-2 text-[11px] text-gray-300 leading-relaxed">
              {analysis.limitations.map((limitation) => (
                <li key={limitation} className="flex items-start space-x-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-gray-500 font-mono">
              Engine: {analysis.provenance.analysis_engine} · LLM used:{' '}
              {analysis.provenance.llm_used ? analysis.provenance.model : 'no'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
