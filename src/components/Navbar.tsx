import React from 'react';
import { User } from '../types';
import { Sparkles, CheckCircle2, ShieldCheck, Flame, RefreshCw } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';

interface NavbarProps {
  user: User;
  onOpenSettings: () => void;
  activeRepoName?: string;
  isAnalyzing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onOpenSettings, activeRepoName, isAnalyzing }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/80 backdrop-blur-md border-b border-gray-800/60 px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-[1px] shadow-neon">
            <div className="w-full h-full bg-[#090d16] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight gradient-text font-[#Outfit]">RepoVision AI</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SaaS v2.5
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium hidden sm:block">
              GitHub Repository → LinkedIn Auto Content & Publisher
            </p>
          </div>
        </div>

        {/* Active Analysis Indicator */}
        {activeRepoName && (
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-xs text-indigo-200">
            {isAnalyzing ? (
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            ) : (
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Active Repo: <strong className="text-white">{activeRepoName}</strong></span>
          </div>
        )}

        {/* OAuth Status & User Profile */}
        <div className="flex items-center space-x-3">
          
          {/* OAuth Badges */}
          <div className="hidden xl:flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold ${user.connectedGitHub ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' : 'bg-gray-800/80 text-gray-400'}`}>
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub OAuth</span>
              {user.connectedGitHub && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </div>

            <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold ${user.connectedLinkedIn ? 'bg-linkedin-blue/20 text-linkedin-light border border-linkedin-blue/40' : 'bg-gray-800/80 text-gray-400'}`}>
              <LinkedinIcon className="w-3.5 h-3.5 text-linkedin-blue" />
              <span>LinkedIn OAuth</span>
              {user.connectedLinkedIn && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
            </div>
          </div>

          {/* AI Model Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/50 text-cyan-300 text-xs font-semibold border border-cyan-800/50">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>GPT-5.5 Powered</span>
          </div>

          {/* User Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg bg-gray-900/80 hover:bg-gray-800 border border-gray-700/60 transition-all text-xs font-medium text-gray-200"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-6 h-6 rounded-full border border-indigo-500/50"
            />
            <span className="hidden sm:inline font-semibold">{user.name}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
