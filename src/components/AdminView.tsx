import React, { useState } from 'react';
import { User } from '../types';
import { 
  KeyRound, 
  Save, 
  Check, 
  Cpu, 
  Server, 
  HardDrive, 
  Database, 
  Sparkles,
  Lock
} from 'lucide-react';

interface AdminViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ user, onUpdateUser }) => {
  const [openaiKey, setOpenaiKey] = useState(user.apiTokens.openaiKey || 'sk-proj-********************************');
  const [githubToken, setGithubToken] = useState(user.apiTokens.githubToken || 'ghp_********************************');
  const [linkedInToken, setLinkedInToken] = useState(user.apiTokens.linkedInToken || 'li_oauth_token_****************');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateUser({
      ...user,
      apiTokens: {
        openaiKey,
        githubToken,
        linkedInToken,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-amber-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-extrabold text-white">API Keys & Cloud Infrastructure Settings</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Configure custom LLM API keys (OpenAI GPT-5.5), GitHub Personal Access Tokens, and Cloudflare/S3 storage buckets.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs shadow-neon transition-all shrink-0"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Settings Saved Successfully!' : 'Save API Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* API Tokens Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>AI Provider API Keys</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1 font-semibold">
                  OpenAI GPT-5.5 / GPT-4o API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#090d16] border border-gray-800 rounded-xl text-white font-mono"
                  />
                  <Lock className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-3" />
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Used for deep repository AST code understanding and post synthesis.
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1 font-semibold">
                  GitHub Personal Access Token (PAT)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#090d16] border border-gray-800 rounded-xl text-white font-mono"
                  />
                  <Lock className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-3" />
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Increases GitHub REST API rate limit from 60 to 5,000 requests/hour.
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1 font-semibold">
                  LinkedIn OAuth 2.0 Secret Token
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={linkedInToken}
                    onChange={(e) => setLinkedInToken(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#090d16] border border-gray-800 rounded-xl text-white font-mono"
                  />
                  <Lock className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-3" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Database & Cloud Stack Status (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>SaaS Infrastructure Architecture</span>
          </h3>

          <div className="glass-card p-5 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090d16] border border-gray-800">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">PostgreSQL Database</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                HEALTHY
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090d16] border border-gray-800">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-red-400" />
                <span className="font-semibold text-white">Redis Queue / RabbitMQ</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090d16] border border-gray-800">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-white">AWS S3 / Cloudflare R2</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                CONNECTED
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090d16] border border-gray-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-white">FastAPI Microservices</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                ONLINE
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
