import React from 'react';
import type { ConfigStatus } from '../types';
import {
  Rocket,
  FileText,
  Palette,
  Video,
  Calendar,
  BarChart3,
  Plug,
  KeyRound,
  Globe,
  ShieldCheck,
  MessageSquare,
  BookOpen,
  Briefcase,
  Sparkles,
  ChevronRight,
  Lock,
} from 'lucide-react';

export type TabType =
  | 'analyzer'
  | 'content'
  | 'visual'
  | 'video'
  | 'blog'
  | 'twitter'
  | 'resume'
  | 'portfolio'
  | 'security'
  | 'scheduler'
  | 'analytics'
  | 'integrations'
  | 'admin';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  hasAnalysis: boolean;
  hasDraft: boolean;
  config: ConfigStatus | null;
  configError: string | null;
}

interface MenuItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
  badgeStyle?: string;
  planned?: boolean;
}

const WORKFLOW_ITEMS: MenuItem[] = [
  { id: 'analyzer', label: 'Repo Analyzer', icon: Rocket },
  { id: 'content', label: 'Content Studio', icon: FileText },
  { id: 'visual', label: 'Visual Studio', icon: Palette },
  { id: 'security', label: 'Security & License', icon: ShieldCheck },
];

const PLANNED_ITEMS: MenuItem[] = [
  { id: 'video', label: 'Video Short Studio', icon: Video, badge: 'M2', planned: true },
  { id: 'blog', label: 'Blog Export', icon: BookOpen, badge: 'M2', planned: true },
  { id: 'twitter', label: 'X Thread Builder', icon: MessageSquare, badge: 'M2', planned: true },
  { id: 'resume', label: 'Resume Bullets', icon: Briefcase, badge: 'M2', planned: true },
  { id: 'portfolio', label: 'Portfolio Builder', icon: Globe, badge: 'M2', planned: true },
  { id: 'scheduler', label: 'Scheduler & Queue', icon: Calendar, badge: 'M2', planned: true },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: 'M2', planned: true },
];

const SYSTEM_ITEMS: MenuItem[] = [
  { id: 'integrations', label: 'Integrations & Preflight', icon: Plug },
  { id: 'admin', label: 'Runtime & Config', icon: KeyRound },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  hasAnalysis,
  hasDraft,
  config,
  configError,
}) => {
  const workflowItems = WORKFLOW_ITEMS.map((item) => {
    if (item.id === 'analyzer') {
      return { ...item, badge: hasAnalysis ? 'Ready' : 'Start', badgeStyle: 'bg-indigo-500/20 text-indigo-300' };
    }
    if (item.id === 'content') {
      return {
        ...item,
        badge: hasDraft ? 'Ready' : hasAnalysis ? 'Pending' : null,
        badgeStyle: 'bg-cyan-500/20 text-cyan-300',
      };
    }
    if (item.id === 'visual' || item.id === 'security') {
      return {
        ...item,
        badge: hasAnalysis ? 'Snapshot' : null,
        badgeStyle: 'bg-purple-500/20 text-purple-300',
      };
    }
    return item;
  });

  const renderItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
          isActive
            ? 'bg-gradient-to-r from-indigo-600/90 to-cyan-600/80 text-white shadow-neon border border-indigo-400/30 font-semibold'
            : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60'
        }`}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <Icon
            className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
              isActive ? 'text-white' : item.planned ? 'text-gray-500' : 'text-gray-400'
            }`}
          />
          <span className="truncate">{item.label}</span>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {item.badge && (
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                item.badgeStyle ?? 'bg-gray-800 text-gray-500'
              }`}
            >
              {item.badge}
            </span>
          )}
          {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-200" />}
        </div>
      </button>
    );
  };

  return (
    <aside className="w-full md:w-64 bg-[#0d1117]/90 border-r border-gray-800/80 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
          <span>Workflow</span>
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        </div>

        <nav className="space-y-1.5">{workflowItems.map(renderItem)}</nav>

        <div>
          <div className="px-3 py-1 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
            <span>Planned modules</span>
            <Lock className="w-3 h-3 text-gray-600" />
          </div>
          <nav className="space-y-1.5">{PLANNED_ITEMS.map(renderItem)}</nav>
        </div>

        <div>
          <div className="px-3 py-1 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            System
          </div>
          <nav className="space-y-1.5">{SYSTEM_ITEMS.map(renderItem)}</nav>
        </div>
      </div>

      <div className="mt-8 p-3.5 rounded-2xl glass-card border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 to-slate-900/80 space-y-2">
        <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Evidence-first M1</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Static snapshot analysis. Repository code is never executed, and no engagement or
          security metrics are invented.
        </p>
        <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-gray-500">
          <span>
            {config
              ? `API connected · ${config.database}`
              : configError
                ? 'API offline'
                : 'Connecting to API…'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              config ? 'bg-emerald-400' : configError ? 'bg-red-400' : 'bg-amber-400'
            }`}
          />
        </div>
        <p className="text-[10px] text-gray-500">LinkedIn publishing is disabled in M1.</p>
      </div>
    </aside>
  );
};
