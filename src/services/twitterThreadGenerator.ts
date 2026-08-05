import { ProjectAnalysis } from '../types';

export interface TweetItem {
  id: number;
  text: string;
  charCount: number;
}

export function generateTwitterThread(analysis: ProjectAnalysis): TweetItem[] {
  const repo = analysis.repoName;
  const primaryTech = analysis.technologies.slice(0, 3).map((t) => t.name).join(', ');

  return [
    {
      id: 1,
      text: `1/5 🚀 Introducing ${repo}!\n\nAn AI-powered Cloud SaaS platform built with ${primaryTech}.\n\nIt automatically converts GitHub repositories into viral LinkedIn campaigns, 10-slide PDF carousels, and 30s shorts. 🧵👇`,
      charCount: 215,
    },
    {
      id: 2,
      text: `2/5 📌 The Problem:\n\nDevelopers spend 4+ hours creating graphics and writing posts for every repo launch. Most open-source projects get buried.\n\n💡 Solution:\nRepoVision AI clones your repo in the cloud and extracts tech stack + architecture via LLMs.`,
      charCount: 242,
    },
    {
      id: 3,
      text: `3/5 ⚡ System Architecture:\n\n• React 19 + Next.js SPA Gateway\n• FastAPI Microservices Engine\n• OpenAI GPT-5.5 + LangChain Context Engine\n• Canvas & PDF High-DPI Render Queue\n• Official LinkedIn OAuth API`,
      charCount: 210,
    },
    {
      id: 4,
      text: `4/5 🎨 Media Generation Suite:\n\n• Glassmorphism LinkedIn Header Banners\n• 10-Slide Interactive PDF Carousels\n• 30-Sec AI Voiceover Promo Shorts\n• Automated Post Scheduler & Queue`,
      charCount: 198,
    },
    {
      id: 5,
      text: `5/5 ⭐ Check out the full source code and star the repo on GitHub:\n\n${analysis.repoUrl}\n\n#OpenSource #AI #BuildInPublic #React #TypeScript`,
      charCount: 172,
    },
  ];
}
