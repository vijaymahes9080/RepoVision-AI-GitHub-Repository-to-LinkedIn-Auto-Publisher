import React, { useState } from 'react';
import type { ConfigStatus } from '../types';
import {
  Rocket,
  FileText,
  Palette,
  Plug,
  ShieldCheck,
  Video,
  Calendar,
  BarChart3,
  Globe,
  MessageSquare,
  BookOpen,
  Briefcase,
  ChevronRight,
  ChevronDown,
  Sparkles,
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

const PRIMARY_ITEMS: MenuItem[] = [
  { id: 'analyzer', label: 'Repo Analyzer', icon: Rocket },
  { id: 'content', label: 'Content Studio', icon: FileText },
  { id: 'visual', label: 'Visual Studio & Publish', icon: Palette },
  { id: 'integrations', label: 'Integrations & Keys', icon: Plug },
  { id: 'security', label: 'Security & Audit', icon: ShieldCheck },
];

const PLANNED_ITEMS: MenuItem[] = [
  { id: 'video', label: 'Video Short Studio', icon: Video, badge: 'M3+' },
  { id: 'blog', label: 'Blog Export', icon: BookOpen, badge: 'M3' },
  { id: 'twitter', label: 'X Thread Builder', icon: MessageSquare, badge: 'M3' },
  { id: 'scheduler', label: 'Scheduler & Queue', icon: Calendar, badge: 'M3' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: 'M3' },
  { id: 'resume', label: 'Resume Bullets', icon: Briefcase, badge: 'Later' },
  { id: 'portfolio', label: 'Portfolio Builder', icon: Globe, badge: 'Later' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  hasAnalysis,
  hasDraft,
  config,
  configError,
}) => {
  const [showRoadmap, setShowRoadmap] = useState(false);

  const workflowItems = PRIMARY_ITEMS.map((item) => {
    if (item.id === 'analyzer') {
      return {
        ...item,
        badge: hasAnalysis ? 'Active' : 'Start',
        badgeStyle: hasAnalysis
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
      };
    }
    if (item.id === 'content') {
      return {
        ...item,
        badge: hasDraft ? 'Draft ready' : hasAnalysis ? 'Pending' : null,
        badgeStyle: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300',
      };
    }
    if (item.id === 'visual') {
      return {
        ...item,
        badge: hasAnalysis ? 'Ready' : null,
        badgeStyle: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
      };
    }
    if (item.id === 'integrations') {
      return {
        ...item,
        badge: config?.linkedin_publishing_enabled ? 'Connected' : 'Setup',
        badgeStyle: config?.linkedin_publishing_enabled
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
      };
    }
    return item;
  });

  const renderItem = (item: MenuItem, isPlanned = false) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all group ${
          isActive
            ? 'bg-indigo-600 text-white shadow-sm font-semibold'
            : isPlanned
              ? 'text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800/50'
              : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800/60 font-medium'
        }`}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <Icon
            className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
              isActive
                ? 'text-white'
                : isPlanned
                  ? 'text-slate-400 dark:text-gray-500'
                  : 'text-slate-500 dark:text-gray-400'
            }`}
          />
          <span className="truncate">{item.label}</span>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {item.badge && (
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                item.badgeStyle ?? 'bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {item.badge}
            </span>
          )}
          {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
        </div>
      </button>
    );
  };

  return (
    <aside className="w-full md:w-64 bg-white/70 dark:bg-[#0d1117]/90 backdrop-blur-md border-r border-slate-200 dark:border-gray-800/80 p-4 flex flex-col justify-between shrink-0 transition-colors">
      <div className="space-y-6">
        <div>
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400 flex items-center justify-between">
            <span>Core Workflow</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          </div>
          <nav className="space-y-1 mt-1">{workflowItems.map((item) => renderItem(item))}</nav>
        </div>

        {/* Collapsible Roadmap Modules */}
        <div className="border-t border-slate-100 dark:border-gray-800/60 pt-4">
          <button
            onClick={() => setShowRoadmap((prev) => !prev)}
            className="w-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-400 flex items-center justify-between rounded-lg transition-colors"
          >
            <span>Roadmap & Labs</span>
            {showRoadmap ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
          {showRoadmap && (
            <nav className="space-y-1 mt-1 animate-fadeIn">
              {PLANNED_ITEMS.map((item) => renderItem(item, true))}
            </nav>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-gray-800 space-y-2">
        <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-cyan-400" />
          <span>Evidence-First Publishing</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed">
          Static snapshot analysis. Grounded draft verification before publishing to LinkedIn.
        </p>
        <div className="pt-2 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-gray-500">
          <span>
            {config
              ? `API Online · ${config.database}`
              : configError
                ? 'API Offline'
                : 'Connecting…'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              config ? 'bg-emerald-500' : configError ? 'bg-red-500' : 'bg-amber-500'
            }`}
          />
        </div>
      </div>
    </aside>
  );
};
