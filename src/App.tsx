import React, { useState } from 'react';
import { User, ProjectAnalysis, GeneratedContent } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { RepoAnalyzer } from './components/RepoAnalyzer';
import { ContentStudio } from './components/ContentStudio';
import { VisualStudio } from './components/VisualStudio';
import { VideoStudio } from './components/VideoStudio';
import { PortfolioView } from './components/PortfolioView';
import { SchedulerView } from './components/SchedulerView';
import { AnalyticsView } from './components/AnalyticsView';
import { IntegrationsView } from './components/IntegrationsView';
import { AdminView } from './components/AdminView';

import { generateLinkedInContent } from './services/aiContentGenerator';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('analyzer');

  // User state
  const [user, setUser] = useState<User>({
    id: 'usr-9080',
    name: 'Vijay Mahes',
    email: 'Vijaypradhap2004@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    connectedGitHub: true,
    connectedLinkedIn: true,
    connectedGoogle: true,
    linkedInAccountName: 'Vijay Mahes (Personal Profile)',
    githubUsername: 'vijaymahes9080',
    apiTokens: {
      openaiKey: 'sk-proj-********************************',
      githubToken: 'ghp_********************************',
      linkedInToken: 'li_oauth_token_****************',
    },
  });

  const [activeAnalysis, setActiveAnalysis] = useState<ProjectAnalysis | null>(() => {
    return {
      repoUrl: 'https://github.com/vijaymahes9080/RepoVision-AI-GitHub-Repository-to-LinkedIn-Auto-Publisher',
      repoName: 'vijaymahes9080/RepoVision-AI',
      owner: 'vijaymahes9080',
      stars: 342,
      forks: 89,
      primaryLanguage: 'TypeScript',
      readmeContent: 'RepoVision AI - Cloud SaaS platform',
      problemStatement: 'Developers and open-source creators struggle to consistently promote their code repositories on LinkedIn, leading to low project visibility and missed growth opportunities.',
      solution: 'RepoVision AI provides an end-to-end automated cloud pipeline that clones GitHub repos, understands technical architecture via LLMs, generates multi-format LinkedIn content (Banners, 10-slide Carousels, Video Scripts), and schedules/publishes them directly.',
      keyFeatures: [
        'Automated GitHub Repo Parsing & AST Tech Stack Detector',
        'AI Context Understanding (Hook, Problem, Solution, Architecture)',
        'Interactive Banner Generator with Glassmorphism & Modern themes',
        '10-Slide Carousel Studio with PDF & Image Export',
        '30-Second Promotional Short Video Script & Preview Studio',
        'Official LinkedIn OAuth Integration with 1-Click Review Queue'
      ],
      architectureOverview: 'React/Next.js SPA Gateway → FastAPI Microservices → LLM Context Engine (OpenAI + LangChain) → Canvas & PDF Renderers → LinkedIn OAuth Publishing Queue.',
      targetAudience: 'Software Engineers, Technical Founders, AI Researchers, Product Managers',
      innovations: ['Zero-friction repository URL to multi-format media generation'],
      technologies: [
        { name: 'React 19', category: 'Frontend', confidence: 98 },
        { name: 'Next.js', category: 'Frontend', confidence: 95 },
        { name: 'TypeScript', category: 'Frontend', confidence: 99 },
        { name: 'FastAPI', category: 'Backend', confidence: 94 },
        { name: 'Node.js', category: 'Backend', confidence: 92 },
        { name: 'PostgreSQL', category: 'Database', confidence: 89 },
        { name: 'Redis', category: 'Database', confidence: 90 },
        { name: 'Docker', category: 'Cloud/DevOps', confidence: 96 },
        { name: 'OpenAI GPT-5.5', category: 'AI/ML', confidence: 97 },
      ],
      apiEndpoints: ['/api/v1/analyze', '/api/v1/generate', '/api/v1/publish'],
      aiModelsDetected: ['OpenAI GPT-5.5', 'Text-Embedding-3-Large'],
      cloudServicesDetected: ['AWS S3', 'Cloudflare R2', 'Docker'],
    };
  });

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(() => {
    return activeAnalysis ? generateLinkedInContent(activeAnalysis) : null;
  });

  const handleAnalysisComplete = (analysis: ProjectAnalysis) => {
    setActiveAnalysis(analysis);
    const content = generateLinkedInContent(analysis);
    setGeneratedContent(content);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenSettings={() => setActiveTab('admin')}
        activeRepoName={activeAnalysis?.repoName}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasAnalysis={!!activeAnalysis}
          scheduledCount={4}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'analyzer' && (
            <RepoAnalyzer
              activeAnalysis={activeAnalysis}
              onAnalysisComplete={handleAnalysisComplete}
              onNavigateToContent={() => setActiveTab('content')}
            />
          )}

          {activeTab === 'content' && (
            <ContentStudio
              content={generatedContent}
              onUpdateContent={(updated) => setGeneratedContent(updated)}
              user={user}
              onNavigateToVisual={() => setActiveTab('visual')}
              onNavigateToScheduler={() => setActiveTab('scheduler')}
            />
          )}

          {activeTab === 'visual' && (
            <VisualStudio analysis={activeAnalysis} />
          )}

          {activeTab === 'video' && (
            <VideoStudio analysis={activeAnalysis} />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioView analysis={activeAnalysis} />
          )}

          {activeTab === 'scheduler' && (
            <SchedulerView
              user={user}
              onNavigateToContent={() => setActiveTab('content')}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsView
              user={user}
              onUpdateUser={(u) => setUser(u)}
            />
          )}

          {activeTab === 'admin' && (
            <AdminView
              user={user}
              onUpdateUser={(u) => setUser(u)}
            />
          )}
        </main>

      </div>

    </div>
  );
}

export default App;
