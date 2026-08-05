import { ProjectAnalysis } from '../types';

export interface ResumeBullet {
  id: number;
  category: string;
  bulletText: string;
  quantifiableImpact: string;
}

export function generateResumeBullets(analysis: ProjectAnalysis): ResumeBullet[] {
  const repo = analysis.repoName;
  const primaryTech = analysis.technologies.slice(0, 3).map((t) => t.name).join(', ');

  return [
    {
      id: 1,
      category: 'System Architecture & Engineering',
      bulletText: `Architected and launched ${repo}, a cloud-native SaaS platform using ${primaryTech} that automates GitHub repository AST parsing and technical content synthesis.`,
      quantifiableImpact: '95% reduction in manual marketing overhead',
    },
    {
      id: 2,
      category: 'AI Pipeline & LLM Integration',
      bulletText: `Engineered an automated LLM pipeline (OpenAI GPT-5.5 + LangChain) to extract problem statements, architectural patterns, and framework dependencies from 30+ tech stacks.`,
      quantifiableImpact: '30+ frameworks auto-detected with 98% accuracy',
    },
    {
      id: 3,
      category: 'Client-Side Rendering & Media Engines',
      bulletText: `Developed a high-DPI HTML5 Canvas and PDF rendering engine capable of exporting customizable glassmorphism banners and 10-slide technical carousel decks.`,
      quantifiableImpact: '3.4x higher post impressions on LinkedIn',
    },
    {
      id: 4,
      category: 'OAuth Integration & Compliance',
      bulletText: `Implemented secure OAuth 2.0 authentication flows for GitHub and LinkedIn with automated background scheduling and a 1-Click fallback review queue.`,
      quantifiableImpact: '100% compliant with official API permissions',
    },
  ];
}
