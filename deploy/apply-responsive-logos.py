#!/usr/bin/env python3
# Technical authorship: Lucas J. Cooke, Partner Relations Coordinator. Contact: l.jcooke@icloud.com. LinkedIn: https://www.linkedin.com/in/lucas-cooke/
"""Wrap logo <img> tags in responsive <picture> elements (WebP/AVIF) with PNG fallback.

Layout stays on the <img> (badge padding, margins). The wrapper uses display:contents
so placement matches production plain-img markup.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = list(ROOT.glob("*.html")) + list((ROOT / "k7x2nq8m").glob("*.html"))
OPT = "assets/optimized"
KOPT = "/assets/optimized"

PNG = {
    "RSM_LOGO": ("assets/RSM_LOGO-320.png", "/assets/RSM_LOGO-320.png"),
    "Kolims_LOGO": ("assets/Kolims_LOGO-216.png", "/assets/Kolims_LOGO-216.png"),
    "Total_GI_logo": ("assets/Total_GI_logo-900.png", "/assets/Total_GI_logo-900.png"),
    "EGHA_logo": ("assets/EGHA_logo-900.png", "/assets/EGHA_logo-900.png"),
    "Upper_Respiratory_logo": (
        "assets/Upper_Respiratory_Microscreen_Logo-400.png",
        "/assets/Upper_Respiratory_Microscreen_Logo-400.png",
    ),
}

LOGO_MARKERS = (
    "RSM_LOGO-320",
    "Kolims_LOGO-216",
    "Total_GI_logo-900",
    "EGHA_logo-900",
    "Upper_Respiratory_Microscreen_Logo-400",
    "flagship-logo",
    "test-brand-logo",
    "hero-badge-logo",
    "nav-portal-logo",
    "inclusion-card-logo",
    "marker-profile-badge",
)

IMG_RE = re.compile(r"<img\b[^>]*>", re.IGNORECASE)
PICTURE_BLOCK_RE = re.compile(
    r'<picture class="responsive-logo">.*?</picture>', re.IGNORECASE | re.DOTALL
)


def is_logo_img(tag: str) -> bool:
    return any(marker in tag for marker in LOGO_MARKERS)


def path_style(tag: str) -> str:
    return "absolute" if 'src="/assets/' in tag else "relative"


def prefix(style: str) -> str:
    return KOPT if style == "absolute" else OPT


def png_src(base: str, style: str) -> str:
    rel, abs_ = PNG[base]
    return abs_ if style == "absolute" else rel


def spec_for(tag: str) -> tuple[str, list[int], str] | None:
    if "Kolims_LOGO-216" in tag or "nav-portal-logo" in tag:
        return "Kolims_LOGO", [72, 144], "72px"
    if "RSM_LOGO-320" in tag:
        if 'width="96"' in tag or "hero-badge-logo" in tag:
            return "RSM_LOGO", [96, 160, 192], "(min-width: 48rem) 5rem, 3.5rem"
        if 'width="80"' in tag:
            return "RSM_LOGO", [96, 160], "80px"
        if 'width="48"' in tag:
            return "RSM_LOGO", [96, 160], "48px"
        return "RSM_LOGO", [96, 192], "54px"
    if "Total_GI_logo-900" in tag:
        if "inclusion-card-logo" in tag:
            return "Total_GI_logo", [112, 224], "96px"
        if "marker-profile-badge" in tag and 'width="88"' in tag:
            return "Total_GI_logo", [112, 224], "88px"
        if "test-brand-logo-report" in tag:
            return "Total_GI_logo", [112, 224, 320], "16.5rem"
        if "test-brand-logo-card" in tag:
            return "Total_GI_logo", [112, 224, 320], "13.5rem"
        if "test-brand-logo-section" in tag:
            return "Total_GI_logo", [224, 320, 448], "(min-width: 48rem) 28rem, 72vw"
        if "test-brand-logo-hero" in tag:
            return "Total_GI_logo", [112, 224, 320], "(min-width: 48rem) 15.5rem, 42vw"
        if 'width="56"' in tag:
            return "Total_GI_logo", [112, 224], "56px"
        if "flagship-logo" in tag:
            return "Total_GI_logo", [112, 224], "(min-width: 48rem) 7rem, 5.5rem"
        return "Total_GI_logo", [112, 224, 320], "(min-width: 48rem) 15.5rem, 42vw"
    if "EGHA_logo-900" in tag:
        if "inclusion-card-logo" in tag:
            return "EGHA_logo", [112, 224], "88px"
        if "marker-profile-badge" in tag:
            return "EGHA_logo", [112, 224], "72px"
        if "test-brand-logo-report" in tag:
            return "EGHA_logo", [112, 224, 320], "16.5rem"
        if "test-brand-logo-card" in tag:
            return "EGHA_logo", [112, 224, 320], "13.5rem"
        if "test-brand-logo-section" in tag:
            return "EGHA_logo", [224, 320, 448], "(min-width: 48rem) 28rem, 72vw"
        if "test-brand-logo-hero" in tag:
            return "EGHA_logo", [112, 224, 320], "(min-width: 48rem) 15.5rem, 42vw"
        if 'width="46"' in tag:
            return "EGHA_logo", [112, 224], "46px"
        if "flagship-logo" in tag:
            return "EGHA_logo", [112, 224], "(min-width: 48rem) 7rem, 5.5rem"
        return "EGHA_logo", [112, 224, 320], "(min-width: 48rem) 15.5rem, 42vw"
    if "Upper_Respiratory_Microscreen_Logo-400" in tag:
        if "test-brand-logo-report" in tag:
            return "Upper_Respiratory_logo", [88, 176], "9rem"
        if "test-brand-logo-section" in tag:
            return "Upper_Respiratory_logo", [88, 176, 320], "(min-width: 48rem) 11rem, 38vw"
        if "test-brand-logo-hero" in tag or "test-brand-logo-card" in tag:
            return "Upper_Respiratory_logo", [88, 176], "(min-width: 48rem) 8.5rem, 30vw"
        return "Upper_Respiratory_logo", [88, 176], "(min-width: 48rem) 2.75rem, 2.15rem"
    return None


def wrap_img(tag: str) -> str:
    spec = spec_for(tag)
    if not spec:
        return tag
    base, widths, sizes = spec
    style = path_style(tag)
    p = prefix(style)
    srcset_avif = ", ".join(f"{p}/{base}-{w}w.avif {w}w" for w in widths)
    srcset_webp = ", ".join(f"{p}/{base}-{w}w.webp {w}w" for w in widths)
    png = png_src(base, style)
    tag = re.sub(r'\ssrc="[^"]*"', f' src="{png}"', tag, count=1)
    tag = re.sub(r'\ssizes="[^"]*"', "", tag)
    return (
        f'<picture class="responsive-logo">\n'
        f'  <source type="image/avif" srcset="{srcset_avif}" sizes="{sizes}" />\n'
        f'  <source type="image/webp" srcset="{srcset_webp}" sizes="{sizes}" />\n'
        f"  {tag}\n"
        f"</picture>"
    )


def patch_html(text: str) -> tuple[str, int]:
    count = 0

    def patch_segment(segment: str) -> str:
        nonlocal count

        def repl(m: re.Match[str]) -> str:
            nonlocal count
            tag = m.group(0)
            if not is_logo_img(tag):
                return tag
            count += 1
            return wrap_img(tag)

        return IMG_RE.sub(repl, segment)

    parts = PICTURE_BLOCK_RE.split(text)
    for i, part in enumerate(parts):
        if part.startswith('<picture class="responsive-logo">'):
            continue
        parts[i] = patch_segment(part)
    return "".join(parts), count


def main() -> None:
    total = 0
    for path in HTML_FILES:
        original = path.read_text(encoding="utf-8")
        updated = original.replace(
            'href="assets/RSM_LOGO-320.png"',
            'href="assets/optimized/RSM_LOGO-96w.webp" type="image/webp"',
        )
        updated = updated.replace(
            'href="/assets/RSM_LOGO-320.png"',
            'href="/assets/optimized/RSM_LOGO-96w.webp" type="image/webp"',
        )
        patched, n = patch_html(updated)
        if patched != original:
            path.write_text(patched, encoding="utf-8")
            print(f"{path.relative_to(ROOT)}: wrapped {n} logos")
            total += n
    print(f"Total wrapped: {total}")


if __name__ == "__main__":
    main()
