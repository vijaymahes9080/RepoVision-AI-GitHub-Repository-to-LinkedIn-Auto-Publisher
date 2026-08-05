import React, { useState } from 'react';
import { ProjectAnalysis } from '../types';
import { generatePortfolioFromAnalysis } from '../services/portfolioBuilder';
import { 
  Globe, 
  Sparkles, 
  Star, 
  Code2, 
  Download, 
  Check, 
  ExternalLink,
  Award,
  Layers
} from 'lucide-react';

interface PortfolioViewProps {
  analysis: ProjectAnalysis | null;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ analysis }) => {
  const [copied, setCopied] = useState(false);
  const portfolio = analysis
    ? generatePortfolioFromAnalysis(analysis)
    : {
        developerName: 'Vijay Mahes',
        headline: 'Full-Stack & AI Systems Engineer',
        bio: 'Building AI cloud SaaS applications and open source tools.',
        featuredProjects: [],
        skills: [],
        stats: { totalRepos: 18, totalStars: 342, totalContributions: 1420 },
      };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolio, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `portfolio-${portfolio.developerName.toLowerCase().replace(/\s+/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-cyan-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-white">AI Developer Portfolio Website Generator</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Automatically transforms analyzed GitHub repositories into a sleek, interactive developer portfolio.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-neon transition-all shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
          <span>{copied ? 'Portfolio Exported!' : 'Export Portfolio Data (JSON)'}</span>
        </button>
      </div>

      {/* Portfolio Card Preview */}
      <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 border border-indigo-500/30 bg-gradient-to-b from-[#0d1117] via-indigo-950/20 to-[#0d1117]">
        
        {/* Profile Info Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight font-[#Outfit]">{portfolio.developerName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40">
                PRO VERIFIED
              </span>
            </div>
            <p className="text-xs font-semibold text-cyan-300">{portfolio.headline}</p>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed pt-1">{portfolio.bio}</p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono bg-black/40 p-3 rounded-2xl border border-gray-800">
            <div className="text-center">
              <span className="block font-bold text-white text-sm">{portfolio.stats.totalRepos}</span>
              <span className="text-[10px] text-gray-400">Repositories</span>
            </div>
            <div className="text-center border-x border-gray-800 px-3">
              <span className="block font-bold text-amber-400 text-sm">{portfolio.stats.totalStars.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400">Total Stars</span>
            </div>
            <div className="text-center">
              <span className="block font-bold text-emerald-400 text-sm">{portfolio.stats.totalContributions}</span>
              <span className="text-[10px] text-gray-400">Contributions</span>
            </div>
          </div>
        </div>

        {/* Featured Projects Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Featured Open Source Repositories</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio.featuredProjects.map((project) => (
              <div key={project.name} className="p-5 rounded-2xl bg-[#090d16] border border-gray-800 space-y-3 hover:border-cyan-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white font-mono">{project.name}</span>
                  <div className="flex items-center space-x-1 text-xs text-amber-400 font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{project.stars}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">{project.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 text-[10px] font-mono border border-indigo-800/40">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Skills Matrix */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>AI Verified Skill Matrix</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {portfolio.skills.map((skill) => (
              <div key={skill.name} className="p-3 rounded-xl bg-[#090d16] border border-gray-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{skill.name}</span>
                  <span className="text-[10px] font-mono text-cyan-400">{skill.level}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${skill.level}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
