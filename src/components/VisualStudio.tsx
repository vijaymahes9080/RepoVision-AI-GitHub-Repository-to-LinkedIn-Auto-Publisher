import React, { useEffect, useRef, useState } from 'react';
import type {
  AnalysisResult,
  BannerConfig,
  CarouselSlide,
  ContentDraft,
  LinkedInPublishResult,
  LinkedInStatus,
} from '../types';
import { BANNER_THEMES, getDefaultBannerConfig } from '../services/bannerGenerator';
import { generateDefaultCarousel } from '../services/carouselGenerator';
import {
  downloadBannerPng,
  downloadCarouselPdf,
  renderBannerPngDataUrl,
} from '../services/exportService';
import { getLinkedInStatus, publishToLinkedIn } from '../api/client';
import { LinkedinIcon } from './Icons';
import {
  Palette,
  Download,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
  GitFork,
  Check,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  Info,
  ExternalLink,
} from 'lucide-react';

interface VisualStudioProps {
  analysis: AnalysisResult | null;
  draft: ContentDraft | null;
  onNavigateToIntegrations: () => void;
}

const SlideCanvas: React.FC<{ slide: CarouselSlide; total: number; fixed?: boolean }> = ({
  slide,
  total,
  fixed = false,
}) => (
  <div
    className={`${
      fixed ? 'w-[1080px] h-[1350px] p-20' : 'w-full max-w-md aspect-[4/5] p-8'
    } rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-purple-500/40 shadow-2xl flex flex-col justify-between relative overflow-hidden`}
  >
    <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: slide.accentColor }} />
    <div className={`flex items-center justify-between border-b border-white/10 ${fixed ? 'pb-8' : 'pb-4'}`}>
      <div className="flex items-center space-x-2">
        <Sparkles className={fixed ? 'w-8 h-8 text-cyan-400' : 'w-4 h-4 text-cyan-400'} />
        <span className={`font-extrabold text-white tracking-wider ${fixed ? 'text-2xl' : 'text-xs'}`}>
          RepoVision · evidence snapshot
        </span>
      </div>
      <span
        className={`font-mono font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 ${
          fixed ? 'text-xl px-4 py-1.5' : 'text-[10px] px-2 py-0.5'
        }`}
      >
        {slide.id}/{total}
      </span>
    </div>

    <div className={`${fixed ? 'space-y-8' : 'space-y-4'} my-auto`}>
      <span
        className={`font-bold uppercase tracking-widest text-cyan-400 block ${
          fixed ? 'text-xl' : 'text-[11px]'
        }`}
      >
        {slide.subtitle}
      </span>
      <h3 className={`font-extrabold text-white leading-tight ${fixed ? 'text-6xl' : 'text-2xl'}`}>
        {slide.title}
      </h3>
      {slide.bodyText && (
        <p className={`text-gray-300 leading-relaxed ${fixed ? 'text-2xl' : 'text-xs'}`}>
          {slide.bodyText}
        </p>
      )}

      {slide.bullets.length > 0 && (
        <div className={`${fixed ? 'space-y-3 pt-4' : 'space-y-2 pt-2'}`}>
          {slide.bullets.map((bullet) => (
            <div
              key={bullet}
              className={`flex items-start text-gray-200 bg-white/5 rounded-xl border border-white/10 ${
                fixed ? 'space-x-3 text-xl p-4' : 'space-x-2 text-xs p-2.5'
              }`}
            >
              <Check className={`text-emerald-400 shrink-0 ${fixed ? 'w-6 h-6 mt-0.5' : 'w-3.5 h-3.5'}`} />
              <span className="font-medium break-words">{bullet}</span>
            </div>
          ))}
        </div>
      )}
    </div>

    <div
      className={`flex items-center justify-between border-t border-white/10 text-gray-400 ${
        fixed ? 'pt-8 text-lg' : 'pt-4 text-[10px]'
      }`}
    >
      <span>Static analysis · no code execution</span>
      <span className="text-cyan-400 font-bold">github.com</span>
    </div>
  </div>
);

