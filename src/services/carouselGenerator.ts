import type { AnalysisResult, CarouselSlide } from '../types';

const ACCENTS = [
  '#6366f1',
  '#06b6d4',
  '#ef4444',
  '#10b981',
  '#a855f7',
  '#f59e0b',
  '#3b82f6',
  '#ec4899',
  '#8b5cf6',
  '#94a3b8',
];

function shorten(text: string, limit: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit - 1).replace(/[\s,.;:]+$/, '')}…`;
}

function listOrFallback(items: string[], fallback: string, limit = 6): string[] {
  if (items.length === 0) return [fallback];
  return items.slice(0, limit);
}

export function generateDefaultCarousel(analysis: AnalysisResult): CarouselSlide[] {
  const { repo, summary, testing, security } = analysis;
  const repoLabel = `${repo.owner}/${repo.name}`;

  const architectureBullets = listOrFallback(
    analysis.architecture.components.map((component) => `${component.name}: ${component.role}`),
    'No application-layer architecture could be inferred from the analyzed manifests.',
    4,
  );

  const technologyBullets = listOrFallback(
    analysis.technologies.map(
      (technology) => `${technology.name} — ${technology.category} (${technology.confidence}% confidence)`,
    ),
    'No technologies were detected from analyzed manifests or configuration.',
    8,
  );

  const featureBullets = listOrFallback(
    analysis.features.map((feature) => feature.title),
    'The analyzed README did not include a recognisable feature list.',
    5,
  );

  const testingBullets: string[] = [];
  if (testing.test_file_count > 0) {
    testingBullets.push(`${testing.test_file_count} test file(s) detected in the bounded snapshot.`);
  } else {
    testingBullets.push('No test files were detected in the bounded snapshot.');
  }
  if (testing.frameworks.length > 0) {
    testingBullets.push(`Test tooling: ${testing.frameworks.join(', ')}.`);
  }
  if (testing.ci_systems.length > 0) {
    testingBullets.push(`CI configuration: ${testing.ci_systems.join(', ')}.`);
  }
  testingBullets.push('Tests were not executed; presence does not prove passing tests.');

  const securityBullets: string[] = [
    `License: ${security.license ?? 'not detected'}.`,
    `Dependency vulnerability scan: ${security.dependency_scan.status.replace('_', ' ')}.`,
    security.findings.length > 0
      ? `${security.findings.length} static pattern review item(s) require maintainer review.`
      : 'No static pattern review items were detected in analyzed files.',
    'This is not a vulnerability assessment or security grade.',
  ];

  const limitationBullets = listOrFallback(
    analysis.limitations,
    'The snapshot was analyzed statically and is subject to the documented limits.',
    4,
  );

  return [
    {
      id: 1,
      slideType: 'title',
      title: repoLabel,
      subtitle: 'Evidence-based repository snapshot',
      bodyText:
        shorten(summary.description || repo.description || '', 260) ||
        'A static snapshot of a public GitHub repository.',
      bullets: [
        `Primary language: ${repo.language ?? 'not reported by GitHub'}`,
        `License: ${summary.license ?? 'not detected'}`,
        `Snapshot files: ${analysis.metrics.file_count.toLocaleString()} total, ${analysis.metrics.analyzed_file_count} analyzed`,
      ],
      accentColor: ACCENTS[0],
    },
    {
      id: 2,
      slideType: 'description',
      title: 'What the repository documents',
      subtitle: 'README and repository metadata',
      bodyText:
        shorten(summary.description || repo.description || '', 420) ||
        'No repository description was available in the analyzed snapshot.',
      bullets: repo.description ? ['Source: repository description and README content.'] : [],
      accentColor: ACCENTS[1],
    },
    {
      id: 3,
      slideType: 'problem',
      title: 'Documented problem',
      subtitle: 'Only shown when the README states it',
      bodyText:
        shorten(summary.problem_statement, 420) ||
        'The analyzed README did not include an explicit problem statement. This slide intentionally does not invent one.',
      bullets: summary.problem_statement ? ['Source: README problem section.'] : [],
      accentColor: ACCENTS[2],
    },
    {
      id: 4,
      slideType: 'solution',
      title: 'Documented solution',
      subtitle: 'Only shown when the README states it',
      bodyText:
        shorten(summary.solution, 420) ||
        'The analyzed README did not include an explicit solution section. Review the repository for context rather than relying on an inferred claim.',
      bullets: summary.solution ? ['Source: README solution section.'] : [],
      accentColor: ACCENTS[3],
    },
    {
      id: 5,
      slideType: 'architecture',
      title: 'Inferred structure',
      subtitle: 'Manifest-based inference, not runtime observation',
      bodyText: shorten(analysis.architecture.summary, 360),
      bullets: architectureBullets,
      accentColor: ACCENTS[4],
    },
    {
      id: 6,
      slideType: 'tech',
      title: 'Technology signals',
      subtitle: 'Detected from manifests, configuration, and source files',
      bodyText:
        'Confidence reflects the strength of the evidence found in the snapshot, not production readiness.',
      bullets: technologyBullets,
      accentColor: ACCENTS[5],
    },
    {
      id: 7,
      slideType: 'features',
      title: 'Documented capabilities',
      subtitle: 'Extracted from README content',
      bodyText: 'Feature statements are limited to lines that exist in the analyzed README.',
      bullets: featureBullets,
      accentColor: ACCENTS[6],
    },
    {
      id: 8,
      slideType: 'testing',
      title: 'Testing & CI signals',
      subtitle: 'Static detection only',
      bodyText: 'The snapshot can show test and CI configuration; it cannot show whether tests pass.',
      bullets: testingBullets,
      accentColor: ACCENTS[7],
    },
    {
      id: 9,
      slideType: 'security',
      title: 'Security review scope',
      subtitle: 'Pattern matching and license detection',
      bodyText: shorten(security.limitations[0] ?? '', 260),
      bullets: securityBullets,
      accentColor: ACCENTS[8],
    },
    {
      id: 10,
      slideType: 'limitations',
      title: 'Evidence boundary',
      subtitle: 'What this snapshot cannot prove',
      bodyText: `Repository: ${repo.url}`,
      bullets: limitationBullets,
      accentColor: ACCENTS[9],
    },
  ];
}
