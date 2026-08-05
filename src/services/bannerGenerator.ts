import { BannerConfig, ProjectAnalysis } from '../types';

export function getDefaultBannerConfig(analysis: ProjectAnalysis): BannerConfig {
  return {
    theme: 'glassmorphism',
    titleText: analysis.repoName,
    subtitleText: analysis.solution.length > 90 ? `${analysis.solution.substring(0, 90)}...` : analysis.solution,
    badgeList: analysis.technologies.slice(0, 4).map((t) => t.name),
    primaryColor: '#6366f1',
    secondaryColor: '#06b6d4',
    showStats: true,
    starCount: analysis.stars,
    forkCount: analysis.forks,
    customLogoText: 'RepoVision AI',
  };
}

export const BANNER_THEMES = [
  {
    id: 'glassmorphism',
    name: 'Glassmorphism Cyber',
    bg: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-cyan-950',
    border: 'border-indigo-500/30',
    accent: 'from-indigo-500 to-cyan-400',
  },
  {
    id: 'linkedin-pro',
    name: 'LinkedIn Professional',
    bg: 'bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950',
    border: 'border-blue-500/30',
    accent: 'from-blue-400 to-cyan-300',
  },
  {
    id: 'modern-startup',
    name: 'Modern Startup',
    bg: 'bg-gradient-to-br from-purple-900 via-slate-900 to-pink-950',
    border: 'border-purple-500/30',
    accent: 'from-purple-400 to-pink-400',
  },
  {
    id: 'dark-cyber',
    name: 'Dark Cyber Obsidian',
    bg: 'bg-gradient-to-br from-black via-slate-950 to-emerald-950',
    border: 'border-emerald-500/30',
    accent: 'from-emerald-400 to-cyan-400',
  },
  {
    id: 'minimal-corporate',
    name: 'Minimal Corporate',
    bg: 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900',
    border: 'border-slate-700',
    accent: 'from-slate-200 to-indigo-300',
  },
];
