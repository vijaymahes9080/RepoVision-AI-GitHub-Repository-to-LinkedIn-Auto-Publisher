import React, { useState } from 'react';
import { ProjectAnalysis } from '../types';
import { PRESET_REPOSITORIES, analyzeGitHubRepository } from '../services/githubAnalyzer';
import { GithubIcon } from './Icons';
import { 
  Search, 
  Sparkles, 
  Cpu, 
  Layers, 
  Code2, 
  Star, 
  GitFork, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Boxes,
  Database,
  Cloud,
  BrainCircuit,
  Wrench
} from 'lucide-react';

interface RepoAnalyzerProps {
  onAnalysisComplete: (analysis: ProjectAnalysis) => void;
  activeAnalysis: ProjectAnalysis | null;
  onNavigateToContent: () => void;
}

export const RepoAnalyzer: React.FC<RepoAnalyzerProps> = ({
  onAnalysisComplete,
  activeAnalysis,
  onNavigateToContent
}) => {
  const [repoUrl, setRepoUrl] = useState(
    activeAnalysis ? activeAnalysis.repoUrl : 'https://github.com/vijaymahes9080/RepoVision-AI-GitHub-Repository-to-LinkedIn-Auto-Publisher'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Cloning Repository via Cloud Git Client...',
    'Parsing README.md & AST Code Structure...',
    'Detecting Frameworks, DBs, Cloud Services & AI Models...',
    'Synthesizing Technical Architecture & Campaign Insights...'
  ];

  const handleAnalyze = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || repoUrl;
    if (!targetUrl.trim()) return;

    setIsAnalyzing(true);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 500);

    try {
      const result = await analyzeGitHubRepository(targetUrl);
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      onAnalysisComplete(result);
    } catch (err) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      console.error(err);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Frontend': return <Code2 className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Backend': return <Cpu className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Database': return <Database className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Cloud/DevOps': return <Cloud className="w-3.5 h-3.5 text-blue-400" />;
      case 'AI/ML': return <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />;
      default: return <Wrench className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 lg:p-8 border border-indigo-500/20 bg-gradient-to-r from-[#0d1117] via-indigo-950/40 to-[#0d1117]">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Code Understanding Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Analyze Any GitHub Repository & Generate LinkedIn Campaigns
          </h1>
          <p className="text-xs lg:text-sm text-gray-300 leading-relaxed">
            RepoVision AI clones public or authorized repositories in the cloud, extracts architecture patterns, technologies, and features using GPT-5.5, and creates multi-format LinkedIn assets automatically.
          </p>
        </div>
      </div>

      {/* Input & Search Section */}
      <div className="glass-card p-5 lg:p-6 rounded-2xl space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
          Paste GitHub Repository URL
        </label>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <GithubIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="w-full pl-11 pr-4 py-3 bg-[#090d16] border border-gray-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
            />
          </div>

          <button
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing || !repoUrl}
            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-neon transition-all disabled:opacity-50 shrink-0"
          >
            {isAnalyzing ? (
              <>
                <Zap className="w-4 h-4 text-cyan-300 animate-spin" />
                <span>Analyzing Code...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyze Repository</span>
              </>
            )}
          </button>
        </div>

        {/* Preset Quick Test Repositories */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-gray-400 block mb-2">
            Try Preset Featured Open Source Projects:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESET_REPOSITORIES.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setRepoUrl(preset.url);
                  handleAnalyze(preset.url);
                }}
                className="flex flex-col text-left p-2.5 rounded-xl bg-[#090d16]/80 hover:bg-indigo-950/40 border border-gray-800 hover:border-indigo-500/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-indigo-300 group-hover:text-cyan-300 truncate">
                    {preset.name}
                  </span>
                  <div className="flex items-center space-x-1 text-[10px] text-gray-400">
                    <Star className="w-3 h-3 text-amber-400" />
                    <span>{preset.stars}</span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 truncate mt-1">
                  {preset.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Steps Timeline */}
      {isAnalyzing && (
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/40 space-y-4 animate-pulse-slow">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
            <span>Analyzing Repository Pipeline...</span>
            <span>Step {currentStep + 1} of {steps.length}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          <div className="space-y-2 pt-2">
            {steps.map((step, idx) => (
              <div 
                key={step} 
                className={`flex items-center space-x-3 text-xs font-medium ${
                  idx <= currentStep ? 'text-cyan-300' : 'text-gray-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  idx < currentStep 
                    ? 'bg-emerald-500 text-black' 
                    : idx === currentStep 
                    ? 'bg-cyan-500 text-black animate-spin' 
                    : 'bg-gray-800 text-gray-500'
                }`}>
                  {idx < currentStep ? '✓' : idx + 1}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Output View */}
      {activeAnalysis && !isAnalyzing && (
        <div className="space-y-6">
          
          {/* Header Summary Card */}
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <GithubIcon className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white font-mono">{activeAnalysis.repoName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  Analysis Complete
                </span>
              </div>
              <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                {activeAnalysis.solution}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-400 pt-1">
                <span className="flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <strong className="text-white">{activeAnalysis.stars}</strong> stars
                </span>
                <span className="flex items-center space-x-1">
                  <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                  <strong className="text-white">{activeAnalysis.forks}</strong> forks
                </span>
                <span className="flex items-center space-x-1">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  <strong className="text-white">{activeAnalysis.primaryLanguage}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={onNavigateToContent}
              className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-neon transition-all shrink-0"
            >
              <span>Proceed to Content Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Detected Technologies Grid */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Boxes className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                  Detected Technology Stack ({activeAnalysis.technologies.length} Frameworks & Tools)
                </h3>
              </div>
              <span className="text-[11px] text-gray-400">AST & Dependency Match</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {activeAnalysis.technologies.map((tech) => (
                <div 
                  key={tech.name}
                  className="p-3 rounded-xl bg-[#090d16] border border-gray-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    {getCategoryIcon(tech.category)}
                    <span className="text-[10px] font-bold text-indigo-300">{tech.confidence}%</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white truncate">{tech.name}</span>
                    <span className="text-[10px] text-gray-400">{tech.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture & Problem/Solution Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Problem & Solution */}
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Problem & Solution Context</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#090d16] border border-red-500/20 space-y-1">
                  <span className="font-bold text-red-400 block">📌 Problem Statement:</span>
                  <p className="text-gray-300 leading-relaxed">{activeAnalysis.problemStatement}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#090d16] border border-emerald-500/20 space-y-1">
                  <span className="font-bold text-emerald-400 block">💡 Technical Solution:</span>
                  <p className="text-gray-300 leading-relaxed">{activeAnalysis.solution}</p>
                </div>
              </div>
            </div>

            {/* Key Features & Architecture */}
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Key Features & Innovations</span>
              </h3>

              <div className="space-y-2 text-xs">
                {activeAnalysis.keyFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 p-2 rounded-lg bg-[#090d16]/70">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-gray-200 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
