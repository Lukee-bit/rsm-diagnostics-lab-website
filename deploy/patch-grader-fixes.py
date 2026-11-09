#!/usr/bin/env python3
# Technical authorship: Lucas J. Cooke, Partner Relations Coordinator. Contact: l.jcooke@icloud.com. LinkedIn: https://www.linkedin.com/in/lucas-cooke/
"""Patch RSM HTML: remove unused logo preload; add static cookie notice; footer cookie link."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

HTML_FILES = [
    ROOT / "index.html",
    ROOT / "request-kit.html",
    ROOT / "document-center.html",
    ROOT / "nasal-throat-tests.html",
    ROOT / "why-rsm.html",
    ROOT / "clia-credentials.html",
    ROOT / "billing-policies.html",
    ROOT / "gastrointestinal-tests.html",
    ROOT / "terms-of-service.html",
    ROOT / "404.html",
    ROOT / "privacy-policy.html",
    ROOT / "k7x2nq8m" / "index.html",
]

IMAGE_PRELOAD_SINGLE = re.compile(
    r"\s*<link\s+rel=\"preload\"\s+as=\"image\"[^>]*RSM_LOGO-96w\.webp[^>]*/>\s*",
    re.IGNORECASE,
)

IMAGE_PRELOAD_MULTILINE = re.compile(
    r"\s*<link\s*\n\s*rel=\"preload\"\s*\n\s*as=\"image\"[^>]*RSM_LOGO-96w\.webp[^>]*/>\s*",
    re.IGNORECASE | re.DOTALL,
)

STATIC_NOTICE = """
    <aside
      id="site-legal-notice"
      class="site-legal-panel site-legal-panel--float"
      role="region"
      aria-label="Privacy, terms, and site preferences"
    >
      <div class="site-legal-panel-inner">
        <p class="site-legal-panel-meta" id="site-legal-panel-meta">
          <strong>Cookie notice:</strong> theme preference storage only; no ad or
          analytics cookies.
          <a href="/privacy-policy#cookies">Cookie and privacy details</a>.
        </p>
        <label class="site-legal-panel-check" for="site-legal-gate-checkbox">
          <input
            type="checkbox"
            id="site-legal-gate-checkbox"
            name="site-legal-agree"
            aria-describedby="site-legal-panel-meta"
            required
          />
          <span class="site-legal-panel-check-text">
            I agree to the
            <a href="/terms-of-service">Terms of Service</a>
            and
            <a href="/privacy-policy">Privacy Policy</a>.
            Checking this box and selecting &ldquo;I agree&rdquo; is my electronic
            signature and a binding agreement under U.S. law.
          </span>
        </label>
        <div class="site-legal-panel-actions">
          <button
            type="button"
            class="button button-primary site-legal-panel-accept"
            disabled
          >
            I agree
          </button>
        </div>
      </div>
    </aside>
"""

FOOTER_COOKIE_LINK = (
    '                <li><a href="/privacy-policy#cookies">Cookie notice</a></li>\n'
)

PRIVACY_LINE = re.compile(
    r'(\s*<li><a href="/privacy-policy">Privacy Policy</a></li>\s*\n)',
    re.IGNORECASE,
)


def patch_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    original = text
    changes = 0

    for pattern in (IMAGE_PRELOAD_MULTILINE, IMAGE_PRELOAD_SINGLE):
        new_text, count = pattern.subn("\n", text)
        if count:
            text = new_text
            changes += count

    if 'id="site-legal-notice"' not in text:
        marker = '<script src="script.js"></script>'
        k7_marker = '<script src="/script.js"></script>'
        if marker in text:
            text = text.replace(marker, f"{STATIC_NOTICE}\n\n    {marker}", 1)
            changes += 1
        elif k7_marker in text:
            text = text.replace(k7_marker, f"{STATIC_NOTICE}\n\n    {k7_marker}", 1)
            changes += 1

    if "Cookie notice</a></li>" not in text and PRIVACY_LINE.search(text):
        text = PRIVACY_LINE.sub(r"\1" + FOOTER_COOKIE_LINK, text, count=1)
        changes += 1

    if text != original:
        path.write_text(text, encoding="utf-8")

    return changes


def main() -> None:
    total = 0
    for path in HTML_FILES:
        if not path.exists():
            continue
        n = patch_file(path)
        if n:
            print(f"{path.relative_to(ROOT)}: {n} change(s)")
            total += n
    print(f"Done. {total} change(s) across files.")


if __name__ == "__main__":
    main()
