import React from 'react';
import { AI_RECOMMENDATIONS, ANALYTICS_METRICS, TOP_POSTS } from '../services/analyticsService';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  ThumbsUp, 
  Share2, 
  Users, 
  Sparkles, 
  Lightbulb, 
  Award,
  ArrowUpRight
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const currentMetric = ANALYTICS_METRICS[ANALYTICS_METRICS.length - 1];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-emerald-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-extrabold text-white">Post Analytics & AI Optimization Insights</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Track views, impressions, engagement rates, follower growth, and algorithmic post performance.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs font-bold text-emerald-300">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Avg Engagement: +7.6% (Top 2% on LinkedIn)</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-blue-500/20">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total Impressions</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white font-mono">{currentMetric.impressions.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              +18.4% <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <span className="text-[10px] text-gray-500">Across 12 campaigns</span>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2 border border-purple-500/20">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Post Views</span>
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white font-mono">{currentMetric.views.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              +24.1% <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <span className="text-[10px] text-gray-500">Unique feed reads</span>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2 border border-emerald-500/20">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total Engagements</span>
            <ThumbsUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white font-mono">{currentMetric.likes.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              +12.8% <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <span className="text-[10px] text-gray-500">Likes, comments & shares</span>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2 border border-cyan-500/20">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Followers Gained</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white font-mono">+{currentMetric.followersGained}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              +31.2% <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <span className="text-[10px] text-gray-500">Attributed to repo posts</span>
        </div>

      </div>

      {/* Chart & AI Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Trend Bar Chart Visualization (7 Cols) */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>7-Day Impression & View Growth Trend</span>
            </h3>
            <span className="text-xs text-gray-400 font-mono">Weekly Breakdown</span>
          </div>

          {/* Bar Chart Bars */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-gray-800">
            {ANALYTICS_METRICS.map((m) => {
              const maxImp = 25000;
              const heightPct = (m.impressions / maxImp) * 100;
              return (
                <div key={m.date} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(m.impressions / 1000).toFixed(1)}k
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 via-cyan-500 to-emerald-400 transition-all group-hover:brightness-125"
                    style={{ height: `${heightPct}%` }}
                  ></div>
                  <span className="text-[10px] text-gray-400 font-mono">{m.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Optimization Recommendations (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Engagement Recommendations</span>
          </h3>

          <div className="space-y-3">
            {AI_RECOMMENDATIONS.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-2xl glass-panel border border-indigo-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>{rec.title}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    {rec.impact}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed pt-1">{rec.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top Performing Posts Table */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Top Performing LinkedIn Content</span>
          </h3>
          <span className="text-xs text-gray-400">Ranked by Engagement Rate</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#090d16] text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <tr>
                <th className="p-3">Post Title</th>
                <th className="p-3">Media Format</th>
                <th className="p-3">Published Date</th>
                <th className="p-3">Views</th>
                <th className="p-3">Likes</th>
                <th className="p-3">Comments</th>
                <th className="p-3 text-right">Engagement Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {TOP_POSTS.map((post) => (
                <tr key={post.id} className="hover:bg-gray-800/40 transition-all">
                  <td className="p-3 font-semibold text-white max-w-xs truncate">{post.title}</td>
                  <td className="p-3 font-mono text-purple-300">{post.mediaType}</td>
                  <td className="p-3 text-gray-400">{post.date}</td>
                  <td className="p-3 font-mono text-white">{post.views.toLocaleString()}</td>
                  <td className="p-3 font-mono text-emerald-400">{post.likes}</td>
                  <td className="p-3 font-mono text-cyan-400">{post.comments}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-300">{post.engagementRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