export const VisualStudio: React.FC<VisualStudioProps> = ({
  analysis,
  draft,
  onNavigateToIntegrations,
}) => {
  const [mode, setMode] = useState<'banner' | 'carousel'>('banner');
  const [bannerConfig, setBannerConfig] = useState<BannerConfig | null>(
    analysis ? getDefaultBannerConfig(analysis) : null,
  );
  const [slides, setSlides] = useState<CarouselSlide[]>(
    analysis ? generateDefaultCarousel(analysis) : [],
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [exporting, setExporting] = useState<'banner' | 'pdf' | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [linkedinStatus, setLinkedinStatus] = useState<LinkedInStatus | null>(null);
  const [linkedinError, setLinkedinError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishConfirmed, setPublishConfirmed] = useState(false);
  const [publishResult, setPublishResult] = useState<LinkedInPublishResult | null>(null);

  const bannerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);

  const loadLinkedInStatus = useCallback(async () => {
    try {
      setLinkedinStatus(await getLinkedInStatus());
      setLinkedinError(null);
    } catch (error) {
      setLinkedinStatus(null);
      setLinkedinError(error instanceof Error ? error.message : 'LinkedIn status failed.');
    }
  }, []);

  useEffect(() => {
    void loadLinkedInStatus();
  }, [loadLinkedInStatus]);

  useEffect(() => {
    if (!analysis) {
      setBannerConfig(null);
      setSlides([]);
      setCurrentSlideIndex(0);
      return;
    }
    setBannerConfig(getDefaultBannerConfig(analysis));
    setSlides(generateDefaultCarousel(analysis));
    setCurrentSlideIndex(0);
    setExportMessage(null);
    setExportError(null);
    setPublishResult(null);
    setPublishConfirmed(false);
  }, [analysis]);

  if (!analysis || !bannerConfig) {
    return (
      <div className="glass-panel p-12 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12">
        <Palette className="w-12 h-12 text-purple-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No snapshot to visualise</h2>
        <p className="text-xs text-gray-400">
          Analyze a repository first. Banner and carousel content is generated only from the stored
          analysis, and exports are rendered locally in this browser.
        </p>
      </div>
    );
  }

  const activeTheme = BANNER_THEMES.find((theme) => theme.id === bannerConfig.theme) ?? BANNER_THEMES[0];
  const activeSlide = slides[currentSlideIndex] ?? slides[0];
  const basename = `${analysis.repo.owner}-${analysis.repo.name}`;

  const handleUpdateSlide = (updatedSlide: CarouselSlide) => {
    setSlides((current) =>
      current.map((slide, index) => (index === currentSlideIndex ? updatedSlide : slide)),
    );
    setExportMessage(null);
  };

  const handleExportBanner = async () => {
    if (!bannerRef.current) return;
    setExporting('banner');
    setExportError(null);
    setExportMessage(null);
    try {
      const filename = await downloadBannerPng(bannerRef.current, basename);
      setExportMessage(`Downloaded ${filename}`);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Banner export failed.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportCarousel = async () => {
    if (!deckRef.current) return;
    setExporting('pdf');
    setExportError(null);
    setExportMessage(null);
    try {
      const nodes = Array.from(
        deckRef.current.querySelectorAll<HTMLElement>('[data-carousel-slide]'),
      );
      const filename = await downloadCarouselPdf(nodes, basename);
      setExportMessage(`Downloaded ${filename}`);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'PDF export failed.');
    } finally {
      setExporting(null);
    }
  };

  const handlePublish = async () => {
    if (!bannerRef.current || !draft) return;
    setPublishing(true);
    setLinkedinError(null);
    setPublishResult(null);
    try {
      const image = await renderBannerPngDataUrl(bannerRef.current);
      const result = await publishToLinkedIn({
        draft_id: draft.id,
        confirm: publishConfirmed,
        image_base64: image,
      });
      setPublishResult(result);
      setPublishConfirmed(false);
      await loadLinkedInStatus();
    } catch (error) {
      setLinkedinError(error instanceof Error ? error.message : 'LinkedIn publishing failed.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-purple-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-extrabold text-white">Visual Studio</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Create a real PNG banner or a PDF carousel from this snapshot. Media is rendered and
            downloaded in your browser; RepoVision does not upload it anywhere.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#090d16] p-1.5 rounded-xl border border-gray-800 shrink-0">
          <button
            onClick={() => setMode('banner')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'banner'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Banner PNG</span>
          </button>

          <button
            onClick={() => setMode('carousel')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'carousel'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Carousel PDF</span>
          </button>
        </div>
      </div>

      {(exportMessage || exportError) && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start space-x-3 ${
            exportError
              ? 'bg-red-950/50 border-red-500/40 text-red-200'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
          }`}
        >
          {exportError ? (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <span>{exportError ?? exportMessage}</span>
        </div>
      )}

      {mode === 'banner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Banner theme
              </label>
              <div className="grid grid-cols-1 gap-2">
                {BANNER_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setBannerConfig({ ...bannerConfig, theme: theme.id })}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all border ${
                      bannerConfig.theme === theme.id
                        ? 'bg-indigo-950/80 text-white border-indigo-500'
                        : 'bg-[#090d16] text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <span>{theme.name}</span>
                    {bannerConfig.theme === theme.id && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Banner content
              </label>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Project title</label>
                  <input
                    type="text"
                    value={bannerConfig.titleText}
                    onChange={(event) =>
                      setBannerConfig({ ...bannerConfig, titleText: event.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#090d16] border border-gray-800 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">
                    Documented description
                  </label>
                  <textarea
                    rows={3}
                    value={bannerConfig.subtitleText}
                    onChange={(event) =>
                      setBannerConfig({ ...bannerConfig, subtitleText: event.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#090d16] border border-gray-800 rounded-lg text-white font-sans"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Starts from README or repository metadata. Edits are your responsibility.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-300 font-medium">
                    Show snapshot star and fork counts
                  </span>
                  <input
                    type="checkbox"
                    checked={bannerConfig.showStats}
                    onChange={(event) =>
                      setBannerConfig({ ...bannerConfig, showStats: event.target.checked })
                    }
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                </div>
              </div>

              <button
                onClick={handleExportBanner}
                disabled={exporting !== null}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-60 text-white font-bold text-xs transition-all"
              >
                {exporting === 'banner' ? (
                  <RefreshIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{exporting === 'banner' ? 'Rendering PNG…' : 'Download banner PNG'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
              Live banner preview
            </span>

            <div
              ref={bannerRef}
              className={`w-full aspect-[1200/630] rounded-2xl p-6 md:p-8 flex flex-col justify-between border shadow-2xl relative overflow-hidden ${activeTheme.bg} ${activeTheme.border}`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between relative z-10 gap-3">
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{bannerConfig.customLogoText}</span>
                </div>

                {bannerConfig.showStats && (
                  <div className="flex items-center space-x-3 text-xs font-mono font-bold text-white/90 bg-black/40 px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
                    <span className="flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{bannerConfig.starCount.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{bannerConfig.forkCount.toLocaleString()}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3 relative z-10 my-auto">
                <h2
                  className={`text-2xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${activeTheme.accent}`}
                >
                  {bannerConfig.titleText}
                </h2>
                <p className="text-xs md:text-sm text-gray-200/90 max-w-xl leading-relaxed">
                  {bannerConfig.subtitleText}
                </p>
              </div>

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

            <p className="text-[10px] text-gray-500 flex items-center space-x-1">
              <Info className="w-3 h-3" />
              <span>
                Star and fork counts are the values returned by GitHub when this snapshot was
                fetched. They are not live engagement metrics.
              </span>
            </p>
          </div>
        </div>
      )}

      {mode === 'carousel' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Select slide ({slides.length} slides)
                </label>
                <span className="text-xs font-mono text-purple-400">
                  {currentSlideIndex + 1} / {slides.length}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                      currentSlideIndex === index
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-[#090d16] text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    #{index + 1}
                  </button>
                ))}
              </div>
            </div>

            {activeSlide && (
              <div className="glass-card p-5 rounded-2xl space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300">
                  Edit slide #{activeSlide.id}
                </label>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Slide title</label>
                    <input
                      type="text"
                      value={activeSlide.title}
                      onChange={(event) =>
                        handleUpdateSlide({ ...activeSlide, title: event.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#090d16] border border-gray-800 rounded-lg text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={activeSlide.subtitle}
                      onChange={(event) =>
                        handleUpdateSlide({ ...activeSlide, subtitle: event.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#090d16] border border-gray-800 rounded-lg text-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Body</label>
                    <textarea
                      rows={3}
                      value={activeSlide.bodyText}
                      onChange={(event) =>
                        handleUpdateSlide({ ...activeSlide, bodyText: event.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#090d16] border border-gray-800 rounded-lg text-gray-200 font-sans"
                    />
                  </div>
                </div>

                <button
                  onClick={handleExportCarousel}
                  disabled={exporting !== null || slides.length === 0}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-60 text-white font-bold text-xs transition-all"
                >
                  {exporting === 'pdf' ? (
                    <RefreshIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{exporting === 'pdf' ? 'Rendering PDF…' : 'Download carousel PDF'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Slide preview
              </span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={currentSlideIndex === 0}
                  onClick={() => setCurrentSlideIndex((previous) => Math.max(0, previous - 1))}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentSlideIndex === slides.length - 1}
                  onClick={() =>
                    setCurrentSlideIndex((previous) => Math.min(slides.length - 1, previous + 1))
                  }
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {activeSlide && (
              <div className="mx-auto">
                <SlideCanvas slide={activeSlide} total={slides.length} />
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-gray-500">
              <span>PDF pages are rendered at 1080 × 1350 px.</span>
              <a
                href={analysis.repo.url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-300 hover:text-cyan-300 flex items-center space-x-1"
              >
                <span>Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="fixed left-[-20000px] top-0" aria-hidden="true">
        <div ref={deckRef} className="space-y-6">
          {slides.map((slide) => (
            <div key={`export-${slide.id}`} data-carousel-slide>
              <SlideCanvas slide={slide} total={slides.length} fixed />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-2.64-6.36" />
    <path d="M21 3v6h-6" />
  </svg>
);
