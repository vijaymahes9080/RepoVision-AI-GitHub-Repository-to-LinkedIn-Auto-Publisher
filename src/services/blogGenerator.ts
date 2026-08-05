import { ProjectAnalysis } from '../types';

export function generateMarkdownArticle(analysis: ProjectAnalysis): string {
  const repo = analysis.repoName;
  const primaryTech = analysis.technologies.slice(0, 4).map((t) => t.name).join(', ');

  return `# Deep Dive: Building ${repo} with ${primaryTech}

Published on Dev.to, Medium, & Hashnode 🚀

## Executive Summary
Every open-source maintainer faces the same challenge: spending hours writing release notes and designing marketing media. We built **${repo}** to automate repository content synthesis using LLMs.

---

## 📌 1. The Core Challenge
${analysis.problemStatement}

---

## 💡 2. Architectural Solution
${analysis.solution}

\`\`\`typescript
// End-to-end repository parsing pipeline
const analysis = await RepoVision.analyze({
  repoUrl: "${analysis.repoUrl}",
  depth: "ast_tree_and_readme"
});

console.log(\`Detected \${analysis.technologies.length} frameworks!\`);
\`\`\`

---

## 🛠️ 3. Technology Breakdown
${analysis.technologies.map((t) => `- **${t.name}** (${t.category}) – ${t.confidence}% AST confidence`).join('\n')}

---

## 🌟 4. Key Innovations
${analysis.keyFeatures.map((f, i) => `${i + 1}. ${f}`).join('\n')}

---

## 🔗 Repository & Contributing
Check out the full codebase on GitHub:
👉 [${analysis.repoUrl}](${analysis.repoUrl})

Star the repo and drop a comment with your thoughts!
`;
}
