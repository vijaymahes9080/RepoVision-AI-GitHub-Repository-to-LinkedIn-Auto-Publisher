import React from 'react';
import { User } from '../types';
import { GithubIcon, LinkedinIcon } from './Icons';
import { 
  Plug, 
  CheckCircle2, 
  ShieldCheck, 
  Mail
} from 'lucide-react';

interface IntegrationsViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ user, onUpdateUser }) => {
  const toggleGitHub = () => {
    onUpdateUser({
      ...user,
      connectedGitHub: !user.connectedGitHub,
    });
  };

  const toggleLinkedIn = () => {
    onUpdateUser({
      ...user,
      connectedLinkedIn: !user.connectedLinkedIn,
    });
  };

  const toggleGoogle = () => {
    onUpdateUser({
      ...user,
      connectedGoogle: !user.connectedGoogle,
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-indigo-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <Plug className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-extrabold text-white">OAuth Connections & Cloud Integrations</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Authorize official platform OAuth flows for GitHub, LinkedIn, Google, and Email authentication.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-800 text-xs font-bold text-indigo-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>OAuth 2.0 Security Verified</span>
        </div>
      </div>

      {/* OAuth Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* GitHub OAuth Card */}
        <div className="glass-card p-6 rounded-2xl space-y-4 border border-gray-800 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#0d1117] border border-gray-700 flex items-center justify-center text-white">
                <GithubIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">GitHub OAuth</h3>
                <p className="text-xs text-gray-400">Public & Authorized Repositories</p>
              </div>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              user.connectedGitHub
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}>
              {user.connectedGitHub ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            Allows RepoVision AI to fetch public repository files, README context, AST file trees, and commit metadata securely.
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-gray-800 text-xs">
            <span className="text-gray-400 font-mono">Scope: repo, read:user</span>
            <button
              onClick={toggleGitHub}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                user.connectedGitHub
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-neon'
              }`}
            >
              {user.connectedGitHub ? 'Disconnect' : 'Connect GitHub'}
            </button>
          </div>
        </div>

        {/* LinkedIn OAuth Card */}
        <div className="glass-card p-6 rounded-2xl space-y-4 border border-gray-800 hover:border-linkedin-blue/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-linkedin-blue flex items-center justify-center text-white">
                <LinkedinIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">LinkedIn OAuth</h3>
                <p className="text-xs text-gray-400">Personal & Company Pages</p>
              </div>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              user.connectedLinkedIn
                ? 'bg-linkedin-blue/20 text-linkedin-light border-linkedin-blue/40'
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}>
              {user.connectedLinkedIn ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            Grants official posting access to schedule and publish text, images, banners, and 10-slide PDF carousels directly to LinkedIn.
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-gray-800 text-xs">
            <span className="text-gray-400 font-mono">Scope: w_member_social, r_liteprofile</span>
            <button
              onClick={toggleLinkedIn}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                user.connectedLinkedIn
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-linkedin-blue hover:bg-linkedin-hover text-white shadow-neon-linkedin'
              }`}
            >
              {user.connectedLinkedIn ? 'Disconnect' : 'Connect LinkedIn'}
            </button>
          </div>
        </div>

        {/* Google Login Card */}
        <div className="glass-card p-6 rounded-2xl space-y-4 border border-gray-800 hover:border-red-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-900 font-bold text-lg">
                G
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Google SSO Login</h3>
                <p className="text-xs text-gray-400">One-Tap Authentication</p>
              </div>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              user.connectedGoogle
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}>
              {user.connectedGoogle ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            Fast single sign-on access to sync workspace credentials across devices seamlessly.
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-gray-800 text-xs">
            <span className="text-gray-400 font-mono">Email: {user.email}</span>
            <button
              onClick={toggleGoogle}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                user.connectedGoogle
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {user.connectedGoogle ? 'Disconnect' : 'Connect Google'}
            </button>
          </div>
        </div>

        {/* Email Login Card */}
        <div className="glass-card p-6 rounded-2xl space-y-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Email Passwordless Auth</h3>
                <p className="text-xs text-gray-400">Magic Link Login</p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Active
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            Receive instant magic link authentication emails to log in from any browser securely.
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-gray-800 text-xs">
            <span className="text-gray-400 font-mono">User ID: {user.id}</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified</span>
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
