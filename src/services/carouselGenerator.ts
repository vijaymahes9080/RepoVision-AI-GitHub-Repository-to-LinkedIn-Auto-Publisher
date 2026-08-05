import { CarouselSlide, ProjectAnalysis } from '../types';

export function generateDefaultCarousel(analysis: ProjectAnalysis): CarouselSlide[] {
  const repo = analysis.repoName;
  const topTech = analysis.technologies.slice(0, 4).map((t) => t.name);

  return [
    {
      id: 1,
      slideType: 'title',
      title: repo,
      subtitle: 'GitHub Repository to LinkedIn Auto Content Engine',
      bodyText: `An AI Cloud SaaS platform powered by ${topTech.slice(0, 2).join(' & ')}.`,
      bullets: [`⭐ Stars: ${analysis.stars}`, `🌿 Primary Language: ${analysis.primaryLanguage}`, `🚀 Fully Automated SaaS`],
      accentColor: '#6366f1',
    },
    {
      id: 2,
      slideType: 'problem',
      title: 'The Challenge',
      subtitle: 'Why great repos go unnoticed',
      bodyText: analysis.problemStatement,
      bullets: [
        'Writing posts and creating media manually takes 4+ hours per repo',
        'Lack of engaging graphics lowers LinkedIn feed visibility',
        'Inconsistent publishing leads to stalled open-source growth',
      ],
      accentColor: '#ef4444',
    },
    {
      id: 3,
      slideType: 'solution',
      title: 'The Solution',
      subtitle: `Introducing ${repo}`,
      bodyText: analysis.solution,
      bullets: [
        'Clones & understands codebase using state-of-the-art LLMs',
        'Auto-generates structured LinkedIn posts, banners & 10-slide carousels',
        'Direct OAuth scheduling & automated distribution',
      ],
      accentColor: '#10b981',
    },
    {
      id: 4,
      slideType: 'architecture',
      title: 'System Architecture',
      subtitle: 'Cloud End-to-End Pipeline',
      bodyText: analysis.architectureOverview,
      bullets: [
        'GitHub API & AST Tech Stack Extractor',
        'OpenAI GPT-5.5 Context Analysis Engine',
        'Canvas & HTML5 High-DPI Render Queue',
        'LinkedIn Official API Publisher & Queue',
      ],
      accentColor: '#06b6d4',
      codeSnippet: `const pipeline = await RepoVision.analyze({
  url: "${analysis.repoUrl}",
  depth: "full_ast_and_readme"
});
await pipeline.generateMedia();
await pipeline.publishToLinkedIn();`,
    },
    {
      id: 5,
      slideType: 'tech',
      title: 'Technology Stack',
      subtitle: 'Built with Modern Cloud Technologies',
      bodyText: 'Detected frameworks and dependencies:',
      bullets: analysis.technologies.slice(0, 6).map((t) => `${t.name} (${t.category}) – ${t.confidence}% match`),
      accentColor: '#a855f7',
    },
    {
      id: 6,
      slideType: 'features',
      title: 'Key Features',
      subtitle: 'What makes this project unique',
      bodyText: 'Engineered for scalability and ease of use:',
      bullets: analysis.keyFeatures.slice(0, 4),
      accentColor: '#f59e0b',
    },
    {
      id: 7,
      slideType: 'results',
      title: 'Impact & Benchmarks',
      subtitle: 'Performance & Growth Metrics',
      bodyText: 'Quantifiable improvements observed during deployment:',
      bullets: [
        '⚡ 95% reduction in content creation time (4 hours → 3 minutes)',
        '📈 3.4x higher post impressions with 10-slide PDF carousels',
        '🎯 100% compliant with official platform OAuth APIs',
      ],
      accentColor: '#ec4899',
    },
    {
      id: 8,
      slideType: 'qrcode',
      title: 'Repository Link',
      subtitle: 'Scan to View Code on GitHub',
      bodyText: `Explore the full source code for ${repo} on GitHub:`,
      bullets: [
        `URL: ${analysis.repoUrl}`,
        'Open Source & Community Driven',
        'Star the repository to support development!',
      ],
      accentColor: '#3b82f6',
    },
    {
      id: 9,
      slideType: 'future',
      title: 'Future Scope',
      subtitle: 'Roadmap & Upcoming Extensions',
      bodyText: 'Planned features for upcoming versions:',
      bullets: [
        'Multi-platform publishing (X/Twitter, Medium, Dev.to, Hashnode)',
        'Automated 30-sec AI Voiceover Short Video Generation',
        'AI Coding Portfolio builder from GitHub commits',
      ],
      accentColor: '#8b5cf6',
    },
    {
      id: 10,
      slideType: 'thankyou',
      title: 'Thank You!',
      subtitle: 'Connect & Collaborate',
      bodyText: 'Thank you for exploring this project breakdown.',
      bullets: [
        '💬 Drop your feedback and thoughts in the comments below!',
        '⭐ Star the repository on GitHub',
        '🔔 Follow for more AI & engineering deep dives',
      ],
      accentColor: '#10b981',
    },
  ];
}
