import React from 'react';
import type { AnalysisResult } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Info,
  ScanLine,
  Scale,
  ShieldAlert,
} from 'lucide-react';

interface SecurityViewProps {
  analysis: AnalysisResult | null;
}

function severityStyle(severity: string): string {
  if (severity === 'high') return 'bg-red-500/15 text-red-300 border-red-500/40';
  if (severity === 'medium') return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
  return 'bg-slate-500/15 text-slate-300 border-slate-500/40';
}

export const SecurityView: React.FC<SecurityViewProps> = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="glass-panel p-12 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12">
        <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No snapshot to review</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          Analyze a public GitHub repository first. Security and license signals are derived only
          from the stored snapshot; no scores or CVE counts are generated.
        </p>
      </div>
    );
  }

  const { security } = analysis;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-emerald-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-extrabold text-white">Security & license signals</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
            Static pattern matching over the bounded snapshot: credential-like strings, risky code
            patterns, committed environment files, and license detection.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-950/60 border border-amber-700/60 text-xs font-semibold text-amber-200 shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Not a vulnerability assessment</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start space-x-3">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          M1 does not compute a security grade or score, does not run a dependency vulnerability
          scan, and does not report CVE counts. Pattern matches are review prompts, not confirmed
          vulnerabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-xs text-gray-400 flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Static review items</span>
          </span>
          <span className="block text-2xl font-extrabold text-white font-mono">
            {security.findings.length}
          </span>
          <span className="text-[10px] text-gray-500">Pattern matches requiring maintainer review</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-xs text-gray-400 flex items-center space-x-1.5">
            <Scale className="w-3.5 h-3.5 text-purple-400" />
            <span>Detected license</span>
          </span>
          <span className="block text-lg font-bold text-purple-300 mt-1">
            {security.license ?? 'Not detected'}
          </span>
          <span className="text-[10px] text-gray-500">From license file or GitHub metadata</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-xs text-gray-400 flex items-center space-x-1.5">
            <ScanLine className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dependency scan</span>
          </span>
          <span className="block text-lg font-bold text-cyan-300 mt-1 capitalize">
            {security.dependency_scan.status.replace('_', ' ')}
          </span>
          <span className="text-[10px] text-gray-500">
            No vulnerability count is available
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-xs text-gray-400 flex items-center space-x-1.5">
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Files scanned</span>
          </span>
          <span className="block text-2xl font-extrabold text-white font-mono">
            {security.scanned_files}
          </span>
          <span className="text-[10px] text-gray-500">
            Commit {analysis.snapshot.commit_sha.slice(0, 8)}
          </span>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <span>Static review items</span>
          </h3>
          <span className="text-[10px] text-gray-500">
            Repository code was not executed
          </span>
        </div>

        {security.findings.length === 0 ? (
          <p className="text-xs text-gray-400 leading-relaxed">
            No pattern matches were found in the analyzed files. This does not mean the repository
            is free of vulnerabilities; the scan is intentionally narrow.
          </p>
        ) : (
          <div className="space-y-3">
            {security.findings.map((finding) => (
              <div
                key={finding.id}
                className="p-4 rounded-xl bg-[#090d16] border border-gray-800 space-y-2"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center space-x-2 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold text-white text-xs">{finding.title}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${severityStyle(
                        finding.severity,
                      )}`}
                    >
                      {finding.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px] font-mono">
                      {finding.category}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">{finding.description}</p>

                {finding.path && (
                  <p className="text-[10px] text-indigo-300 font-mono break-all">{finding.path}</p>
                )}

                <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                  Recommendation: {finding.recommendation}
                </p>

                {finding.evidence_ids.length > 0 && (
                  <p className="text-[10px] text-gray-500 font-mono">
                    Evidence: {finding.evidence_ids.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center space-x-2">
          <Info className="w-4 h-4 text-amber-400" />
          <span>Limitations</span>
        </h3>
        <ul className="space-y-2 text-[11px] text-gray-300 leading-relaxed">
          {security.limitations.map((limitation) => (
            <li key={limitation} className="flex items-start space-x-2">
              <span className="text-amber-400 mt-0.5">•</span>
              <span>{limitation}</span>
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          Dependency scan reason: {security.dependency_scan.reason}
        </p>
        {security.license_evidence_ids.length > 0 && (
          <p className="text-[10px] text-gray-500 font-mono">
            License evidence: {security.license_evidence_ids.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};
