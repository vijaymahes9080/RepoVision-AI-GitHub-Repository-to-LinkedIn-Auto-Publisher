import React from 'react';
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
  Sparkles,
  ChevronRight
} from 'lucide-react';

export type TabType = 'analyzer' | 'content' | 'visual' | 'video' | 'portfolio' | 'security' | 'twitter' | 'scheduler' | 'analytics' | 'integrations' | 'admin';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  hasAnalysis: boolean;
  scheduledCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  hasAnalysis,
  scheduledCount 
}) => {
  const menuItems = [
    {
      id: 'analyzer' as TabType,
      label: 'Repo Analyzer',
      icon: Rocket,
      badge: hasAnalysis ? 'Active' : 'Start',
      badgeStyle: hasAnalysis ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300',
    },
    {
      id: 'content' as TabType,
      label: 'Content Studio',
      icon: FileText,
      badge: hasAnalysis ? 'Ready' : null,
      badgeStyle: 'bg-cyan-500/20 text-cyan-300',
    },
    {
      id: 'visual' as TabType,
      label: 'Visual Studio',
      icon: Palette,
      badge: 'Banners & PDF',
      badgeStyle: 'bg-purple-500/20 text-purple-300',
    },
    {
      id: 'video' as TabType,
      label: 'Video Short Studio',
      icon: Video,
      badge: '30s AI',
      badgeStyle: 'bg-pink-500/20 text-pink-300',
    },
    {
      id: 'twitter' as TabType,
      label: 'X (Twitter) Thread',
      icon: MessageSquare,
      badge: '5 Tweets',
      badgeStyle: 'bg-sky-500/20 text-sky-300',
    },
    {
      id: 'portfolio' as TabType,
      label: 'AI Portfolio Builder',
      icon: Globe,
      badge: 'NEW',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      id: 'security' as TabType,
      label: 'Security & Quality',
      icon: ShieldCheck,
      badge: 'A+',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      id: 'scheduler' as TabType,
      label: 'Scheduler & Queue',
      icon: Calendar,
      badge: scheduledCount > 0 ? `${scheduledCount}` : null,
      badgeStyle: 'bg-blue-500/20 text-blue-300',
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytics & Insights',
      icon: BarChart3,
      badge: '+7.6%',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      id: 'integrations' as TabType,
      label: 'OAuth & Integrations',
      icon: Plug,
      badge: '2 Connected',
      badgeStyle: 'bg-amber-500/20 text-amber-300',
    },
    {
      id: 'admin' as TabType,
      label: 'API Keys & Admin',
      icon: KeyRound,
      badge: null,
      badgeStyle: '',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#0d1117]/90 border-r border-gray-800/80 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        
        {/* Section Header */}
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
          <span>Workflow Navigation</span>
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        </div>

        {/* Menu Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
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
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {item.badge && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.badgeStyle}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-200" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Pro Box */}
      <div className="mt-8 p-3.5 rounded-2xl glass-card border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 to-slate-900/80">
        <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Cloud Autonomous Engine</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
          Runs continuously in the cloud. Your PC doesn't need to stay online.
        </p>
        <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-gray-500">
          <span>Official OAuth Compliant</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>
    </aside>
  );
};
