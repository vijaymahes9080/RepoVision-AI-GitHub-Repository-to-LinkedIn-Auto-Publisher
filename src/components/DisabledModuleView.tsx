import React from 'react';
import {
  Video,
  BookOpen,
  MessageSquare,
  Briefcase,
  Globe,
  Calendar,
  BarChart3,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';

interface PlannedModule {
  title: string;
  summary: string;
  reason: string;
  requirements: string[];
  alternative: string;
}

const PLANNED_MODULES: Record<string, PlannedModule> = {
  video: {
    title: 'Video Short Studio',
    summary: 'Generate a short video script and a rendered clip from a repository snapshot.',
    reason:
      'RepoVision has no video rendering, text-to-speech, or media storage pipeline. A real clip needs a background render worker, object storage, and licensed voice or stock assets.',
    requirements: [
      'Background render worker with job status and retries',
      'Object storage with signed download URLs',
      'Licensed text-to-speech and media assets',
      'Human review before any clip is published',
    ],
    alternative:
      'Use the Carousel PDF or Banner PNG from Visual Studio and attach it to a manually published post.',
  },
  blog: {
    title: 'Blog Export',
    summary: 'Turn a repository snapshot into a long-form article for Dev.to or Medium.',
    reason:
      'RepoVision does not integrate with blogging platforms and does not store their API tokens. Both platforms require app registration and token handling that is out of scope for this milestone.',
    requirements: [
      'Platform app registration and approved API access',
      'Server-side token storage with encryption',
      'Draft preview and explicit publish confirmation',
      'Markdown export tests against each platform format',
    ],
    alternative:
      'Copy the grounded draft from Content Studio and adapt it manually in your editor.',
  },
  twitter: {
    title: 'X Thread Builder',
    summary: 'Split a repository summary into a multi-post thread and publish it to X.',
    reason:
      'X API access is a separate paid integration with its own OAuth flow. RepoVision does not collect X credentials and does not post to X.',
    requirements: [
      'X developer app with approved API tier',
      'OAuth 2.0 with PKCE and server-side token storage',
      'Thread splitting that respects per-post limits',
      'Rate-limit handling and publish confirmation',
    ],
    alternative:
      'Use the Content Studio draft and post it manually. RepoVision does not simulate cross-posting.',
  },
  resume: {
    title: 'Resume Bullets',
    summary: 'Generate resume bullets describing your contribution to a repository.',
    reason:
      'Resume bullets assert authorship and impact that a public snapshot cannot verify. RepoVision blocks first-person ownership claims by design, so this module cannot be implemented honestly yet.',
    requirements: [
      'Verified contributor identity through GitHub OAuth',
      'Evidence for impact claims, not just file presence',
      'Explicit user attestation for non-code contributions',
      'A separate review flow for personal claims',
    ],
    alternative:
      'Use the neutral, third-person snapshot summary in Content Studio as source material.',
  },
  portfolio: {
    title: 'Portfolio Builder',
    summary: 'Publish a hosted portfolio page generated from analyzed repositories.',
    reason:
      'RepoVision has no hosting or deployment target. Generating a page without a real publish destination would repeat the fake-success pattern this milestone removes.',
    requirements: [
      'A hosting provider and deployment credentials',
      'Page templates with accessibility checks',
      'Custom domain and TLS handling',
      'Explicit deploy confirmation and rollback',
    ],
    alternative:
      'Export the banner PNG and carousel PDF and use them in a portfolio you control.',
  },
  scheduler: {
    title: 'Scheduler & Queue',
    summary: 'Queue generated posts and publish them automatically at a chosen time.',
    reason:
      'Scheduling requires a durable job queue, retry handling, and a publish confirmation step. RepoVision publishes synchronously and does not schedule posts.',
    requirements: [
      'Approved LinkedIn Share on LinkedIn access',
      'Durable queue such as Celery or RQ with a broker',
      'Encrypted member token storage and rotation',
      'Cancel/edit windows plus failure notifications',
    ],
    alternative:
      'Follow the manual publishing checklist in Content Studio: verify, export, copy, and post.',
  },
  analytics: {
    title: 'Analytics & Insights',
    summary: 'Track impressions, engagement, and follower growth for published posts.',
    reason:
      'Analytics require LinkedIn API access, stored post identifiers, and real engagement data. RepoVision collects none of these, so no charts or growth numbers are shown.',
    requirements: [
      'LinkedIn analytics scopes and an approved app',
      'Stored post IDs mapped to published content',
      'A data retention and privacy policy',
      'Scheduled ingestion with failure monitoring',
    ],
    alternative:
      'LinkedIn provides native post analytics after you publish manually.',
  },
};

interface DisabledModuleViewProps {
  moduleId: string;
  onNavigateToAnalyzer: () => void;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  video: Video,
  blog: BookOpen,
  twitter: MessageSquare,
  resume: Briefcase,
  portfolio: Globe,
  scheduler: Calendar,
  analytics: BarChart3,
};

export const DisabledModuleView: React.FC<DisabledModuleViewProps> = ({
  moduleId,
  onNavigateToAnalyzer,
}) => {
  const module = PLANNED_MODULES[moduleId];
  const Icon = ICONS[moduleId] ?? Lock;

  if (!module) {
    return (
      <div className="glass-panel p-10 rounded-2xl text-center space-y-3 max-w-xl mx-auto my-12">
        <Lock className="w-10 h-10 text-gray-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Module not available</h2>
        <p className="text-xs text-gray-400">
          This view is not part of the current build. No placeholder data is shown.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-amber-950/10 to-slate-900">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-amber-300" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h1 className="text-xl font-extrabold text-white">{module.title}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                Not yet available
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{module.summary}</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-5 rounded-2xl space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center space-x-2">
          <Info className="w-4 h-4 text-amber-400" />
          <span>Why this is disabled</span>
        </h2>
        <p className="text-xs text-gray-300 leading-relaxed">{module.reason}</p>
      </div>

      <div className="glass-card p-5 rounded-2xl space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-200">
          What a real implementation requires
        </h2>
        <ul className="space-y-2 text-xs text-gray-300">
          {module.requirements.map((requirement) => (
            <li key={requirement} className="flex items-start space-x-2">
              <span className="text-amber-400 mt-0.5">•</span>
              <span className="leading-relaxed">{requirement}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-card p-5 rounded-2xl space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
          What RepoVision provides instead
        </h2>
        <p className="text-xs text-gray-300 leading-relaxed">{module.alternative}</p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[11px] text-gray-500 max-w-md leading-relaxed">
          This module is visible so the product gap is explicit. It does not show sample charts,
          fabricated schedules, or simulated success states.
        </p>
        <button
          onClick={onNavigateToAnalyzer}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-neon transition-all"
        >
          <span>Back to Repo Analyzer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
