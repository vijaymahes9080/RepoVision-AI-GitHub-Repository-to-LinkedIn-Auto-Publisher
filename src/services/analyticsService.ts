import { AnalyticsMetric, TopPerformingPost } from '../types';

export const ANALYTICS_METRICS: AnalyticsMetric[] = [
  { date: 'Jul 30', views: 3400, impressions: 5200, likes: 210, comments: 45, shares: 18, engagementRate: 5.2, followersGained: 34 },
  { date: 'Jul 31', views: 4200, impressions: 6800, likes: 310, comments: 62, shares: 29, engagementRate: 5.9, followersGained: 52 },
  { date: 'Aug 01', views: 5800, impressions: 8900, likes: 450, comments: 88, shares: 41, engagementRate: 6.5, followersGained: 78 },
  { date: 'Aug 02', views: 7100, impressions: 11200, likes: 580, comments: 112, shares: 54, engagementRate: 6.7, followersGained: 95 },
  { date: 'Aug 03', views: 9400, impressions: 14500, likes: 790, comments: 146, shares: 72, engagementRate: 7.0, followersGained: 124 },
  { date: 'Aug 04', views: 11800, impressions: 18200, likes: 980, comments: 184, shares: 91, engagementRate: 7.3, followersGained: 156 },
  { date: 'Aug 05', views: 14200, impressions: 22100, likes: 1240, comments: 230, shares: 115, engagementRate: 7.6, followersGained: 189 },
];

export const TOP_POSTS: TopPerformingPost[] = [
  {
    id: 'top-1',
    title: '🧠 Building Agentic RAG Pipelines with LangChain & Vector DBs',
    date: 'Aug 03, 2026',
    likes: 790,
    comments: 146,
    shares: 72,
    views: 9400,
    engagementRate: 7.0,
    mediaType: '10-Slide PDF Carousel',
  },
  {
    id: 'top-2',
    title: '🌐 The Future of Web Architecture: Next.js App Router',
    date: 'Aug 02, 2026',
    likes: 580,
    comments: 112,
    shares: 54,
    views: 7100,
    engagementRate: 6.7,
    mediaType: 'Glassmorphism Banner',
  },
  {
    id: 'top-3',
    title: '🚀 Introducing RepoVision AI – Automate GitHub to LinkedIn Publishing',
    date: 'Aug 01, 2026',
    likes: 450,
    comments: 88,
    shares: 41,
    views: 5800,
    engagementRate: 6.5,
    mediaType: '10-Slide PDF Carousel',
  },
];

export const AI_RECOMMENDATIONS = [
  {
    type: 'Timing',
    title: 'Best Posting Time',
    recommendation: 'Posts scheduled on Tuesdays & Thursdays at 9:30 AM EST receive 42% higher engagement.',
    impact: '+42% Views',
  },
  {
    type: 'Format',
    title: 'Media Format Winner',
    recommendation: '10-slide PDF carousels generate 3.4x more clicks and saves than single image banners.',
    impact: '3.4x Clicks',
  },
  {
    type: 'Hook',
    title: 'Hook Optimization',
    recommendation: 'Opening with a quantifiable challenge ("Most dev tools fail at step 1...") increases read-through rate.',
    impact: '+28% Retain',
  },
  {
    type: 'Hashtag',
    title: 'Hashtag Synergy',
    recommendation: 'Combining #OpenSource + #AI + #React yields the highest algorithmic distribution on LinkedIn.',
    impact: 'Top 5%',
  },
];
