import type {
  AnalysisRun,
  ConfigStatus,
  ContentDraft,
  DraftStyle,
  EvidenceItem,
  LinkedInPreflight,
  PostLength,
  Verification,
} from '../types';

const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = configuredBase
  ? configuredBase.replace(/\/$/, '')
  : '/api/v1';

export class ApiError extends Error {
  code: string;
  status: number;
  requestId: string | null;

  constructor(message: string, code = 'API_ERROR', status = 0, requestId: string | null = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.requestId = requestId;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    throw new ApiError(
      `The RepoVision backend could not be reached at ${API_BASE_URL}. Start the FastAPI server and try again.`,
      'API_UNREACHABLE',
    );
  }

  const raw = await response.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const error = (payload as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiError(
      error?.message ?? `Request failed with HTTP ${response.status}.`,
      error?.code ?? 'API_ERROR',
      response.status,
      response.headers.get('x-request-id'),
    );
  }

  return payload as T;
}

export function getConfigStatus(): Promise<ConfigStatus> {
  return request<ConfigStatus>('/config/status');
}

export function getLinkedInPreflight(): Promise<LinkedInPreflight> {
  return request<LinkedInPreflight>('/linkedin/preflight');
}

export function startAnalysis(
  repoUrl: string,
  branch?: string,
): Promise<{ run_id: string; status: string; status_url: string }> {
  return request('/analyses', {
    method: 'POST',
    body: JSON.stringify({ repo_url: repoUrl, branch: branch || null }),
  });
}

export function getAnalysis(runId: string): Promise<AnalysisRun> {
  return request<AnalysisRun>(`/analyses/${encodeURIComponent(runId)}`);
}

export function getEvidence(runId: string): Promise<{ run_id: string; evidence: EvidenceItem[] }> {
  return request(`/analyses/${encodeURIComponent(runId)}/evidence`);
}

export function generateContent(payload: {
  run_id: string;
  style: DraftStyle;
  length: PostLength;
}): Promise<ContentDraft> {
  return request<ContentDraft>('/content', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listContent(runId: string): Promise<ContentDraft[]> {
  return request<ContentDraft[]>(`/analyses/${encodeURIComponent(runId)}/content`);
}

export function verifyText(runId: string, text: string): Promise<Verification> {
  return request<Verification>('/content/verify', {
    method: 'POST',
    body: JSON.stringify({ run_id: runId, text }),
  });
}
