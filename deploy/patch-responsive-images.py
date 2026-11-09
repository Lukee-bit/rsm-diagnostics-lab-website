#!/usr/bin/env python3
# Technical authorship: Lucas J. Cooke, Partner Relations Coordinator. Contact: l.jcooke@icloud.com. LinkedIn: https://www.linkedin.com/in/lucas-cooke/
"""Patch HTML img tags to use responsive AVIF/WebP picture elements.

Use deploy/apply-responsive-logos.py for logo images. Logos keep PNG fallbacks on
<img> and picture.responsive-logo { display: contents } so badge layout matches
production.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = list(ROOT.glob("*.html")) + list((ROOT / "k7x2nq8m").glob("*.html"))
OPT = "assets/optimized"
KOPT = "/assets/optimized"

# Logos use production PNG <img> markup; do not re-wrap on regenerate.
PATCH_LOGOS = False


def prefix(path_style: str) -> str:
    return KOPT if path_style == "absolute" else OPT


def picture(
    base: str,
    widths: list[int],
    sizes: str,
    *,
    path_style: str,
    alt: str,
    width: int | None = None,
    height: int | None = None,
    classes: str = "",
    loading: str = "lazy",
    decoding: str = "async",
    fetchpriority: str | None = None,
) -> str:
    p = prefix(path_style)
    srcset_avif = ", ".join(f"{p}/{base}-{w}w.avif {w}w" for w in widths)
    srcset_webp = ", ".join(f"{p}/{base}-{w}w.webp {w}w" for w in widths)
    fallback = f"{p}/{base}-{widths[0]}w.webp"
    attrs = [
        f'alt="{alt}"',
        f'src="{fallback}"',
        f'sizes="{sizes}"',
        f'loading="{loading}"',
        f'decoding="{decoding}"',
    ]
    if width is not None:
        attrs.append(f'width="{width}"')
    if height is not None:
        attrs.append(f'height="{height}"')
    if classes:
        attrs.append(f'class="{classes}"')
    if fetchpriority:
        attrs.append(f'fetchpriority="{fetchpriority}"')
    img = f"<img {' '.join(attrs)} />"
    return (
        f'<picture class="responsive-logo">\n'
        f'  <source type="image/avif" srcset="{srcset_avif}" sizes="{sizes}" />\n'
        f'  <source type="image/webp" srcset="{srcset_webp}" sizes="{sizes}" />\n'
        f"  {img}\n"
        f"</picture>"
    )


def path_style_for(text: str, start: int) -> str:
    window = text[max(0, start - 400) : start + 200]
    return "absolute" if 'src="/assets/' in window or 'href="/assets/' in window else "relative"


def patch_content(text: str) -> str:
  if not PATCH_LOGOS:
    return text

  out = text

  def sub(pattern: str, repl_fn, flags=0):
    nonlocal out
    out = re.sub(pattern, repl_fn, out, flags=flags)

  # Preload links
  out = out.replace(
    'href="assets/RSM_LOGO-320.png"',
    'href="assets/optimized/RSM_LOGO-96w.webp" type="image/webp"',
  )
  out = out.replace(
    'href="/assets/RSM_LOGO-320.png"',
    'href="/assets/optimized/RSM_LOGO-96w.webp" type="image/webp"',
  )

  # Kolims portal logo
  kolims_re = re.compile(
    r'<img\s+class="nav-portal-logo"\s+src="(?P<src>[^"]*Kolims_LOGO-216\.png)"\s+alt="(?P<alt>[^"]*)"\s+width="72"\s+height="18"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def kolims_sub(m: re.Match[str]) -> str:
    ps = "absolute" if m.group("src").startswith("/") else "relative"
    return picture(
      "Kolims_LOGO",
      [72, 144],
      "72px",
      path_style=ps,
      alt=m.group("alt"),
      width=72,
      height=18,
      classes="nav-portal-logo",
      loading=m.group("loading"),
    )

  out = kolims_re.sub(kolims_sub, out)

  # RSM nav / compact logos (54x54)
  rsm54_re = re.compile(
    r'<img\s+src="(?P<src>[^"]*RSM_LOGO-320\.png)"\s+alt="RSM Diagnostics Lab"\s+width="54"\s+height="54"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def rsm54_sub(m: re.Match[str]) -> str:
    ps = "absolute" if m.group("src").startswith("/") else "relative"
    return picture(
      "RSM_LOGO",
      [96, 192],
      "54px",
      path_style=ps,
      alt="RSM Diagnostics Lab",
      width=54,
      height=49,
      loading=m.group("loading"),
    )

  out = rsm54_re.sub(rsm54_sub, out)

  # RSM hero badge 96
  rsm96_re = re.compile(
    r'<img\s+src="(?P<src>[^"]*RSM_LOGO-320\.png)"\s+alt="RSM Diagnostics Lab"\s+class="hero-badge-logo"\s+width="96"\s+height="96"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"(?:\s+fetchpriority="high")?\s*/>',
    re.DOTALL,
  )

  def rsm96_sub(m: re.Match[str]) -> str:
    ps = "absolute" if m.group("src").startswith("/") else "relative"
    fp = "high" if 'fetchpriority="high"' in m.group(0) else None
    return picture(
      "RSM_LOGO",
      [96, 192],
      "96px",
      path_style=ps,
      alt="RSM Diagnostics Lab",
      width=96,
      height=87,
      classes="hero-badge-logo",
      loading=m.group("loading"),
      fetchpriority=fp,
    )

  out = rsm96_re.sub(rsm96_sub, out)

  # RSM hero badge 80
  rsm80_re = re.compile(
    r'<img\s+src="(?P<src>[^"]*RSM_LOGO-320\.png)"\s+alt="RSM Diagnostics Lab"\s+class="hero-badge-logo"\s+width="80"\s+height="80"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"(?:\s+fetchpriority="high")?\s*/>',
    re.DOTALL,
  )

  def rsm80_sub(m: re.Match[str]) -> str:
    ps = "absolute" if m.group("src").startswith("/") else "relative"
    fp = "high" if 'fetchpriority="high"' in m.group(0) else None
    return picture(
      "RSM_LOGO",
      [96, 160],
      "80px",
      path_style=ps,
      alt="RSM Diagnostics Lab",
      width=80,
      height=73,
      classes="hero-badge-logo",
      loading=m.group("loading"),
      fetchpriority=fp,
    )

  out = rsm80_re.sub(rsm80_sub, out)

  # RSM footer 48
  rsm48_re = re.compile(
    r'<img\s+src="(?P<src>[^"]*RSM_LOGO-320\.png)"\s+alt="RSM Diagnostics Lab"\s+width="48"\s+height="48"\s+decoding="async"\s+loading="lazy"\s*/>'
  )

  def rsm48_sub(m: re.Match[str]) -> str:
    ps = "absolute" if m.group("src").startswith("/") else "relative"
    return picture(
      "RSM_LOGO",
      [96, 160],
      "48px",
      path_style=ps,
      alt="RSM Diagnostics Lab",
      width=48,
      height=44,
      loading="lazy",
    )

  out = rsm48_re.sub(rsm48_sub, out)

  # RSM footer with class on img (privacy-policy)
  rsm48b_re = re.compile(
    r'<img\s+src="(?P<src>[^"]*RSM_LOGO-320\.png)"\s+alt="RSM Diagnostics Lab"\s+width="48"\s+height="48"\s+decoding="async"\s+loading="lazy"\s*/>'
  )
  out = rsm48b_re.sub(rsm48_sub, out)

  # Flagship logos on home
  flagship_tgi = re.compile(
    r'<img\s+class="flagship-logo"\s+src="assets/Total_GI_logo-900\.png"\s+alt="(?P<alt>[^"]*)"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def flagship_tgi_sub(m: re.Match[str]) -> str:
    return picture(
      "Total_GI_logo",
      [112, 224],
      "7rem",
      path_style="relative",
      alt=m.group("alt"),
      classes="flagship-logo",
      loading=m.group("loading"),
    )

  out = flagship_tgi.sub(flagship_tgi_sub, out)

  flagship_egha = re.compile(
    r'<img\s+class="flagship-logo"\s+src="assets/EGHA_logo-900\.png"\s+alt="(?P<alt>[^"]*)"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def flagship_egha_sub(m: re.Match[str]) -> str:
    return picture(
      "EGHA_logo",
      [112, 224],
      "7rem",
      path_style="relative",
      alt=m.group("alt"),
      classes="flagship-logo",
      loading=m.group("loading"),
    )

  out = flagship_egha.sub(flagship_egha_sub, out)

  flagship_resp = re.compile(
    r'<img\s+class="flagship-logo flagship-logo-round"\s+src="assets/Upper_Respiratory_Microscreen_Logo-400\.png"\s+alt="(?P<alt>[^"]*)"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def flagship_resp_sub(m: re.Match[str]) -> str:
    return picture(
      "Upper_Respiratory_logo",
      [88, 176],
      "2.75rem",
      path_style="relative",
      alt=m.group("alt"),
      classes="flagship-logo flagship-logo-round",
      loading=m.group("loading"),
    )

  out = flagship_resp.sub(flagship_resp_sub, out)

  # Test brand hero logos
  hero_tgi = re.compile(
    r'<img\s+src="assets/Total_GI_logo-900\.png"\s+alt="(?P<alt>[^"]*)"\s+class="test-brand-logo test-brand-logo-hero(?:\s+test-brand-logo-round)?"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def hero_tgi_sub(m: re.Match[str]) -> str:
    return picture(
      "Total_GI_logo",
      [224, 320, 448],
      "min(15.5rem, 42vw)",
      path_style="relative",
      alt=m.group("alt"),
      classes="test-brand-logo test-brand-logo-hero",
      loading=m.group("loading"),
    )

  out = hero_tgi.sub(hero_tgi_sub, out)

  hero_egha = re.compile(
    r'<img\s+src="assets/EGHA_logo-900\.png"\s+alt="(?P<alt>[^"]*)"\s+class="test-brand-logo test-brand-logo-hero(?:\s+test-brand-logo-round)?"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def hero_egha_sub(m: re.Match[str]) -> str:
    return picture(
      "EGHA_logo",
      [224, 320, 448],
      "min(15.5rem, 42vw)",
      path_style="relative",
      alt=m.group("alt"),
      classes="test-brand-logo test-brand-logo-hero",
      loading=m.group("loading"),
    )

  out = hero_egha.sub(hero_egha_sub, out)

  hero_resp = re.compile(
    r'<img\s+src="assets/Upper_Respiratory_Microscreen_Logo-400\.png"\s+alt="(?P<alt>[^"]*)"\s+class="test-brand-logo test-brand-logo-hero test-brand-logo-round"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def hero_resp_sub(m: re.Match[str]) -> str:
    return picture(
      "Upper_Respiratory_logo",
      [176, 320, 400],
      "min(15.5rem, 42vw)",
      path_style="relative",
      alt=m.group("alt"),
      classes="test-brand-logo test-brand-logo-hero test-brand-logo-round",
      loading=m.group("loading"),
    )

  out = hero_resp.sub(hero_resp_sub, out)

  # Section logos
  section_tgi = re.compile(
    r'<img\s+src="assets/Total_GI_logo-900\.png"\s+alt="(?P<alt>[^"]*)"\s+class="test-brand-logo test-brand-logo-section"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def section_tgi_sub(m: re.Match[str]) -> str:
    return picture(
      "Total_GI_logo",
      [320, 448],
      "min(28rem, 72vw)",
      path_style="relative",
      alt=m.group("alt"),
      classes="test-brand-logo test-brand-logo-section",
      loading=m.group("loading"),
    )

  out = section_tgi.sub(section_tgi_sub, out)

  section_egha = re.compile(
    r'<img\s+src="assets/EGHA_logo-900\.png"\s+alt="(?P<alt>[^"]*)"\s+class="test-brand-logo test-brand-logo-section"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def section_egha_sub(m: re.Match[str]) -> str:
    return picture(
      "EGHA_logo",
      [320, 448],
      "min(28rem, 72vw)",
      path_style="relative",
      alt=m.group("alt"),
      classes="test-brand-logo test-brand-logo-section",
      loading=m.group("loading"),
    )

  out = section_egha.sub(section_egha_sub, out)

  section_resp = re.compile(
    r'<img\s+src="assets/Upper_Respiratory_Microscreen_Logo-400\.png"\s+alt="(?P<alt>[^"]*)"\s+class="test-brand-logo test-brand-logo-section(?:\s+test-brand-logo-round)?"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def section_resp_sub(m: re.Match[str]) -> str:
    return picture(
      "Upper_Respiratory_logo",
      [320, 400],
      "min(28rem, 72vw)",
      path_style="relative",
      alt=m.group("alt"),
      classes="test-brand-logo test-brand-logo-section",
      loading=m.group("loading"),
    )

  out = section_resp.sub(section_resp_sub, out)

  # Card logos
  card_tgi = re.compile(
    r'<img\s+src="assets/Total_GI_logo-900\.png"\s+alt="(?P<alt>[^"]*)"\s+class="test-brand-logo test-brand-logo-card"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def card_tgi_sub(m: re.Match[str]) -> str:
    return picture(
      "Total_GI_logo",
      [224, 320],
      "min(13.5rem, 100%)",
      path_style="relative",
      alt=m.group("alt"),
      classes="test-brand-logo test-brand-logo-card",
      loading=m.group("loading"),
    )

  out = card_tgi.sub(card_tgi_sub, out)

  card_egha = re.compile(
    r'<img\s+src="assets/EGHA_logo-900\.png"\s+alt="(?P<alt>[^"]*)"\s+class="test-brand-logo test-brand-logo-card"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def card_egha_sub(m: re.Match[str]) -> str:
    return picture(
      "EGHA_logo",
      [224, 320],
      "min(13.5rem, 100%)",
      path_style="relative",
      alt=m.group("alt"),
      classes="test-brand-logo test-brand-logo-card",
      loading=m.group("loading"),
    )

  out = card_egha.sub(card_egha_sub, out)

  card_resp = re.compile(
    r'<img\s+src="assets/Upper_Respiratory_Microscreen_Logo-400\.png"\s+alt="(?P<alt>[^"]*)"\s+class="test-brand-logo test-brand-logo-card(?:\s+test-brand-logo-round)?"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def card_resp_sub(m: re.Match[str]) -> str:
    return picture(
      "Upper_Respiratory_logo",
      [176, 320],
      "min(13.5rem, 100%)",
      path_style="relative",
      alt=m.group("alt"),
      classes="test-brand-logo test-brand-logo-card",
      loading=m.group("loading"),
    )

  out = card_resp.sub(card_resp_sub, out)

  # Small comparison table logos
  small_tgi = re.compile(
    r'<img\s+src="assets/Total_GI_logo-900\.png"\s+alt="(?P<alt>[^"]*)"\s+width="56"\s+height="21"\s+decoding="async"\s+loading="lazy"\s*/>'
  )

  def small_tgi_sub(m: re.Match[str]) -> str:
    return picture(
      "Total_GI_logo",
      [112, 224],
      "56px",
      path_style="relative",
      alt=m.group("alt"),
      width=56,
      height=21,
      loading="lazy",
    )

  out = small_tgi.sub(small_tgi_sub, out)

  small_egha = re.compile(
    r'<img\s+src="assets/EGHA_logo-900\.png"\s+alt="(?P<alt>[^"]*)"\s+width="46"\s+height="18"\s+decoding="async"\s+loading="lazy"\s*/>'
  )

  def small_egha_sub(m: re.Match[str]) -> str:
    return picture(
      "EGHA_logo",
      [112, 224],
      "46px",
      path_style="relative",
      alt=m.group("alt"),
      width=46,
      height=18,
      loading="lazy",
    )

  out = small_egha.sub(small_egha_sub, out)

  # Remaining bare panel logos without class (GI page inline)
  bare_tgi = re.compile(
    r'<img\s+src="assets/Total_GI_logo-900\.png"\s+alt="(?P<alt>[^"]*)"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def bare_tgi_sub(m: re.Match[str]) -> str:
    return picture(
      "Total_GI_logo",
      [224, 320, 448],
      "min(15.5rem, 42vw)",
      path_style="relative",
      alt=m.group("alt"),
      loading=m.group("loading"),
    )

  out = bare_tgi.sub(bare_tgi_sub, out)

  bare_egha = re.compile(
    r'<img\s+src="assets/EGHA_logo-900\.png"\s+alt="(?P<alt>[^"]*)"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def bare_egha_sub(m: re.Match[str]) -> str:
    return picture(
      "EGHA_logo",
      [224, 320, 448],
      "min(15.5rem, 42vw)",
      path_style="relative",
      alt=m.group("alt"),
      loading=m.group("loading"),
    )

  out = bare_egha.sub(bare_egha_sub, out)

  bare_resp = re.compile(
    r'<img\s+src="assets/Upper_Respiratory_Microscreen_Logo-400\.png"\s+alt="(?P<alt>[^"]*)"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>'
  )

  def bare_resp_sub(m: re.Match[str]) -> str:
    return picture(
      "Upper_Respiratory_logo",
      [176, 320, 400],
      "min(15.5rem, 42vw)",
      path_style="relative",
      alt=m.group("alt"),
      loading=m.group("loading"),
    )

  out = bare_resp.sub(bare_resp_sub, out)

  report_tgi = re.compile(
    r'<img\s+src="assets/Total_GI_logo-900\.png"\s+alt="(?P<alt>[^"]*)"\s+class="test-brand-logo test-brand-logo-report"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>',
    re.DOTALL,
  )

  def report_tgi_sub(m: re.Match[str]) -> str:
    return picture(
      "Total_GI_logo",
      [224, 320, 448],
      "min(16.5rem, 100%)",
      path_style="relative",
      alt=m.group("alt"),
      classes="test-brand-logo test-brand-logo-report",
      loading=m.group("loading"),
    )

  out = report_tgi.sub(report_tgi_sub, out)

  report_egha = re.compile(
    r'<img\s+src="assets/EGHA_logo-900\.png"\s+alt="(?P<alt>[^"]*)"\s+class="test-brand-logo test-brand-logo-report"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>',
    re.DOTALL,
  )

  def report_egha_sub(m: re.Match[str]) -> str:
    return picture(
      "EGHA_logo",
      [224, 320, 448],
      "min(16.5rem, 100%)",
      path_style="relative",
      alt=m.group("alt"),
      classes="test-brand-logo test-brand-logo-report",
      loading=m.group("loading"),
    )

  out = report_egha.sub(report_egha_sub, out)

  report_resp = re.compile(
    r'<img\s+src="assets/Upper_Respiratory_Microscreen_Logo-400\.png"\s+alt="(?P<alt>[^"]*)"\s+class="test-brand-logo test-brand-logo-report test-brand-logo-round"\s+decoding="async"\s+loading="(?P<loading>[^"]+)"\s*/>',
    re.DOTALL,
  )

  def report_resp_sub(m: re.Match[str]) -> str:
    return picture(
      "Upper_Respiratory_logo",
      [176, 320, 400],
      "min(16.5rem, 100%)",
      path_style="relative",
      alt=m.group("alt"),
      classes="test-brand-logo test-brand-logo-report test-brand-logo-round",
      loading=m.group("loading"),
    )

  out = report_resp.sub(report_resp_sub, out)

  inclusion_tgi = re.compile(
    r'<img\s+src="assets/Total_GI_logo-900\.png"\s+alt="Total GI"\s+class="inclusion-card-logo"\s+width="96"\s+height="36"\s+decoding="async"\s+loading="lazy"\s*/>'
  )

  def inclusion_tgi_sub(_: re.Match[str]) -> str:
    return picture(
      "Total_GI_logo",
      [112, 224],
      "96px",
      path_style="relative",
      alt="Total GI",
      width=96,
      height=36,
      classes="inclusion-card-logo",
      loading="lazy",
    )

  out = inclusion_tgi.sub(inclusion_tgi_sub, out)

  inclusion_egha = re.compile(
    r'<img\s+src="assets/EGHA_logo-900\.png"\s+alt="EGHA"\s+class="inclusion-card-logo"\s+width="88"\s+height="34"\s+decoding="async"\s+loading="lazy"\s*/>'
  )

  def inclusion_egha_sub(_: re.Match[str]) -> str:
    return picture(
      "EGHA_logo",
      [112, 224],
      "88px",
      path_style="relative",
      alt="EGHA",
      width=88,
      height=34,
      classes="inclusion-card-logo",
      loading="lazy",
    )

  out = inclusion_egha.sub(inclusion_egha_sub, out)

  marker_tgi = re.compile(
    r'<img\s+src="assets/Total_GI_logo-900\.png"\s+alt=""\s+class="marker-profile-badge"\s+width="88"\s+height="34"\s+title="(?P<title>[^"]*)"\s+decoding="async"\s+loading="lazy"\s*/>',
    re.DOTALL,
  )

  def marker_tgi_sub(m: re.Match[str]) -> str:
    pic = picture(
      "Total_GI_logo",
      [112, 224],
      "88px",
      path_style="relative",
      alt="",
      width=88,
      height=34,
      classes="marker-profile-badge",
      loading="lazy",
    )
    return pic.replace("<img ", f'<img title="{m.group("title")}" ', 1)

  out = marker_tgi.sub(marker_tgi_sub, out)

  marker_egha = re.compile(
    r'<img\s+src="assets/EGHA_logo-900\.png"\s+alt=""\s+class="marker-profile-badge"\s+width="72"\s+height="28"\s+title="(?P<title>[^"]*)"\s+decoding="async"\s+loading="lazy"\s*/>',
    re.DOTALL,
  )

  def marker_egha_sub(m: re.Match[str]) -> str:
    pic = picture(
      "EGHA_logo",
      [112, 224],
      "72px",
      path_style="relative",
      alt="",
      width=72,
      height=28,
      classes="marker-profile-badge",
      loading="lazy",
    )
    return pic.replace("<img ", f'<img title="{m.group("title")}" ', 1)

  out = marker_egha.sub(marker_egha_sub, out)

  # Remaining RSM logos (privacy policy multiline etc.)
  rsm_remaining = re.compile(
    r'<img\s+src="(?P<src>[^"]*RSM_LOGO-320\.png)"\s+alt="RSM Diagnostics Lab"(?P<rest>[^>]*)>',
    re.DOTALL,
  )

  def rsm_remaining_sub(m: re.Match[str]) -> str:
    rest = m.group("rest")
    ps = "absolute" if m.group("src").startswith("/") else "relative"
    w = 96
    h = 87
    sizes = "96px"
    widths = [96, 192]
    if 'width="80"' in rest:
      w, h, sizes, widths = 80, 73, "80px", [96, 160]
    elif 'width="54"' in rest:
      w, h, sizes, widths = 54, 49, "54px", [96, 192]
    elif 'width="48"' in rest:
      w, h, sizes, widths = 48, 44, "48px", [96, 160]
    elif 'class="hero-badge-logo"' in rest:
      w, h, sizes, widths = 96, 87, "96px", [96, 192]
    loading = "lazy" if 'loading="lazy"' in rest else "eager"
    classes = ""
    if 'class="hero-badge-logo"' in rest:
      classes = "hero-badge-logo"
    fp = "high" if 'fetchpriority="high"' in rest else None
    return picture(
      "RSM_LOGO",
      widths,
      sizes,
      path_style=ps,
      alt="RSM Diagnostics Lab",
      width=w,
      height=h,
      classes=classes,
      loading=loading,
      fetchpriority=fp,
    )

  out = rsm_remaining.sub(rsm_remaining_sub, out)

  return out


def main() -> None:
  for path in HTML_FILES:
    original = path.read_text()
    updated = patch_content(original)
    if updated != original:
      path.write_text(updated)
      print(f"updated {path.relative_to(ROOT)}")


if __name__ == "__main__":
  main()
