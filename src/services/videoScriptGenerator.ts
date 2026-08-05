import { ProjectAnalysis, VideoScriptSegment } from '../types';

export function generateVideoScript(analysis: ProjectAnalysis): VideoScriptSegment[] {
  const repo = analysis.repoName;
  const primaryTech = analysis.technologies.slice(0, 3).map((t) => t.name).join(', ');

  return [
    {
      id: 1,
      timeRange: '0:00 - 0:05',
      headline: `Meet ${repo}`,
      visualCue: 'Fast glowing title reveal with neon blue particles and logo pulse',
      narrationText: `Tired of spending hours promoting your open source projects on LinkedIn? Meet ${repo}.`,
      techBadges: [analysis.primaryLanguage, 'GitHub API'],
    },
    {
      id: 2,
      timeRange: '0:05 - 0:12',
      headline: 'Automated AI Code Understanding',
      visualCue: 'Scanning repository AST structure, README analysis, and file dependency tree',
      narrationText: `RepoVision AI automatically clones your repository, analyzes your architecture, and detects over 30 frameworks in seconds.`,
      codeSnippet: `const analysis = await analyzeRepo("${analysis.repoUrl}");\nconsole.log(analysis.technologies);`,
      techBadges: ['FastAPI', 'OpenAI', 'LangChain'],
    },
    {
      id: 3,
      timeRange: '0:12 - 0:20',
      headline: 'Banners, Carousels & Posts Generated',
      visualCue: 'Dynamic slide carousel rotation and glassmorphism banner rendering',
      narrationText: `It instantly generates high-converting post copy, custom glassmorphism banners, and 10-slide PDF carousels tailored for LinkedIn.`,
      techBadges: ['Canvas API', 'PDF Export', 'React'],
    },
    {
      id: 4,
      timeRange: '0:20 - 0:25',
      headline: 'Official LinkedIn OAuth Auto-Publish',
      visualCue: 'Scheduled calendar queue and 1-Click interactive review workflow',
      narrationText: `Schedule or publish directly to your LinkedIn feed with official OAuth authorization. No desktop needed!`,
      techBadges: ['LinkedIn OAuth', 'Cloud Queue'],
    },
    {
      id: 5,
      timeRange: '0:25 - 0:30',
      headline: 'Star on GitHub Today!',
      visualCue: 'GitHub star counter incrementing animation with call-to-action button',
      narrationText: `Boost your project's visibility today. Star ${repo} on GitHub now!`,
      techBadges: ['Open Source', 'GitHub Stars'],
    },
  ];
}
