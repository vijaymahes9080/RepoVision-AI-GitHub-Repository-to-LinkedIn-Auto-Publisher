#!/usr/bin/env python3
"""
RepoVision LinkedIn Bot CLI
Provides automated terminal-driven operations:
- Check connection status
- Connect with Developer Access Token
- Analyze repository, generate verified draft, and publish to LinkedIn
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.config import settings
from app.db import SessionLocal
from app.schemas import ContentGenerateRequest, LinkedInDirectTokenRequest, LinkedInPublishRequest
from app.services import linkedin as linkedin_service
from app.services.analysis import orchestrator as analysis_orchestrator
from app.services.content import drafts as draft_service
from app.services.content.verifier import verify_text
from app.models import ContentDraft


def check_status() -> None:
    db = SessionLocal()
    try:
        status = linkedin_service.get_status(db)
        print("\n=== LinkedIn Connection Status ===")
        print(f"Configured:          {status['configured']}")
        print(f"Publishing Enabled:  {status['publishing_enabled']}")
        print(f"Connected:           {status['connected']}")
        if status.get("member_name"):
            print(f"Member Name:         {status['member_name']}")
        print(f"Can Publish:         {status['can_publish']}")
        print(f"Reason:              {status['reason']}\n")
    finally:
        db.close()


def connect_token(access_token: str, member_name: str | None = None) -> None:
    db = SessionLocal()
    try:
        account = linkedin_service.connect_direct_token(
            db, access_token=access_token, member_name=member_name
        )
        print(f"\n[SUCCESS] Connected LinkedIn account: {account.member_name} (ID: {account.member_sub})\n")
    except Exception as exc:
        print(f"\n[ERROR] Failed to connect token: {exc}\n")
        sys.exit(1)
    finally:
        db.close()


def auto_publish(repo_url: str, style: str = "professional", publish: bool = False) -> None:
    db = SessionLocal()
    try:
        print(f"\n[1/4] Analyzing repository snapshot for: {repo_url}...")
        run = analysis_orchestrator.start_analysis(db, repo_url=repo_url)
        print(f"      Snapshot analysis completed. Run ID: {run.id}")

        print(f"\n[2/4] Generating grounded draft (style: {style})...")
        draft = draft_service.generate_draft(
            db,
            payload=ContentGenerateRequest(run_id=run.id, style=style, length="medium"),
        )
        print(f"      Draft Title: {draft.title}")
        print("\n--- Draft Preview ---")
        print(draft.body)
        print(f"Hashtags: {' '.join(draft.hashtags)}")
        print("---------------------\n")

        print("[3/4] Verifying claims against repository evidence...")
        verification = verify_text(f"{draft.body}\n\n{' '.join(draft.hashtags)}", run.result_json)
        print(f"      Verification Status: {'PASSED (Evidence Supported)' if verification.ok else 'WARNINGS PRESENT'}")

        if not publish:
            print("\n[INFO] Dry-run completed. To publish to LinkedIn, add the --publish flag.\n")
            return

        print("\n[4/4] Publishing to connected LinkedIn member...")
        status = linkedin_service.get_status(db)
        if not status["can_publish"]:
            print(f"[ERROR] Cannot publish: {status['reason']}")
            print("Please connect your LinkedIn account first via `python linkedin_bot.py --connect-token <token>` or through the web UI.")
            sys.exit(1)

        result = linkedin_service.publish(
            db,
            LinkedInPublishRequest(
                draft_id=draft.id,
                confirm=True,
                commentary=f"{draft.body}\n\n{' '.join(draft.hashtags)}",
            ),
        )
        print(f"\n[SUCCESS] Published to LinkedIn!")
        print(f"Post URN:     {result.get('post_urn')}")
        print(f"Attempt ID:   {result.get('attempt_id')}")
        print(f"Published At: {result.get('published_at')}\n")
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="RepoVision LinkedIn Bot")
    parser.add_argument("--status", action="store_true", help="Check LinkedIn connection status")
    parser.add_argument("--connect-token", type=str, help="Connect directly using a LinkedIn access token")
    parser.add_argument("--name", type=str, help="Optional member name for direct token connection")
    parser.add_argument("--repo", type=str, help="Public GitHub repository URL to analyze")
    parser.add_argument("--style", type=str, default="professional", help="Draft style (professional, technical, concise, etc.)")
    parser.add_argument("--publish", action="store_true", help="Publish draft to LinkedIn (default is dry-run)")

    args = parser.parse_args()

    if args.status:
        check_status()
    elif args.connect_token:
        connect_token(args.connect_token, args.name)
    elif args.repo:
        auto_publish(args.repo, style=args.style, publish=args.publish)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
