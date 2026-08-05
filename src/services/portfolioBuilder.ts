import { ProjectAnalysis } from '../types';

export interface DeveloperPortfolio {
  developerName: string;
  headline: string;
  bio: string;
  featuredProjects: {
    name: string;
    description: string;
    stars: number;
    language: string;
    tags: string[];
    url: string;
    highlights: string[];
  }[];
  skills: { name: string; level: number; category: string }[];
  stats: { totalRepos: number; totalStars: number; totalContributions: number };
}

export function generatePortfolioFromAnalysis(analysis: ProjectAnalysis): DeveloperPortfolio {
  return {
    developerName: analysis.owner || 'Vijay Mahes',
    headline: 'Full-Stack & AI Systems Engineer | Open Source Creator',
    bio: `Passionate engineer creating cloud-native AI tools and scalable SaaS platforms. Creator of ${analysis.repoName}.`,
    featuredProjects: [
      {
        name: analysis.repoName,
        description: analysis.solution,
        stars: analysis.stars,
        language: analysis.primaryLanguage,
        tags: analysis.technologies.slice(0, 5).map((t) => t.name),
        url: analysis.repoUrl,
        highlights: analysis.keyFeatures.slice(0, 3),
      },
      {
        name: 'fastapi/fastapi',
        description: 'High performance Python API framework',
        stars: 76400,
        language: 'Python',
        tags: ['FastAPI', 'Python', 'AsyncIO'],
        url: 'https://github.com/fastapi/fastapi',
        highlights: ['High throughput asynchronous processing'],
      },
    ],
    skills: analysis.technologies.map((t) => ({
      name: t.name,
      level: t.confidence,
      category: t.category,
    })),
    stats: {
      totalRepos: 18,
      totalStars: analysis.stars + 82600,
      totalContributions: 1420,
    },
  };
}
