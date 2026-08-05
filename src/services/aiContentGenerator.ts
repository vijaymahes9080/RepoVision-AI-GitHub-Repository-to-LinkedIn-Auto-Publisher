import { GeneratedContent, ProjectAnalysis } from '../types';

export function generateLinkedInContent(analysis: ProjectAnalysis): GeneratedContent {
  const repo = analysis.repoName;
  const primaryTech = analysis.technologies.slice(0, 3).map((t) => t.name).join(', ');

  const title = `🚀 Built ${repo} – An AI-Powered Cloud Platform using ${primaryTech}`;

  const hooks = [
    `🔥 Most developer tools fail at one crucial step: turning open-source code into viral public visibility. Here's how we solved it with ${repo}.`,
    `💡 What if your GitHub repository could automatically write, design, and publish its own viral LinkedIn campaign? Meet ${repo}.`,
    `⚡ From 0 to 100 stars: How we built ${repo} with an automated AI pipeline using ${primaryTech}.`
  ];

  const bodyShort = `🚀 Excited to announce **${repo}**!

${analysis.problemStatement}

💡 **The Solution:**
${analysis.solution}

🛠️ **Tech Stack:**
${analysis.technologies.slice(0, 5).map((t) => `• ${t.name} (${t.category})`).join('\n')}

⭐ Check out the GitHub repository and drop a star!
👉 Link in comments below.`;

  const bodyMedium = `🚀 **Introducing ${repo} – GitHub Repository to LinkedIn Auto Publisher!**

Every day, thousands of incredible open-source projects get buried in GitHub search because engineers don't have time to craft engaging LinkedIn content, create carousels, or design professional banners.

We built **${repo}** to solve this permanently.

---

📌 **The Core Challenge:**
${analysis.problemStatement}

⚡ **How ${repo} Works:**
1️⃣ **Repo Analysis:** Clones repository, parses README, and auto-detects 30+ tech frameworks.
2️⃣ **AI Content Engine:** Generates high-impact hooks, structured posts, hashtags, and CTA.
3️⃣ **Visual Studio:** Automatically creates 10-slide PDF carousels & glassmorphism banners.
4️⃣ **Auto Publisher:** Schedules and posts directly via official LinkedIn OAuth API.

---

🛠️ **Technology Breakdown:**
${analysis.technologies.map((t) => `• **${t.name}** – ${t.category}`).join('\n')}

🎯 **Target Audience:** Software Engineers, Tech Leads, AI Researchers, and Open-Source Authors.

What features would you like to see next? Drop a comment below! 👇`;

  const bodyLong = `🔥 **Deep Dive: Building ${repo} – The AI Cloud Engine That Converts GitHub Repos into LinkedIn Campaigns**

As software engineers, we invest hundreds of hours crafting clean code, designing scalable architectures, and writing comprehensive unit tests. Yet when it comes to launching our projects on LinkedIn, we are left with static text posts that get drowned in the feed.

That's why we engineered **${repo}**.

======================================

🔍 **1. THE PROBLEM STATEMENT**
${analysis.problemStatement}

💡 **2. THE ARCHITECTURAL SOLUTION**
${analysis.solution}

🏗️ **3. SYSTEM ARCHITECTURE & PIPELINE**
${analysis.architectureOverview}

======================================

🌟 **4. KEY FEATURES**
${analysis.keyFeatures.map((f, i) => `${i + 1}. **${f}**`).join('\n')}

======================================

⚡ **5. TECH STACK HIGHLIGHTS**
${analysis.technologies.map((t) => `• **${t.name}** [${t.category}] – ${t.confidence}% match confidence`).join('\n')}

======================================

💡 **6. KEY LESSONS & ENGINEERING CHALLENGES**
• Handling complex multi-repo AST parsing asynchronously without blocking the UI looper.
• Rendering high-DPI HTML5 canvas slide decks server-side and client-side for crisp PDF generation.
• Maintaining strict compliance with official LinkedIn OAuth permission scopes and fallback queues.

======================================

👉 **Explore the codebase & star the repo:**
${analysis.repoUrl}

#OpenSource #AI #SoftwareEngineering #CloudSaaS #DeveloperTools #LinkedInAutoPublish`;

  const hashtags = [
    '#AI',
    '#OpenSource',
    '#SoftwareEngineering',
    '#GitHub',
    '#LinkedInPublisher',
    '#React',
    '#NextJS',
    '#Python',
    '#CloudSaaS',
    '#DevTools',
  ];

  const cta = '⭐ Star the repository on GitHub and let us know your thoughts in the comments below!';

  const aiImagePrompts = [
    `Create a modern ultra-sleek LinkedIn banner for ${repo} featuring glowing cyber neon accents in deep indigo, cyan, and violet gradients, floating 3D tech badges for React, TypeScript, and FastAPI, clean glassmorphism cards, and GitHub star metrics in professional dark corporate style.`,
    `A high-tech digital dashboard mockup for ${repo} displaying automated repository analytics, AI content generation workflows, dark obsidian glass UI elements, and glowing neon nodes connecting GitHub to LinkedIn.`
  ];

  return {
    title,
    hooks,
    selectedHookIndex: 0,
    bodyShort,
    bodyMedium,
    bodyLong,
    hashtags,
    cta,
    aiImagePrompts,
    selectedLength: 'medium',
  };
}
