# RepoVision AI – GitHub Repository to LinkedIn Auto Publisher 🚀

[![SaaS Version](https://img.shields.io/badge/SaaS-v2.5-6366f1?style=for-the-badge&logo=rocket)](https://github.com/vijaymahes9080/RepoVision-AI-GitHub-Repository-to-LinkedIn-Auto-Publisher)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/vijaymahes9080/RepoVision-AI-GitHub-Repository-to-LinkedIn-Auto-Publisher?style=for-the-badge&color=amber)](https://github.com/vijaymahes9080/RepoVision-AI-GitHub-Repository-to-LinkedIn-Auto-Publisher)
[![LinkedIn OAuth](https://img.shields.io/badge/LinkedIn-OAuth_2.0-0a66c2?style=for-the-badge&logo=linkedin)](https://linkedin.com)
[![GPT-5.5 Engine](https://img.shields.io/badge/AI_Engine-GPT--5.5-cyan?style=for-the-badge&logo=openai)](https://openai.com)

**RepoVision AI** is a fully cloud-hosted SaaS platform that automatically analyzes public or authorized GitHub repositories using AI, understands project architecture and tech stacks, generates professional LinkedIn content (Posts, Glassmorphism Banners, 10-Slide PDF Carousels, and 30-Second Shorts), and publishes them directly to LinkedIn via official OAuth APIs.

---

## 💡 The Problem & The Solution

- 📌 **The Challenge:** Developers and open-source authors invest hundreds of hours building incredible projects, yet struggle to promote them consistently on LinkedIn due to the manual effort required to write posts, design graphics, and format carousels.
- ⚡ **The Solution:** RepoVision AI automates the entire GitHub-to-LinkedIn pipeline in the cloud. Just paste your repository URL and get a fully engineered LinkedIn campaign ready for instant scheduling or automated publishing.

---

## 🛠️ Complete System Workflow

```
               [ User Input Repository URL ]
                             │
                             ▼
                   [ GitHub OAuth / REST ]
                             │
                             ▼
             [ Cloud Repository Clone & AST Parser ]
                             │
                             ▼
             ┌───────────────┴───────────────┐
             │   AI Code Understanding       │
             │   • Read README.md & Files    │
             │   • Detect 30+ Frameworks     │
             │   • Extract System Architecture│
             └───────────────┬───────────────┘
                             │
                             ▼
               [ AI Multi-Format Generation ]
             ┌───────────────┼───────────────┐
             │               │               │
      [ Post Body & ]   [ Banner & PDF  ]  [ 30s Short ]
      [ AI Hashtags ]   [  Carousels    ]  [   Video   ]
             └───────────────┬───────────────┘
                             │
                             ▼
            [ Live LinkedIn Desktop/Mobile Preview ]
                             │
                             ▼
            [ Official LinkedIn OAuth Publishing ]
                             │
                             ▼
            [ Analytics & Performance Insights ]
```

---

## 🔥 Features & Capabilities

### 1. 🚀 Automated GitHub Repository Analyzer
- **AST Tech Stack Extractor:** Automatically identifies 30+ frameworks across Frontend (React, Next.js, Angular, Vue), Backend (FastAPI, Node.js, Django, Spring Boot), Databases (PostgreSQL, MongoDB, Redis), AI/ML (LangChain, OpenAI, PyTorch), and Cloud/DevOps (Docker, AWS, Kubernetes).
- **Project Problem & Solution Synthesis:** Uses GPT-5.5 to extract core architecture, algorithms, and key innovations.

### 2. ✍️ LinkedIn AI Content Studio
- **Post Body Length Toggles:** Short Hook, Medium Post, Deep Dive.
- **High-Conversion AI Hooks:** Generates 3 hook options engineered for high feed retention.
- **Hashtag Suite & Prompts:** Contextual hashtag generator + custom DALL-E/Midjourney prompts.
- **Authentic Live Preview:** Real-time desktop & mobile LinkedIn post preview card with full character counts and social reaction buttons.

### 3. 🎨 Visual Studio (Banners & 10-Slide PDF Carousels)
- **Header Banner Studio:** 5 modern aesthetic themes (*Glassmorphism Cyber*, *LinkedIn Pro*, *Modern Startup*, *Dark Cyber Obsidian*, *Minimal Corporate*). Customizable typography, star/fork counters, and tech badges.
- **10-Slide PDF Carousel Studio:** Interactive slide deck generator (Slide 1: Title → Slide 2: Problem → Slide 3: Solution → Slide 4: Architecture → Slide 5: Tech Stack → Slide 6: Key Features → Slide 7: Results → Slide 8: QR Code → Slide 9: Future Scope → Slide 10: Thank You) with instant high-resolution PDF download.

### 4. 🎬 30-Second AI Video Short Studio
- Storyboard animation preview player with synchronized captions, AI audio voiceover transcript, code reveals, visual cues, and audio waveform visualizers.

### 5. 📅 Official OAuth Scheduler & 1-Click Fallback Queue
- Schedule campaigns daily, weekly, or on custom dates.
- **Compliance Guarantee:** Where LinkedIn API scope restrictions apply, posts are queued for a **1-Click Review & Publish** workflow so your account stays 100% compliant.

### 6. 📊 Analytics & Performance Dashboard
- Track total impressions, views, engagements, and followers gained.
- AI Recommendations for optimal posting times and hook improvements.

---

## 💻 Tech Stack

- **Frontend:** React 19, Next.js / Vite, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend / AI Engine:** FastAPI, Node.js, OpenAI GPT-5.5, LangChain
- **OAuth & Auth:** GitHub OAuth 2.0, LinkedIn OAuth 2.0, Google SSO, Email Magic Links
- **Database & Storage:** PostgreSQL, Redis Queue, AWS S3 / Cloudflare R2

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- Node.js (v18+ or v20+)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vijaymahes9080/RepoVision-AI-GitHub-Repository-to-LinkedIn-Auto-Publisher.git
   cd RepoVision-AI-GitHub-Repository-to-LinkedIn-Auto-Publisher
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🛡️ Platform Compliance & Security

RepoVision AI strictly respects third-party platform terms:
- Uses official GitHub OAuth and REST API endpoints.
- Uses official LinkedIn OAuth 2.0 scopes.
- Never automates unauthorized scraping; defaults to 1-Click Review fallback queues when direct posting scope is unavailable.

---

## 👤 Author & License

- **Author:** Vijay Mahes
- **Email:** [Vijaypradhap2004@gmail.com](mailto:Vijaypradhap2004@gmail.com)
- **GitHub:** [@vijaymahes9080](https://github.com/vijaymahes9080)
- **License:** Distributed under the [MIT License](LICENSE).
