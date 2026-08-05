import { GeneratedContent, ProjectAnalysis, User } from '../types';

export const LINKEDIN_CLIENT_ID = '86x9p2q1w3v4u5';
export const LINKEDIN_REDIRECT_URI = window.location.origin + '/oauth/linkedin/callback';

export interface RealLinkedInAccount {
  profileName: string;
  profileUrl: string;
  headline: string;
  accessToken: string;
  isConnected: boolean;
}

export function getLinkedInOAuthAuthUrl(): string {
  const scope = encodeURIComponent('w_member_social r_liteprofile email');
  const state = 'repovision_' + Math.random().toString(36).substring(7);
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&scope=${scope}&state=${state}`;
}

export function openDirectLinkedInShare(content: GeneratedContent, analysis: ProjectAnalysis): void {
  const textToShare = `${content.title}\n\n${content.customBodyText || content.bodyMedium}\n\n${content.hashtags.join(' ')}\n\n⭐ GitHub Repository: ${analysis.repoUrl}`;
  
  // Copy full post to clipboard for instant pasting if LinkedIn web creator opens
  navigator.clipboard.writeText(textToShare);

  // Open official LinkedIn Share Handler URL
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(analysis.repoUrl)}`;
  window.open(linkedinShareUrl, '_blank', 'width=650,height=750');
}
