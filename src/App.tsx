import React, { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AnalysisResult,
  AnalysisRun,
  ConfigStatus,
  ContentDraft,
  DraftStyle,
  PostLength,
  Verification,
} from './types';
import {
  generateContent,
  getAnalysis,
  getConfigStatus,
  listContent,
  startAnalysis,
  verifyText,
} from './api/client';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { RepoAnalyzer } from './components/RepoAnalyzer';
import { ContentStudio } from './components/ContentStudio';
import { VisualStudio } from './components/VisualStudio';
import { SecurityView } from './components/SecurityView';
import { IntegrationsView } from './components/IntegrationsView';
import { AdminView } from './components/AdminView';
import { DisabledModuleView } from './components/DisabledModuleView';

const STORAGE_KEY = 'repovision.activeRunId';
const PLANNED_TABS: TabType[] = [
  'video',
  'blog',
  'twitter',
  'resume',
  'portfolio',
  'scheduler',
  'analytics',
];

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('analyzer');
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [run, setRun] = useState<AnalysisRun | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ContentDraft | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  const currentRunIdRef = useRef<string | null>(null);
  const draftRequestRef = useRef<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      const status = await getConfigStatus();
      setConfig(status);
      setConfigError(null);
    } catch (error) {
      setConfig(null);
      setConfigError(errorMessage(error));
    }
  }, []);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const ensureDraft = useCallback(async (runId: string) => {
    if (draftRequestRef.current === runId) return;
    draftRequestRef.current = runId;
    try {
      const drafts = await listContent(runId);
      if (currentRunIdRef.current !== runId) return;
      if (drafts.length > 0) {
        setDraft(drafts[0]);
        return;
      }
      setIsGenerating(true);
      setContentError(null);
      try {
        const generated = await generateContent({
          run_id: runId,
          style: 'professional',
          length: 'medium',
        });
        if (currentRunIdRef.current === runId) {
          setDraft(generated);
        }
      } catch (error) {
        if (currentRunIdRef.current === runId) {
          setContentError(errorMessage(error));
        }
      } finally {
        if (currentRunIdRef.current === runId) {
          setIsGenerating(false);
        }
      }
    } catch (error) {
      if (currentRunIdRef.current === runId) {
        setContentError(errorMessage(error));
      }
    } finally {
      if (draftRequestRef.current === runId) {
        draftRequestRef.current = null;
      }
    }
  }, []);

  // Resume the last analysis when the page is reloaded.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    currentRunIdRef.current = stored;
    let cancelled = false;

    (async () => {
      try {
        const restored = await getAnalysis(stored);
        if (cancelled || currentRunIdRef.current !== stored) return;
        setRun(restored);
        if (restored.status === 'completed' && restored.result) {
          setAnalysis(restored.result);
          await ensureDraft(stored);
        } else if (restored.status === 'failed') {
          setAnalysisError(restored.error?.message ?? 'The previous analysis failed.');
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        if (!cancelled) {
          window.localStorage.removeItem(STORAGE_KEY);
          currentRunIdRef.current = null;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ensureDraft]);

  const runId = run?.run_id;
  const runStatus = run?.status;

  useEffect(() => {
    if (!runId || (runStatus !== 'queued' && runStatus !== 'running')) return;

    let cancelled = false;
    let failures = 0;

    const tick = async () => {
      try {
        const updated = await getAnalysis(runId);
        if (cancelled || currentRunIdRef.current !== runId) return;
        failures = 0;
        setRun(updated);

        if (updated.status === 'completed' && updated.result) {
          setAnalysis(updated.result);
          setIsStarting(false);
          setAnalysisError(null);
          void ensureDraft(runId);
        } else if (updated.status === 'failed') {
          setIsStarting(false);
          setAnalysisError(updated.error?.message ?? 'The analysis failed.');
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        failures += 1;
        if (failures >= 3 && !cancelled) {
          setIsStarting(false);
          setAnalysisError(errorMessage(error));
        }
      }
    };

    void tick();
    const timer = window.setInterval(() => {
      if (failures >= 3) {
        window.clearInterval(timer);
        return;
      }
      void tick();
    }, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [runId, runStatus, ensureDraft]);

  const handleAnalyze = async (repoUrl: string, branch?: string) => {
    setIsStarting(true);
    setAnalysisError(null);
    setContentError(null);
    setAnalysis(null);
    setDraft(null);
    setRun(null);
    currentRunIdRef.current = null;
    draftRequestRef.current = null;

    try {
      const started = await startAnalysis(repoUrl, branch);
      currentRunIdRef.current = started.run_id;
      window.localStorage.setItem(STORAGE_KEY, started.run_id);

      const initial = await getAnalysis(started.run_id);
      if (currentRunIdRef.current !== started.run_id) return;
      setRun(initial);

      if (initial.status === 'completed' && initial.result) {
        setAnalysis(initial.result);
        setIsStarting(false);
        await ensureDraft(started.run_id);
      } else if (initial.status === 'failed') {
        setIsStarting(false);
        setAnalysisError(initial.error?.message ?? 'The analysis failed.');
      }
    } catch (error) {
      setIsStarting(false);
      setAnalysisError(errorMessage(error));
      window.localStorage.removeItem(STORAGE_KEY);
      currentRunIdRef.current = null;
    }
  };

  const handleGenerate = async (style: DraftStyle, length: PostLength) => {
    if (!analysis) return;
    setIsGenerating(true);
    setContentError(null);
    try {
      const generated = await generateContent({
        run_id: analysis.run_id,
        style,
        length,
      });
      setDraft(generated);
    } catch (error) {
      setContentError(errorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerify = async (text: string): Promise<Verification> => {
    if (!analysis) {
      throw new Error('Analyze a repository before verifying content.');
    }
    return verifyText(analysis.run_id, text);
  };

  const openAdmin = () => setActiveTab('admin');

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar
        config={config}
        configError={configError}
        activeRepoName={analysis ? `${analysis.repo.owner}/${analysis.repo.name}` : undefined}
        isAnalyzing={isStarting || runStatus === 'queued' || runStatus === 'running'}
        onOpenAdmin={openAdmin}
        onRefreshConfig={() => void loadConfig()}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasAnalysis={!!analysis}
          hasDraft={!!draft}
          config={config}
          configError={configError}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'analyzer' && (
            <RepoAnalyzer
              analysis={analysis}
              run={run}
              isStarting={isStarting}
              error={analysisError}
              onAnalyze={handleAnalyze}
              onNavigateToContent={() => setActiveTab('content')}
            />
          )}

          {activeTab === 'content' && (
            <ContentStudio
              analysis={analysis}
              draft={draft}
              isGenerating={isGenerating}
              error={contentError}
              onGenerate={handleGenerate}
              onVerify={handleVerify}
              onNavigateToVisual={() => setActiveTab('visual')}
            />
          )}

          {activeTab === 'visual' && <VisualStudio analysis={analysis} />}

          {activeTab === 'security' && <SecurityView analysis={analysis} />}

          {activeTab === 'integrations' && <IntegrationsView config={config} />}

          {activeTab === 'admin' && (
            <AdminView config={config} configError={configError} onRefresh={() => void loadConfig()} />
          )}

          {PLANNED_TABS.includes(activeTab) && (
            <DisabledModuleView moduleId={activeTab} onNavigateToAnalyzer={() => setActiveTab('analyzer')} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
