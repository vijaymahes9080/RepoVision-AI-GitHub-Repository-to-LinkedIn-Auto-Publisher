export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  connectedGitHub: boolean;
  connectedLinkedIn: boolean;
  connectedGoogle: boolean;
  linkedInAccountName?: string;
  githubUsername?: string;
  apiTokens: {
    openaiKey?: string;
    githubToken?: string;
    linkedInToken?: string;
  };
}

export interface TechItem {
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'Cloud/DevOps' | 'AI/ML' | 'Tools';
  icon?: string;
  confidence: number; // percentage
}

export interface ProjectAnalysis {
  repoUrl: string;
  repoName: string;
  owner: string;
  stars: number;
  forks: number;
  primaryLanguage: string;
  readmeContent: string;
  problemStatement: string;
  solution: string;
  keyFeatures: string[];
  architectureOverview: string;
  targetAudience: string;
  innovations: string[];
  technologies: TechItem[];
  apiEndpoints: string[];
  aiModelsDetected: string[];
  cloudServicesDetected: string[];
}

export type PostLength = 'short' | 'medium' | 'long';

export interface GeneratedContent {
  title: string;
  hooks: string[];
  selectedHookIndex: number;
  bodyShort: string;
  bodyMedium: string;
  bodyLong: string;
  hashtags: string[];
  cta: string;
  aiImagePrompts: string[];
  selectedLength: PostLength;
  customBodyText?: string;
}

export type BannerTheme = 'linkedin-pro' | 'modern-startup' | 'glassmorphism' | 'dark-cyber' | 'minimal-corporate';

export interface BannerConfig {
  theme: BannerTheme;
  titleText: string;
  subtitleText: string;
  badgeList: string[];
  primaryColor: string;
  secondaryColor: string;
  showStats: boolean;
  starCount: number;
  forkCount: number;
  customLogoText: string;
}

export interface CarouselSlide {
  id: number;
  slideType: 'title' | 'problem' | 'solution' | 'architecture' | 'tech' | 'features' | 'results' | 'qrcode' | 'future' | 'thankyou';
  title: string;
  subtitle: string;
  bodyText: string;
  bullets?: string[];
  accentColor?: string;
  codeSnippet?: string;
}

export interface VideoScriptSegment {
  id: number;
  timeRange: string;
  headline: string;
  visualCue: string;
  narrationText: string;
  codeSnippet?: string;
  techBadges?: string[];
}

export interface ScheduledPost {
  id: string;
  repoName: string;
  postTitle: string;
  postBody: string;
  hashtags: string[];
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'draft' | 'needs_review';
  mediaType: 'text' | 'banner' | 'carousel' | 'video';
  linkedInAccount: string;
  engagementScoreEstimate: number;
}

export interface AnalyticsMetric {
  date: string;
  views: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  followersGained: number;
}

export interface TopPerformingPost {
  id: string;
  title: string;
  date: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  engagementRate: number;
  mediaType: string;
}
