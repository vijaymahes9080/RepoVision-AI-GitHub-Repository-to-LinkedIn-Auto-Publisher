import { ProjectAnalysis, TechItem } from '../types';

export const PRESET_REPOSITORIES = [
  {
    name: 'vijaymahes9080/RepoVision-AI',
    url: 'https://github.com/vijaymahes9080/RepoVision-AI-GitHub-Repository-to-LinkedIn-Auto-Publisher',
    description: 'AI Cloud SaaS platform that automatically analyzes GitHub repos and generates/publishes LinkedIn banners, 10-slide carousels, and promotional posts.',
    stars: 342,
    forks: 89,
    language: 'TypeScript',
  },
  {
    name: 'fastapi/fastapi',
    url: 'https://github.com/fastapi/fastapi',
    description: 'FastAPI framework, high performance, easy to learn, fast to code, ready for production',
    stars: 76400,
    forks: 6200,
    language: 'Python',
  },
  {
    name: 'langchain-ai/langchain',
    url: 'https://github.com/langchain-ai/langchain',
    description: '⚡ Building applications with LLMs through composability ⚡',
    stars: 92100,
    forks: 14500,
    language: 'Python',
  },
  {
    name: 'vercel/next.js',
    url: 'https://github.com/vercel/next.js',
    description: 'The React Framework for the Web',
    stars: 124000,
    forks: 26800,
    language: 'TypeScript',
  }
];

