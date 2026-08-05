import React, { useState } from 'react';
import { ScheduledPost, User } from '../types';
import { INITIAL_SCHEDULED_POSTS } from '../services/publisherService';
import { LinkedinIcon } from './Icons';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Send, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  CalendarCheck,
  TrendingUp
} from 'lucide-react';

interface SchedulerViewProps {
  user: User;
  onNavigateToContent: () => void;
}

export const SchedulerView: React.FC<SchedulerViewProps> = ({ user }) => {
  const [posts, setPosts] = useState<ScheduledPost[]>(INITIAL_SCHEDULED_POSTS);
  const [publishedPostId, setPublishedPostId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [campaignMode, setCampaignMode] = useState(false);

  const [newPostDate, setNewPostDate] = useState('2026-08-08');
  const [newPostTime, setNewPostTime] = useState('09:30 AM');
  const [newPostTitle, setNewPostTitle] = useState('🚀 AI Open Source Spotlight');

  const handlePublishNow = (postId: string) => {
    setPublishedPostId(postId);
    setTimeout(() => {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, status: 'published' as const } : p))
      );
      setPublishedPostId(null);
    }, 1800);
  };

  const handleScheduleNew = () => {
    const newEntry: ScheduledPost = {
      id: `post-${Date.now()}`,
      repoName: 'vijaymahes9080/RepoVision-AI',
      postTitle: newPostTitle,
      postBody: 'Auto generated campaign post scheduled from RepoVision AI Cloud SaaS...',
      hashtags: ['#AI', '#OpenSource', '#LinkedInAutoPublish'],
      scheduledDate: newPostDate,
      scheduledTime: newPostTime,
      status: 'scheduled',
      mediaType: 'carousel',
      linkedInAccount: user.linkedInAccountName || 'Vijay Mahes (Personal Profile)',
      engagementScoreEstimate: 95,
    };

    setPosts([newEntry, ...posts]);
    setShowModal(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-linkedin-blue/40">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-linkedin-blue" />
            <h1 className="text-xl font-extrabold text-white">LinkedIn Publisher & Cloud Scheduler</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Official OAuth scheduling engine. Queue daily, weekly, or custom date campaigns without keeping your PC online.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCampaignMode(!campaignMode)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              campaignMode
                ? 'bg-purple-600 text-white border-purple-400 shadow-neon'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
            }`}
          >
            {campaignMode ? '✨ Campaign Mode ACTIVE' : 'Enable Campaign Mode'}
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-linkedin-blue to-indigo-600 hover:from-linkedin-hover hover:to-indigo-500 text-white font-bold text-xs shadow-neon-linkedin transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Post</span>
          </button>
        </div>
      </div>

      {/* Compliance Notice Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start space-x-3 text-xs text-indigo-200">
        <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white block font-bold">Platform OAuth Compliance & 1-Click Fallback Queue</strong>
          <p className="text-gray-300 leading-relaxed">
            Where LinkedIn API permissions do not permit direct posting for a specific account tier, RepoVision AI queues the fully generated content, high-DPI banner, and 10-slide PDF carousel for a <strong>1-Click Review & Post</strong> action so your workflow remains 100% compliant and seamless.
          </p>
        </div>
      </div>

      {/* Scheduled Posts Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Publishing Queue & Post History ({posts.length} Items)</span>
          </h2>

          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Cloud Worker Running</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => {
            const isPublishingThis = publishedPostId === post.id;
            return (
              <div
                key={post.id}
                className="glass-card p-5 rounded-2xl border border-gray-800 hover:border-linkedin-blue/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-mono text-xs text-cyan-300 font-bold">{post.repoName}</span>
                    <span className="text-gray-500">•</span>
                    
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      post.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : post.status === 'scheduled'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {post.status.toUpperCase()}
                    </span>

                    <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 text-[10px] font-semibold border border-purple-800/40">
                      {post.mediaType.toUpperCase()} ATTACHED
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{post.postTitle}</h3>
                  <p className="text-xs text-gray-400 line-clamp-1">{post.postBody}</p>

                  <div className="flex items-center space-x-4 text-[11px] text-gray-400 pt-1">
                    <span className="flex items-center space-x-1">
                      <CalendarCheck className="w-3.5 h-3.5 text-linkedin-blue" />
                      <span>{post.scheduledDate} at {post.scheduledTime}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Score: <strong className="text-white">{post.engagementScoreEstimate}/100</strong></span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {post.status === 'published' ? (
                    <div className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Published to LinkedIn</span>
                    </div>
                  ) : (
                    <button
                      disabled={isPublishingThis}
                      onClick={() => handlePublishNow(post.id)}
                      className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-linkedin-blue to-indigo-600 hover:from-linkedin-hover hover:to-indigo-500 text-white font-bold text-xs shadow-neon-linkedin transition-all disabled:opacity-50"
                    >
                      {isPublishingThis ? (
                        <>
                          <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Publish Now</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/40 max-w-md w-full space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">Schedule LinkedIn Post</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Post Headline</label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-gray-800 rounded-lg text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Target Date</label>
                <input
                  type="date"
                  value={newPostDate}
                  onChange={(e) => setNewPostDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-gray-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Optimal Time</label>
                <select
                  value={newPostTime}
                  onChange={(e) => setNewPostTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-gray-800 rounded-lg text-white font-mono"
                >
                  <option value="09:30 AM">09:30 AM (Recommended Peak)</option>
                  <option value="02:00 PM">02:00 PM (Afternoon Peak)</option>
                  <option value="06:00 PM">06:00 PM (Evening Peak)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleNew}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-neon"
              >
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
