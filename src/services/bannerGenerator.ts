import type { AnalysisResult, BannerConfig, BannerTheme } from '../types';

export const BANNER_THEMES: Array<{
  id: BannerTheme;
  name: string;
  bg: string;
  border: string;
  accent: string;
}> = [
  {
    id: 'glassmorphism',
    name: 'Glassmorphism Cyber',
    bg: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-cyan-950',
    border: 'border-indigo-500/30',
    accent: 'from-indigo-400 via-cyan-300 to-emerald-300',
  },
  {
    id: 'linkedin-pro',
    name: 'LinkedIn Professional',
    bg: 'bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950',
    border: 'border-blue-500/30',
    accent: 'from-blue-300 via-cyan-200 to-sky-300',
  },
  {
    id: 'modern-startup',
    name: 'Modern Startup',
    bg: 'bg-gradient-to-br from-purple-950 via-slate-900 to-pink-950',
    border: 'border-purple-500/30',
    accent: 'from-purple-300 via-pink-300 to-rose-300',
  },
  {
    id: 'dark-cyber',
    name: 'Dark Cyber Obsidian',
    bg: 'bg-gradient-to-br from-black via-slate-950 to-emerald-950',
    border: 'border-emerald-500/30',
    accent: 'from-emerald-300 via-cyan-300 to-teal-300',
  },
  {
    id: 'minimal-corporate',
    name: 'Minimal Corporate',
    bg: 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900',
    border: 'border-slate-600/60',
    accent: 'from-slate-100 via-indigo-200 to-cyan-200',
  },
];

function shorten(text: string, limit: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit - 1).replace(/[\s,.;:]+$/, '')}…`;
}

export function getDefaultBannerConfig(analysis: AnalysisResult): BannerConfig {
  const documented = analysis.summary.description || analysis.repo.description || '';
  const subtitle =
    shorten(documented, 170) ||
    'A static repository snapshot with evidence linked to manifests, configuration, and README content.';

  return {
    theme: 'glassmorphism',
    titleText: `${analysis.repo.owner}/${analysis.repo.name}`,
    subtitleText: subtitle,
    badgeList: analysis.technologies.slice(0, 4).map((technology) => technology.name),
    showStats: true,
    starCount: analysis.repo.stars,
    forkCount: analysis.repo.forks,
    customLogoText: 'GitHub snapshot',
  };
}
