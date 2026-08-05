import React, { useState } from 'react';
import { BannerConfig, CarouselSlide, ProjectAnalysis } from '../types';
import { BANNER_THEMES, getDefaultBannerConfig } from '../services/bannerGenerator';
import { generateDefaultCarousel } from '../services/carouselGenerator';
import { 
  Palette, 
  Download, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  GitFork, 
  Code2, 
  Check, 
  Layers, 
  FileText,
  FileSpreadsheet,
  QrCode
} from 'lucide-react';

interface VisualStudioProps {
  analysis: ProjectAnalysis | null;
  onSaveMediaToPost?: () => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({ analysis }) => {
  const [mode, setMode] = useState<'banner' | 'carousel'>('banner');
  const [downloaded, setDownloaded] = useState(false);

  // Banner State
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>(() =>
    analysis ? getDefaultBannerConfig(analysis) : {
      theme: 'glassmorphism',
      titleText: 'RepoVision AI',
      subtitleText: 'GitHub Repository to LinkedIn Auto Content Generator & Publisher',
      badgeList: ['React', 'TypeScript', 'FastAPI', 'OpenAI'],
      primaryColor: '#6366f1',
      secondaryColor: '#06b6d4',
      showStats: true,
      starCount: 342,
      forkCount: 89,
      customLogoText: 'RepoVision AI'
    }
  );

  // Carousel State (10 Slides)
  const [slides, setSlides] = useState<CarouselSlide[]>(() =>
    analysis ? generateDefaultCarousel(analysis) : [
      {
        id: 1,
        slideType: 'title',
        title: 'RepoVision AI',
        subtitle: 'GitHub to LinkedIn Auto Publisher',
        bodyText: 'AI Cloud SaaS platform for open source developers.',
        bullets: ['⭐ 342 Stars', '🚀 Automated SaaS', '⚡ Official OAuth'],
        accentColor: '#6366f1'
      }
    ]
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const activeTheme = BANNER_THEMES.find((t) => t.id === bannerConfig.theme) || BANNER_THEMES[0];
  const activeSlide = slides[currentSlideIndex] || slides[0];

  const handleDownloadAsset = (assetType: string) => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleUpdateSlide = (updatedSlide: CarouselSlide) => {
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = updatedSlide;
    setSlides(newSlides);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-purple-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-extrabold text-white">Visual Studio – Banners & 10-Slide Carousels</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Create high-DPI LinkedIn banners and interactive 10-slide PDF carousels designed to boost engagement.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-2 bg-[#090d16] p-1.5 rounded-xl border border-gray-800 shrink-0">
          <button
            onClick={() => setMode('banner')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'banner'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-neon'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>LinkedIn Banner</span>
          </button>

          <button
            onClick={() => setMode('carousel')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'carousel'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-neon'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>10-Slide PDF Carousel</span>
          </button>
        </div>
      </div>

      {/* BANNER STUDIO VIEW */}
      {mode === 'banner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Theme Picker */}
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Choose Banner Aesthetic Theme
              </label>
              <div className="grid grid-cols-1 gap-2">
                {BANNER_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setBannerConfig({ ...bannerConfig, theme: theme.id as any })}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all border ${
                      bannerConfig.theme === theme.id
                        ? 'bg-indigo-950/80 text-white border-indigo-500 shadow-neon'
                        : 'bg-[#090d16] text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <span>{theme.name}</span>
                    {bannerConfig.theme === theme.id && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Banner Text Customizer */}
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Banner Typography & Badges
              </label>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Project Title</label>
                  <input
                    type="text"
                    value={bannerConfig.titleText}
                    onChange={(e) => setBannerConfig({ ...bannerConfig, titleText: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-gray-800 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Subtitle / Tagline</label>
                  <textarea
                    rows={2}
                    value={bannerConfig.subtitleText}
                    onChange={(e) => setBannerConfig({ ...bannerConfig, subtitleText: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-gray-800 rounded-lg text-white font-sans"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-300 font-medium">Show Star & Fork Count</span>
                  <input
                    type="checkbox"
                    checked={bannerConfig.showStats}
                    onChange={(e) => setBannerConfig({ ...bannerConfig, showStats: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                </div>
              </div>

              <button
                onClick={() => handleDownloadAsset('Banner')}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-neon transition-all"
              >
                {downloaded ? <Check className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
                <span>{downloaded ? 'Banner Asset Exported!' : 'Export Banner (PNG)'}</span>
              </button>
            </div>

          </div>

          {/* Banner Live Preview Canvas (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
              LinkedIn Banner Live Preview (1200 x 630 Canvas)
            </span>

            <div className={`w-full aspect-[12/6.3] rounded-2xl p-6 md:p-8 flex flex-col justify-between border shadow-2xl relative overflow-hidden transition-all ${activeTheme.bg} ${activeTheme.border}`}>
              
              {/* Background Glow Overlay */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Banner Header */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{bannerConfig.customLogoText}</span>
                </div>

                {bannerConfig.showStats && (
                  <div className="flex items-center space-x-3 text-xs font-mono font-bold text-white/90 bg-black/40 px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
                    <span className="flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{bannerConfig.starCount}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{bannerConfig.forkCount}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Banner Main Title & Subtitle */}
              <div className="space-y-3 relative z-10 my-auto">
                <h2 className={`text-2xl md:text-4xl font-extrabold tracking-tight font-[#Outfit] bg-clip-text text-transparent bg-gradient-to-r ${activeTheme.accent}`}>
                  {bannerConfig.titleText}
                </h2>
                <p className="text-xs md:text-sm text-gray-200/90 max-w-xl leading-relaxed">
                  {bannerConfig.subtitleText}
                </p>
              </div>

              {/* Tech Badges Row */}
              <div className="flex flex-wrap gap-2 relative z-10">
                {bannerConfig.badgeList.map((badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold font-mono"
                  >
                    {badge}
                  </span>
                ))}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* CAROUSEL STUDIO VIEW */}
      {mode === 'carousel' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls & Slide Editor Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Slide Quick Picker */}
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Select Slide to Edit ({slides.length} Slides Deck)
                </label>
                <span className="text-xs font-mono text-purple-400">Slide {currentSlideIndex + 1} of 10</span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                      currentSlideIndex === idx
                        ? 'bg-purple-600 text-white border-purple-400 shadow-neon'
                        : 'bg-[#090d16] text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Slide Editor Fields */}
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-300">
                Edit Slide #{activeSlide.id}: {activeSlide.title}
              </label>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Slide Title</label>
                  <input
                    type="text"
                    value={activeSlide.title}
                    onChange={(e) => handleUpdateSlide({ ...activeSlide, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-gray-800 rounded-lg text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={activeSlide.subtitle}
                    onChange={(e) => handleUpdateSlide({ ...activeSlide, subtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-gray-800 rounded-lg text-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Body Description</label>
                  <textarea
                    rows={3}
                    value={activeSlide.bodyText}
                    onChange={(e) => handleUpdateSlide({ ...activeSlide, bodyText: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-gray-800 rounded-lg text-gray-200 font-sans"
                  />
                </div>
              </div>

              <button
                onClick={() => handleDownloadAsset('10-Slide PDF Deck')}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-neon transition-all"
              >
                {downloaded ? <Check className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
                <span>{downloaded ? 'PDF Deck Downloaded!' : 'Download 10-Slide PDF Deck'}</span>
              </button>
            </div>

          </div>

          {/* Slide Deck Live Canvas Preview (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Live LinkedIn PDF Carousel Preview
              </span>

              <div className="flex items-center space-x-2">
                <button
                  disabled={currentSlideIndex === 0}
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-400 font-mono">
                  {currentSlideIndex + 1} / {slides.length}
                </span>
                <button
                  disabled={currentSlideIndex === slides.length - 1}
                  onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Canvas Card (Aspect 4:5 LinkedIn Standard) */}
            <div className="w-full max-w-md mx-auto aspect-[4/5] rounded-3xl p-8 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-purple-500/40 shadow-2xl flex flex-col justify-between relative overflow-hidden">
              
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="font-extrabold text-xs text-white tracking-wider">RepoVision AI</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  SLIDE {activeSlide.id}/10
                </span>
              </div>

              {/* Center Content */}
              <div className="space-y-4 my-auto">
                <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 block">
                  {activeSlide.subtitle}
                </span>
                <h3 className="text-2xl font-extrabold text-white leading-tight font-[#Outfit]">
                  {activeSlide.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {activeSlide.bodyText}
                </p>

                {activeSlide.bullets && activeSlide.bullets.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {activeSlide.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs text-gray-200 bg-white/5 p-2.5 rounded-xl border border-white/10">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-medium">{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeSlide.codeSnippet && (
                  <div className="p-3 rounded-xl bg-black/80 border border-cyan-500/30 font-mono text-[10px] text-cyan-300 overflow-x-auto">
                    <pre>{activeSlide.codeSnippet}</pre>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4 text-[10px] text-gray-400">
                <span>Swipe for Next Slide 👉</span>
                <div className="flex items-center space-x-1 text-cyan-400 font-bold">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>GitHub QR Code</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
