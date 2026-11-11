export type TechCategory =
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'Cloud/DevOps'
  | 'AI/ML'
  | 'Tools';

export interface EvidenceItem {
  id: string;
  path: string;
  symbol: string | null;
  excerpt: string;
  line_start: number | null;
  line_end: number | null;
  category: string;
  confidence: number;
  commit_sha: string;
}

export interface Technology {
  name: string;
  category: TechCategory;
  confidence: number;
  inferred: boolean;
  evidence_ids: string[];
}

export interface Feature {
  title: string;
  description: string;
  evidence_ids: string[];
}

export interface ArchitectureComponent {
  name: string;
  role: string;
  evidence_ids: string[];
}

export interface Architecture {
  summary: string;
  components: ArchitectureComponent[];
  data_flow: string[];
  inferred: boolean;
  evidence_ids: string[];
}

export interface TestingInfo {
  frameworks: string[];
  test_file_count: number;
  ci_systems: string[];
  evidence_ids: string[];
  limitations: string[];
}

export interface SecurityFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  path: string | null;
  evidence_ids: string[];
  recommendation: string;
}

export interface DependencyScan {
  status: 'not_run' | 'completed' | 'failed';
  reason: string;
  vulnerabilities_found: number | null;
}

export interface SecurityInfo {
  findings: SecurityFinding[];
  license: string | null;
  license_evidence_ids: string[];
  dependency_scan: DependencyScan;
  scanned_files: number;
  limitations: string[];
}

export interface AnalysisSummary {
  description: string;
  problem_statement: string;
  solution: string;
  primary_language: string | null;
  license: string | null;
}

export interface RepositoryMetadata {
  owner: string;
  name: string;
  url: string;
  description: string | null;
  default_branch: string;
  stars: number;
  forks: number;
  language: string | null;
  license: string | null;
  private: boolean;
  archived: boolean;
  size_kb: number;
}

export interface SnapshotInfo {
  commit_sha: string;
  tree_sha: string;
  branch: string;
  file_count: number;
  analyzed_file_count: number;
  analyzed_bytes: number;
  tree_truncated: boolean;
  fetched_at: string;
}

export interface AnalysisResult {
  run_id: string;
  repo: RepositoryMetadata;
  snapshot: SnapshotInfo;
  summary: AnalysisSummary;
  technologies: Technology[];
  features: Feature[];
  architecture: Architecture;
  testing: TestingInfo;
  security: SecurityInfo;
  api_endpoints: string[];
  evidence: EvidenceItem[];
  limitations: string[];
  metrics: {
    file_count: number;
    analyzed_file_count: number;
    analyzed_bytes: number;
    tree_truncated: boolean;
  };
  provenance: {
    analysis_engine: string;
    llm_used: boolean;
    model: string | null;
  };
}

export type AnalysisStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface AnalysisRun {
  run_id: string;
  status: AnalysisStatus;
  stage: string;
  progress: number;
  repo_url: string;
  owner: string;
  name: string;
  branch: string | null;
  commit_sha: string | null;
  created_at: string;
  updated_at: string;
  error: { code: string; message: string } | null;
  result: AnalysisResult | null;
}

export type ClaimStatus = 'supported' | 'rejected' | 'unverified';

export interface Claim {
  claim: string;
  status: ClaimStatus;
  evidence_ids: string[];
  reason: string;
}

export type DraftStyle =
  | 'professional'
  | 'technical'
  | 'storytelling'
  | 'educational'
  | 'innovation'
  | 'career'
  | 'concise';

export type PostLength = 'short' | 'medium' | 'long';

export interface ContentDraft {
  id: string;
  run_id: string;
  style: DraftStyle;
  length: PostLength;
  status: string;
  title: string;
  body: string;
  hooks: string[];
  hashtags: string[];
  cta: string;
  claims: Claim[];
  warnings: string[];
  generator: string;
  model: string | null;
  created_at: string;
}

export interface Verification {
  ok: boolean;
  claims: Claim[];
  warnings: string[];
}

export interface Capability {
  id: string;
  label: string;
  enabled: boolean;
  reason: string;
}

export interface ConfigStatus {
  app_version: string;
  environment: string;
  database: string;
  github_token_configured: boolean;
  llm_provider: string;
  llm_configured: boolean;
  llm_model: string | null;
  linkedin_configured: boolean;
  linkedin_publishing_enabled: boolean;
  linkedin_required_scopes: string[];
  analysis_engine: string;
  cors_origins: string[];
  capabilities: Capability[];
}

export interface LinkedInPreflight {
  configured: boolean;
  publishing_enabled: boolean;
  required_scopes: string[];
  required_products: string[];
  steps: string[];
  note: string;
}

export interface LinkedInStatus {
  configured: boolean;
  publishing_enabled: boolean;
  connected: boolean;
  member_name: string | null;
  member_picture: string | null;
  scopes: string[];
  expires_at: string | null;
  can_publish: boolean;
  reason: string;
  required_scopes: string[];
}

export interface LinkedInOAuthStart {
  authorization_url: string;
  state: string;
  expires_at: string;
}

export interface LinkedInPublishResult {
  status: string;
  attempt_id: string;
  post_urn: string | null;
  published_at: string;
  has_image: boolean;
}

export interface LinkedInAttempt {
  id: string;
  draft_id: string | null;
  status: string;
  commentary: string;
  has_image: boolean;
  image_urn: string | null;
  post_urn: string | null;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export type BannerTheme =
  | 'linkedin-pro'
  | 'modern-startup'
  | 'glassmorphism'
  | 'dark-cyber'
  | 'minimal-corporate';

export interface BannerConfig {
  theme: BannerTheme;
  titleText: string;
  subtitleText: string;
  badgeList: string[];
  showStats: boolean;
  starCount: number;
  forkCount: number;
  customLogoText: string;
}

export type CarouselSlideType =
  | 'title'
  | 'description'
  | 'problem'
  | 'solution'
  | 'architecture'
  | 'tech'
  | 'features'
  | 'testing'
  | 'security'
  | 'limitations';

export interface CarouselSlide {
  id: number;
  slideType: CarouselSlideType;
  title: string;
  subtitle: string;
  bodyText: string;
  bullets: string[];
  accentColor: string;
}
