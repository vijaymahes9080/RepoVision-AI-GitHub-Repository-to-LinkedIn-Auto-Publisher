import React, { useState, useEffect } from 'react';
import { ProjectAnalysis, VideoScriptSegment } from '../types';
import { generateVideoScript } from '../services/videoScriptGenerator';
import { 
  Video, 
  Play, 
  Pause, 
  Sparkles, 
  Volume2, 
  Download, 
  Check, 
  Mic, 
  Film
} from 'lucide-react';

interface VideoStudioProps {
  analysis: ProjectAnalysis | null;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({ analysis }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  const segments: VideoScriptSegment[] = analysis
    ? generateVideoScript(analysis)
    : [
        {
          id: 1,
          timeRange: '0:00 - 0:05',
          headline: 'Meet RepoVision AI',
          visualCue: 'Fast glowing title reveal with neon blue particles',
          narrationText: 'Tired of spending hours promoting your open source projects on LinkedIn? Meet RepoVision AI.',
          techBadges: ['TypeScript', 'GitHub API'],
        },
        {
          id: 2,
          timeRange: '0:05 - 0:12',
          headline: 'Automated AI Code Understanding',
          visualCue: 'Scanning repository AST structure and dependency tree',
          narrationText: 'RepoVision AI automatically clones your repository, analyzes your architecture, and detects 30+ frameworks in seconds.',
          codeSnippet: 'const analysis = await analyzeRepo(url);\nconsole.log(analysis.technologies);',
          techBadges: ['FastAPI', 'OpenAI', 'LangChain'],
        },
      ];

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveSegmentIndex((prev) => (prev < segments.length - 1 ? prev + 1 : 0));
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, segments.length]);

  const activeSegment = segments[activeSegmentIndex] || segments[0];

  const handleDownloadVideo = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-pink-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-pink-400" />
            <h1 className="text-xl font-extrabold text-white">30-Second AI Short Video Studio</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Automated short promo video script, AI audio narration voiceover, code animations, and background music setup.
          </p>
        </div>

        <button
          onClick={handleDownloadVideo}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-neon transition-all shrink-0"
        >
          {downloaded ? <Check className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
          <span>{downloaded ? 'Video Script & Assets Ready!' : 'Export 30s Video (MP4 / Script)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Animated Video Player Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-2">
              <Film className="w-4 h-4 text-pink-400" />
              <span>Interactive 30s Short Video Preview</span>
            </span>

            <span className="text-xs font-mono text-pink-400 font-semibold">
              Segment {activeSegmentIndex + 1} / {segments.length} ({activeSegment.timeRange})
            </span>
          </div>

          {/* Player Container */}
          <div className="relative w-full max-w-sm mx-auto aspect-[9/16] rounded-3xl bg-black border-2 border-pink-500/50 shadow-2xl overflow-hidden flex flex-col justify-between p-6">
            
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/60 via-purple-950/80 to-black pointer-events-none"></div>

            {/* Top Bar */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="font-extrabold text-xs text-white">RepoVision Shorts</span>
              </div>
              <div className="flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                <Mic className="w-3 h-3 animate-bounce" />
                <span>AI Narration Active</span>
              </div>
            </div>

            {/* Middle Video Visual Content */}
            <div className="relative z-10 space-y-4 my-auto text-center">
              
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[11px] font-bold">
                <span>{activeSegment.visualCue}</span>
              </div>

              <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight font-[#Outfit] tracking-tight">
                {activeSegment.headline}
              </h2>

              {activeSegment.codeSnippet && (
                <div className="p-3 rounded-xl bg-black/90 border border-cyan-500/40 font-mono text-[10px] text-cyan-300 text-left overflow-x-auto shadow-inner">
                  <pre>{activeSegment.codeSnippet}</pre>
                </div>
              )}

              {/* Tech Badges */}
              {activeSegment.techBadges && (
                <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                  {activeSegment.techBadges.map((badge) => (
                    <span key={badge} className="px-2.5 py-0.5 rounded-md bg-white/10 text-white text-[10px] font-mono border border-white/20">
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Narration Captions & Waveform */}
            <div className="relative z-10 space-y-3 pt-4 border-t border-white/10">
              
              {/* Captions Box */}
              <div className="p-3 rounded-xl bg-black/80 border border-white/20 text-center">
                <span className="text-[10px] uppercase font-bold text-pink-400 block mb-1">
                  🗣️ AI Audio Voiceover Transcript:
                </span>
                <p className="text-xs text-yellow-200 font-semibold leading-relaxed font-sans">
                  "{activeSegment.narrationText}"
                </p>
              </div>

              {/* Controls & Waveform */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-neon hover:scale-105 transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>

                {/* Animated Waveform Visualizer */}
                <div className="flex items-center space-x-1">
                  {[40, 70, 30, 90, 50, 80, 40, 100, 60, 30].map((h, idx) => (
                    <div
                      key={idx}
                      className={`w-1 rounded-full bg-pink-400 transition-all ${
                        isPlaying ? 'animate-pulse' : 'opacity-40'
                      }`}
                      style={{ height: isPlaying ? `${h / 4}px` : '6px' }}
                    ></div>
                  ))}
                </div>

                <div className="flex items-center space-x-1 text-[10px] text-gray-400">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Licensed Audio</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Storyboard Script Breakdowns (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
            Video Storyboard & Audio Narration Timelines
          </span>

          <div className="space-y-3">
            {segments.map((seg, idx) => (
              <button
                key={seg.id}
                onClick={() => {
                  setActiveSegmentIndex(idx);
                  setIsPlaying(false);
                }}
                className={`w-full text-left p-4 rounded-2xl transition-all border ${
                  activeSegmentIndex === idx
                    ? 'bg-pink-950/60 border-pink-500/60 shadow-neon'
                    : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-pink-400">
                    Segment {idx + 1} ({seg.timeRange})
                  </span>
                  {activeSegmentIndex === idx && (
                    <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold">
                      Active Frame
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-white mb-1">{seg.headline}</h4>
                <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                  "{seg.narrationText}"
                </p>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
