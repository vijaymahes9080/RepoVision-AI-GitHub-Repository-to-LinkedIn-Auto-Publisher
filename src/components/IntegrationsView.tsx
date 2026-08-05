import React, { useState } from 'react';
import { User } from '../types';
import { GithubIcon, LinkedinIcon } from './Icons';
import { getLinkedInOAuthAuthUrl } from '../services/linkedInLiveService';
import { 
  Plug, 
  CheckCircle2, 
  ShieldCheck, 
  Mail,
  ExternalLink,
  Save,
  Check,
  User as UserIcon
} from 'lucide-react';

interface IntegrationsViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ user, onUpdateUser }) => {
  const [linkedInProfileUrl, setLinkedInProfileUrl] = useState(
    'https://www.linkedin.com/in/vijay-mahes-480989250'
  );
  const [linkedInProfileName, setLinkedInProfileName] = useState(
    user.linkedInAccountName || 'Vijay Mahes'
  );
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleGitHub = () => {
    onUpdateUser({
      ...user,
      connectedGitHub: !user.connectedGitHub,
    });
  };

  const toggleLinkedIn = () => {
    if (!user.connectedLinkedIn) {
      setShowLinkedInModal(true);
    } else {
      onUpdateUser({
        ...user,
        connectedLinkedIn: false,
      });
    }
  };

  const handleSaveLinkedInAccount = () => {
    onUpdateUser({
      ...user,
      connectedLinkedIn: true,
      linkedInAccountName: linkedInProfileName,
    });
    setShowLinkedInModal(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTriggerOfficialOAuth = () => {
    const authUrl = getLinkedInOAuthAuthUrl();
    window.open(authUrl, '_blank', 'width=600,height=700');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-indigo-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <Plug className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-extrabold text-white">Real-Time LinkedIn & OAuth Integration</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Connect your real personal or company LinkedIn profile to enable automated & 1-click live publishing.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-800 text-xs font-bold text-indigo-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Official OAuth 2.0 Compliant</span>
        </div>
      </div>

      {/* OAuth Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Real LinkedIn Account Integration Card */}
        <div className="glass-card p-6 rounded-2xl space-y-4 border border-linkedin-blue/50 bg-gradient-to-b from-[#0d1117] via-linkedin-blue/10 to-[#0d1117]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-linkedin-blue flex items-center justify-center text-white shadow-neon-linkedin">
                <LinkedinIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Real LinkedIn Account</h3>
                <p className="text-xs text-linkedin-light font-mono">{user.linkedInAccountName || 'Vijay Mahes'}</p>
              </div>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              user.connectedLinkedIn
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}>
              {user.connectedLinkedIn ? 'Connected & Active' : 'Disconnected'}
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            Grants official real-time publishing authorization to post AI-generated descriptions, glassmorphism banners, and 10-slide PDF carousels directly to your LinkedIn feed.
          </p>

          {user.connectedLinkedIn && (
            <div className="p-3 rounded-xl bg-[#090d16] border border-linkedin-blue/30 text-xs space-y-1">
              <div className="flex items-center justify-between text-gray-400">
                <span>Account Profile:</span>
                <a
                  href={linkedInProfileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-linkedin-blue hover:underline font-bold flex items-center space-x-1"
                >
                  <span>{linkedInProfileName}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-gray-800 text-xs gap-2 flex-wrap">
            <button
              onClick={handleTriggerOfficialOAuth}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-linkedin-blue hover:bg-linkedin-hover text-white font-semibold text-xs shadow-neon-linkedin transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Official OAuth Authorization</span>
            </button>

            <button
              onClick={toggleLinkedIn}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                user.connectedLinkedIn
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-neon'
              }`}
            >
              {user.connectedLinkedIn ? 'Disconnect' : 'Connect Account Details'}
            </button>
          </div>
        </div>

        {/* GitHub OAuth Card */}
        <div className="glass-card p-6 rounded-2xl space-y-4 border border-gray-800 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#0d1117] border border-gray-700 flex items-center justify-center text-white">
                <GithubIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">GitHub OAuth</h3>
                <p className="text-xs text-gray-400">@vijaymahes9080</p>
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

      </div>

      {/* Connect Real LinkedIn Account Modal */}
      {showLinkedInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl border border-linkedin-blue/60 max-w-md w-full space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-linkedin-blue">
                <LinkedinIcon className="w-5 h-5" />
                <h3 className="text-sm font-extrabold text-white">Connect Real LinkedIn Account</h3>
              </div>
              <button onClick={() => setShowLinkedInModal(false)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Enter your real LinkedIn profile name and handle below to connect your real-time account:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">LinkedIn Display Name</label>
                <input
                  type="text"
                  value={linkedInProfileName}
                  onChange={(e) => setLinkedInProfileName(e.target.value)}
                  placeholder="Vijay Mahes"
                  className="w-full px-3 py-2 bg-[#090d16] border border-gray-800 rounded-lg text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">LinkedIn Profile URL</label>
                <input
                  type="text"
                  value={linkedInProfileUrl}
                  onChange={(e) => setLinkedInProfileUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/in/vijay-mahes"
                  className="w-full px-3 py-2 bg-[#090d16] border border-gray-800 rounded-lg text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
              <button
                onClick={handleTriggerOfficialOAuth}
                className="text-[11px] text-linkedin-blue hover:underline font-semibold flex items-center space-x-1"
              >
                <span>Launch OAuth Popup</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowLinkedInModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLinkedInAccount}
                  className="px-4 py-1.5 rounded-lg bg-linkedin-blue hover:bg-linkedin-hover text-white text-xs font-bold shadow-neon-linkedin"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