export async function analyzeGitHubRepository(repoUrl: string): Promise<ProjectAnalysis> {
  // Parse URL
  const cleanUrl = repoUrl.trim();
  const urlParts = cleanUrl.replace('https://github.com/', '').split('/');
  const owner = urlParts[0] || 'vijaymahes9080';
  const repoName = urlParts[1] || 'RepoVision-AI';

  // Simulate network & AI analysis latency with realistic breakdown steps
  await new Promise((resolve) => setTimeout(resolve, 2200));

  // Determine tech detection dynamically based on repo name or keywords
  let technologies: TechItem[] = [];
  let problemStatement = '';
  let solution = '';
  let keyFeatures: string[] = [];
  let architectureOverview = '';
  let innovations: string[] = [];

  if (repoName.toLowerCase().includes('repovision') || repoName.toLowerCase().includes('linkedin') || repoUrl.includes('vijaymahes9080')) {
    technologies = [
      { name: 'React 19', category: 'Frontend', confidence: 98 },
      { name: 'Next.js', category: 'Frontend', confidence: 95 },
      { name: 'TypeScript', category: 'Frontend', confidence: 99 },
      { name: 'FastAPI', category: 'Backend', confidence: 94 },
      { name: 'Node.js', category: 'Backend', confidence: 92 },
      { name: 'PostgreSQL', category: 'Database', confidence: 89 },
      { name: 'Redis', category: 'Database', confidence: 90 },
      { name: 'Docker', category: 'Cloud/DevOps', confidence: 96 },
      { name: 'OpenAI GPT-5.5', category: 'AI/ML', confidence: 97 },
      { name: 'LangChain', category: 'AI/ML', confidence: 91 },
      { name: 'AWS S3', category: 'Cloud/DevOps', confidence: 88 },
    ];
    problemStatement = 'Developers and open-source creators struggle to consistently promote their code repositories on professional networks like LinkedIn, leading to low project visibility and missed growth opportunities.';
    solution = 'RepoVision AI provides an end-to-end automated cloud pipeline that clones GitHub repos, understands technical architecture via LLMs, generates multi-format LinkedIn content (Banners, 10-slide Carousels, Video Scripts), and schedules/publishes them directly.';
    keyFeatures = [
      'Automated GitHub Repo Parsing & AST Tech Stack Detector',
      'AI Context Understanding (Hook, Problem, Solution, Architecture)',
      'Interactive Banner Generator with Glassmorphism & Modern themes',
      '10-Slide Carousel Studio with PDF & Image Export',
      '30-Second Promotional Short Video Script & Preview Studio',
      'Official LinkedIn OAuth Integration with 1-Click Review Queue',
      'Post Analytics & Best-Posting-Time Recommendations'
    ];
    architectureOverview = 'React/Next.js SPA Gateway → FastAPI Microservices → LLM Context Engine (OpenAI + LangChain) → Canvas & PDF Renderers → LinkedIn OAuth Publishing Queue.';
    innovations = [
      'Zero-friction repository URL to multi-format media generation',
      'Dual publishing engine: Direct OAuth posting or 1-Click interactive review queue',
      'Context-aware hashtag extraction & engagement scoring'
    ];
  } else if (repoName.toLowerCase().includes('langchain')) {
    technologies = [
      { name: 'Python 3.11', category: 'Backend', confidence: 99 },
      { name: 'LangChain Core', category: 'AI/ML', confidence: 100 },
      { name: 'OpenAI GPT-4o', category: 'AI/ML', confidence: 95 },
      { name: 'FAISS / Chroma', category: 'Database', confidence: 92 },
      { name: 'Pydantic', category: 'Backend', confidence: 94 },
      { name: 'Docker', category: 'Cloud/DevOps', confidence: 85 },
    ];
    problemStatement = 'Building complex LLM applications requires gluing together prompts, vector databases, memory buffers, and custom tools with significant boilerplate code.';
    solution = 'LangChain offers a composable framework of abstractions and integrations to quickly assemble stateful, agentic AI systems.';
    keyFeatures = [
      'Modular Prompt Templates & Output Parsers',
      'Vector Store Integrations & RAG Pipeline Orchestration',
      'Agentic Execution Loops with Tool Calling',
      'LangSmith Tracing and Evaluation Capabilities'
    ];
    architectureOverview = 'Component Abstractions (LLMs, VectorStores, Tools) → Chain Composition → Agentic Execution → Observability Layer.';
    innovations = ['Standardized interface across 100+ LLM providers and vector DBs'];
  } else {
    // Generic fallback for any other repo URL
    technologies = [
      { name: 'TypeScript / JS', category: 'Frontend', confidence: 94 },
      { name: 'Node.js / Express', category: 'Backend', confidence: 90 },
      { name: 'PostgreSQL', category: 'Database', confidence: 88 },
      { name: 'Docker / Kubernetes', category: 'Cloud/DevOps', confidence: 85 },
      { name: 'OpenAI API', category: 'AI/ML', confidence: 82 },
      { name: 'Tailwind CSS', category: 'Frontend', confidence: 92 },
    ];
    problemStatement = `Modern engineering teams building ${repoName} face scaling, maintainability, and deployment orchestration challenges.`;
    solution = `${repoName} automates core workflows, simplifies API integrations, and speeds up time-to-production using high-performance code patterns.`;
    keyFeatures = [
      'High-throughput asynchronous processing architecture',
      'Modular component structure with full TypeScript definitions',
      'Cloud-native deployment readiness with Docker containerization',
      'Extensive documentation and automated test suites'
    ];
    architectureOverview = 'Client Frontend → API Gateway → Serverless Worker Functions → Relational DB → Cloud Asset Storage.';
    innovations = ['Streamlined developer workflow with instant configuration'];
  }

  return {
    repoUrl: cleanUrl,
    repoName,
    owner,
    stars: repoName.toLowerCase().includes('fastapi') ? 76400 : repoName.toLowerCase().includes('langchain') ? 92100 : 342,
    forks: repoName.toLowerCase().includes('fastapi') ? 6200 : repoName.toLowerCase().includes('langchain') ? 14500 : 89,
    primaryLanguage: technologies[0]?.name || 'TypeScript',
    readmeContent: `# ${repoName}\n\n${problemStatement}\n\n## Key Features\n${keyFeatures.map(f => `- ${f}`).join('\n')}`,
    problemStatement,
    solution,
    keyFeatures,
    architectureOverview,
    targetAudience: 'Software Engineers, Technical Founders, AI Researchers, Product Managers, Open-Source Enthusiasts',
    innovations,
    technologies,
    apiEndpoints: ['/api/v1/analyze', '/api/v1/generate', '/api/v1/publish', '/api/v1/analytics'],
    aiModelsDetected: ['OpenAI GPT-5.5', 'Text-Embedding-3-Large', 'DALL-E 3'],
    cloudServicesDetected: ['AWS S3', 'Cloudflare R2', 'Docker', 'Vercel'],
  };
}
