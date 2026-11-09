/* Technical authorship: Lucas J. Cooke, Partner Relations Coordinator. Contact: l.jcooke@icloud.com. LinkedIn: https://www.linkedin.com/in/lucas-cooke/ */

const THEME_STORAGE_KEY = "rsm-theme";
const VALID_THEMES = new Set(["light", "dark"]);
const PDF_VIEWER_FRAGMENT = "navpanes=0&toolbar=1";

function isPdfUrl(url) {
  return /\.pdf(\?|#|$)/i.test(url || "");
}

function pdfViewerUrl(url) {
  if (!url || !isPdfUrl(url)) {
    return url;
  }
  if (/navpanes=0/i.test(url)) {
    return url;
  }
  const hashIndex = url.indexOf("#");
  if (hashIndex === -1) {
    return `${url}#${PDF_VIEWER_FRAGMENT}`;
  }
  return `${url.slice(0, hashIndex)}#${url.slice(hashIndex + 1)}&${PDF_VIEWER_FRAGMENT}`;
}

function applyPdfViewerParamsToEmbeds(root = document) {
  root.querySelectorAll('iframe[src*=".pdf"], iframe[data-src*=".pdf"]').forEach((iframe) => {
    ["src", "data-src"].forEach((attr) => {
      const value = iframe.getAttribute(attr);
      if (value) {
        iframe.setAttribute(attr, pdfViewerUrl(value));
      }
    });
  });

  root.querySelectorAll('a[href*=".pdf"][target="_blank"]:not([download])').forEach((link) => {
    link.setAttribute("href", pdfViewerUrl(link.getAttribute("href")));
  });
}

function getActiveTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  return VALID_THEMES.has(current) ? current : "light";
}

function getOppositeTheme(theme) {
  return theme === "dark" ? "light" : "dark";
}

function getThemeToggleLabel(theme) {
  return getOppositeTheme(theme) === "dark" ? "Switch to dark theme" : "Switch to light theme";
}

function updateThemeToggleUi(theme) {
  const label = getThemeToggleLabel(theme);
  document.querySelectorAll(".theme-toggle-btn").forEach((button) => {
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
  });
}

function announceTheme(theme) {
  const liveRegion = document.getElementById("themeLiveRegion");
  if (liveRegion) {
    liveRegion.textContent = `${theme === "dark" ? "Dark" : "Light"} theme activated`;
  }
}

function applyTheme(theme, { announce = false } = {}) {
  if (!VALID_THEMES.has(theme)) {
    return;
  }

  document.documentElement.setAttribute("data-theme", theme);
  updateThemeToggleUi(theme);

  if (announce) {
    announceTheme(theme);
  }
}

document.querySelectorAll(".theme-toggle-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const next = getOppositeTheme(getActiveTheme());
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next, { announce: true });
  });
});

applyTheme(getActiveTheme());

const comparisonModal = document.getElementById("comparisonModal");
const comparisonScrollTab = document.getElementById("comparisonScrollTab");
const totalGiSection = document.getElementById("total-gi");
const siteHeader = document.querySelector(".site-header");
const mainContent = document.getElementById("main-content");
const navPanel = document.querySelector(".nav-panel");
let comparisonModalTrigger = null;
let totalGiInView = false;
let releaseModalFocusTrap = null;

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
}

function trapFocus(container) {
  function handleKeydown(event) {
    if (event.key !== "Tab") {
      return;
    }

    const focusable = getFocusableElements(container);
    if (!focusable.length) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  container.addEventListener("keydown", handleKeydown);
  return () => container.removeEventListener("keydown", handleKeydown);
}

function setBackgroundInert(inert) {
  siteHeader?.toggleAttribute("inert", inert);
  mainContent?.toggleAttribute("inert", inert);

  if (comparisonScrollTab && comparisonScrollTab.getAttribute("aria-hidden") === "true") {
    comparisonScrollTab.toggleAttribute("inert", inert);
  }
}

function updateComparisonScrollTab() {
  if (!comparisonScrollTab) {
    return;
  }

  const modalOpen = comparisonModal && !comparisonModal.hidden;
  const show = totalGiInView && !modalOpen;

  comparisonScrollTab.classList.toggle("is-visible", show);
  comparisonScrollTab.setAttribute("aria-hidden", show ? "false" : "true");
  comparisonScrollTab.tabIndex = show ? 0 : -1;
}

function openComparisonModal(trigger) {
  if (!comparisonModal) {
    return;
  }

  comparisonModalTrigger = trigger || document.activeElement;
  comparisonModal.hidden = false;
  document.body.classList.add("comparison-modal-open");
  setBackgroundInert(true);
  releaseModalFocusTrap = trapFocus(comparisonModal);
  updateComparisonScrollTab();

  const closeButton = comparisonModal.querySelector(".comparison-modal-close");
  closeButton?.focus();
}

function closeComparisonModal() {
  if (!comparisonModal) {
    return;
  }

  comparisonModal.hidden = true;
  document.body.classList.remove("comparison-modal-open");
  releaseModalFocusTrap?.();
  releaseModalFocusTrap = null;
  setBackgroundInert(false);
  updateComparisonScrollTab();

  if (comparisonModalTrigger instanceof HTMLElement) {
    comparisonModalTrigger.focus();
  }
}

document.querySelectorAll(".comparison-modal-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    openComparisonModal(trigger);
  });
});

comparisonModal?.querySelectorAll("[data-close-comparison]").forEach((element) => {
  element.addEventListener("click", () => {
    closeComparisonModal();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }
  if (comparisonModal && !comparisonModal.hidden) {
    closeComparisonModal();
  }
  if (docPreviewModal && !docPreviewModal.hidden) {
    closeDocPreviewModal();
  }
});

if (comparisonModal && new URLSearchParams(window.location.search).get("compare") === "open") {
  openComparisonModal();
  window.history.replaceState({}, "", window.location.pathname);
}

if (totalGiSection && comparisonScrollTab) {
  const totalGiObserver = new IntersectionObserver(
    ([entry]) => {
      totalGiInView = entry.isIntersecting;
      updateComparisonScrollTab();
    },
    {
      threshold: 0.12,
      rootMargin: "-12% 0px -12% 0px",
    },
  );

  totalGiObserver.observe(totalGiSection);
}

const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
let navScrollLockY = 0;

function setNavOpen(isOpen) {
  mainNav?.classList.toggle("show", isOpen);
  if (navToggle) {
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  if (isOpen) {
    navScrollLockY = window.scrollY || window.pageYOffset || 0;
    document.body.classList.add("nav-menu-open");
    document.body.style.top = `-${navScrollLockY}px`;
    // Reset list scroll so items always start accessible from the top of the panel
    if (mainNav) {
      mainNav.scrollTop = 0;
    }
  } else {
    const wasOpen = document.body.classList.contains("nav-menu-open");
    document.body.classList.remove("nav-menu-open");
    document.body.style.top = "";
    if (wasOpen) {
      window.scrollTo(0, navScrollLockY);
    }
  }
}

function closeNav() {
  setNavOpen(false);
}

navToggle?.addEventListener("click", () => {
  const isOpen = !mainNav?.classList.contains("show");
  setNavOpen(isOpen);
});

mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    closeNav();
  });
});

document.addEventListener("click", (event) => {
  if (!mainNav?.classList.contains("show") || !(event.target instanceof Node)) {
    return;
  }

  if (navPanel?.contains(event.target)) {
    return;
  }

  closeNav();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mainNav?.classList.contains("show")) {
    closeNav();
  }
});

// Test Categories dropdown: keep aria-expanded in sync for hover/focus, and
// allow Escape to dismiss without closing the whole mobile menu.
const navDropdownItems = mainNav
  ? Array.from(mainNav.querySelectorAll(".nav-item-has-dropdown"))
  : [];
const navSubmenuItems = mainNav
  ? Array.from(mainNav.querySelectorAll(".nav-dropdown-item.has-submenu"))
  : [];
const priorityDropdownItems = navPanel
  ? Array.from(
      navPanel.querySelectorAll(".nav-priority .nav-item-has-dropdown")
    )
  : [];
const prioritySubmenuItems = navPanel
  ? Array.from(
      navPanel.querySelectorAll(".nav-priority .nav-dropdown-item.has-submenu")
    )
  : [];

function setDropdownOpen(item, isOpen) {
  item.classList.toggle("is-open", isOpen);
  const trigger =
    item.querySelector(":scope > .nav-link-parent") ||
    item.querySelector(":scope > .nav-submenu-trigger");
  if (trigger) {
    trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }
}

function prefersHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function bindDesktopMenuOpenState(item) {
  item.addEventListener("mouseenter", () => {
    if (!priorityNavActive()) {
      setDropdownOpen(item, true);
    }
  });
  item.addEventListener("mouseleave", () => {
    if (!priorityNavActive()) {
      setDropdownOpen(item, false);
    }
  });
  item.addEventListener("focusin", () => {
    if (!priorityNavActive()) {
      setDropdownOpen(item, true);
    }
  });
  item.addEventListener("focusout", (event) => {
    if (!priorityNavActive() && !item.contains(event.relatedTarget)) {
      setDropdownOpen(item, false);
    }
  });
}

function bindPriorityMenuOpenState(item) {
  const trigger =
    item.querySelector(":scope > .nav-link-parent") ||
    item.querySelector(":scope > .nav-submenu-trigger");

  item.addEventListener("mouseenter", () => {
    if (priorityNavActive() && prefersHover()) {
      setDropdownOpen(item, true);
    }
  });
  item.addEventListener("mouseleave", () => {
    if (priorityNavActive() && prefersHover()) {
      setDropdownOpen(item, false);
    }
  });

  trigger?.addEventListener("click", (event) => {
    if (!priorityNavActive()) {
      return;
    }
    event.stopPropagation();
    const isOpen = item.classList.contains("is-open");
    // Second tap on an already-open page link navigates (e.g. Gastrointestinal page)
    if (
      isOpen &&
      trigger instanceof HTMLAnchorElement &&
      trigger.classList.contains("nav-submenu-trigger")
    ) {
      return;
    }
    // Touch / compact: toggle flyout instead of immediate navigation
    event.preventDefault();
    const willOpen = !isOpen;
    // Close sibling menus so only one flyout is open
    [...priorityDropdownItems, ...prioritySubmenuItems].forEach((other) => {
      if (other !== item && !item.contains(other) && !other.contains(item)) {
        setDropdownOpen(other, false);
      }
    });
    // When opening a top-level priority dropdown, also close its sister tops
    if (item.classList.contains("nav-item-has-dropdown")) {
      priorityDropdownItems.forEach((other) => {
        if (other !== item) {
          setDropdownOpen(other, false);
        }
      });
    }
    setDropdownOpen(item, willOpen);
  });

  item.addEventListener("focusin", () => {
    if (priorityNavActive()) {
      setDropdownOpen(item, true);
    }
  });
  item.addEventListener("focusout", (event) => {
    if (priorityNavActive() && !item.contains(event.relatedTarget)) {
      setDropdownOpen(item, false);
    }
  });
}

navDropdownItems.forEach(bindDesktopMenuOpenState);
navSubmenuItems.forEach(bindDesktopMenuOpenState);
priorityDropdownItems.forEach(bindPriorityMenuOpenState);
prioritySubmenuItems.forEach(bindPriorityMenuOpenState);

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  [
    ...navSubmenuItems,
    ...navDropdownItems,
    ...prioritySubmenuItems,
    ...priorityDropdownItems,
  ].forEach((item) => {
    if (!item.classList.contains("is-open")) {
      return;
    }
    setDropdownOpen(item, false);
    const trigger =
      item.querySelector(":scope > .nav-link-parent") ||
      item.querySelector(":scope > .nav-submenu-trigger");
    trigger?.focus();
  });
});

// Close priority flyouts when tapping outside
document.addEventListener("click", (event) => {
  if (!(event.target instanceof Node)) {
    return;
  }
  priorityDropdownItems.forEach((item) => {
    if (item.classList.contains("is-open") && !item.contains(event.target)) {
      setDropdownOpen(item, false);
    }
  });
});

// Priority-Plus adaptive header: keep as many top-level links as fit beside the
// brand, folding the rest (and the full menu with dropdowns) into Menu. Measurement
// is content-aware for zoom, font load, and viewport changes.
const navPriority = document.querySelector(".nav-priority");
const navPriorityItems = navPriority
  ? Array.from(navPriority.querySelectorAll("[data-priority]")).sort(
      (a, b) =>
        Number(a.getAttribute("data-priority") || 99) -
        Number(b.getAttribute("data-priority") || 99)
    )
  : [];
const brandEl = navPanel?.querySelector(".brand");
const navActionsEl = navPanel?.querySelector(".nav-actions");
const PRIORITY_NAV_SAFETY = 12;

function priorityNavActive() {
  return navToggle ? window.getComputedStyle(navToggle).display !== "none" : false;
}

function updatePriorityNav() {
  if (!navPriority || !navPanel || !navPriorityItems.length) {
    return;
  }

  // Desktop shows the full inline main nav; priority row is CSS-hidden.
  if (!priorityNavActive()) {
    navPriorityItems.forEach((item) => {
      item.hidden = false;
    });
    return;
  }

  // Reveal every candidate so widths are measurable
  navPriorityItems.forEach((item) => {
    item.hidden = false;
    if (item.classList.contains("is-open")) {
      setDropdownOpen(item, false);
    }
  });

  const panelStyles = window.getComputedStyle(navPanel);
  const priorityStyles = window.getComputedStyle(navPriority);
  const panelGap =
    parseFloat(panelStyles.columnGap) ||
    parseFloat(panelStyles.gap) ||
    0;
  const linkGap =
    parseFloat(priorityStyles.columnGap) ||
    parseFloat(priorityStyles.gap) ||
    0;

  const brandWidth = brandEl ? brandEl.getBoundingClientRect().width : 0;
  const actionsWidth = navActionsEl
    ? navActionsEl.getBoundingClientRect().width
    : 0;
  // Brand | priority | actions - two inter-item gaps on the primary row
  const available = Math.max(
    0,
    navPanel.clientWidth -
      brandWidth -
      actionsWidth -
      panelGap * 2 -
      PRIORITY_NAV_SAFETY
  );

  let used = 0;
  let overflowing = false;
  navPriorityItems.forEach((item, index) => {
    if (overflowing) {
      item.hidden = true;
      return;
    }

    const itemWidth = item.getBoundingClientRect().width;
    const withGap = itemWidth + (index > 0 ? linkGap : 0);
    if (used + withGap <= available) {
      used += withGap;
    } else {
      item.hidden = true;
      overflowing = true;
    }
  });
}

let priorityNavFrame = null;
function schedulePriorityNavUpdate() {
  if (priorityNavFrame !== null) {
    return;
  }
  priorityNavFrame = window.requestAnimationFrame(() => {
    priorityNavFrame = null;
    updatePriorityNav();
  });
}

// Only plain priority links close the (closed) menu - flyout anchors still navigate
navPriorityItems.forEach((item) => {
  if (item.matches("a.nav-priority-link")) {
    item.addEventListener("click", closeNav);
  } else {
    item.querySelectorAll("a:not(.nav-link-parent):not(.nav-submenu-trigger)").forEach((link) => {
      link.addEventListener("click", () => {
        setDropdownOpen(item.closest(".nav-item-has-dropdown") || item, false);
      });
    });
  }
});

if (navPriority && navPanel && navPriorityItems.length) {
  if (typeof ResizeObserver === "function") {
    const ro = new ResizeObserver(schedulePriorityNavUpdate);
    ro.observe(navPanel);
    if (brandEl) {
      ro.observe(brandEl);
    }
    if (navActionsEl) {
      ro.observe(navActionsEl);
    }
  } else {
    window.addEventListener("resize", schedulePriorityNavUpdate);
  }

  window.addEventListener("orientationchange", schedulePriorityNavUpdate);

  if (document.fonts && typeof document.fonts.ready?.then === "function") {
    document.fonts.ready.then(schedulePriorityNavUpdate);
  }

  updatePriorityNav();
}

// Reset any open mobile menu when the layout resolves to the desktop nav so a
// stale "show" state can't linger across resizing, rotation, or zoom changes.
const desktopNavQuery = window.matchMedia("(min-width: 1141px)");
function handleDesktopNavChange(event) {
  if (event.matches) {
    closeNav();
  }
  schedulePriorityNavUpdate();
}
if (typeof desktopNavQuery.addEventListener === "function") {
  desktopNavQuery.addEventListener("change", handleDesktopNavChange);
} else if (typeof desktopNavQuery.addListener === "function") {
  desktopNavQuery.addListener(handleDesktopNavChange);
}

document.querySelector(".skip-link")?.addEventListener("click", () => {
  mainContent?.focus();
});

const tabButtons = document.querySelectorAll(".tab-button");
const testCategories = document.querySelectorAll(".test-category");

function syncTabPanels(activePanel) {
  testCategories.forEach((panel) => {
    const isActive = panel === activePanel;
    panel.setAttribute("aria-hidden", isActive ? "false" : "true");
    panel.toggleAttribute("hidden", !isActive);
  });
}

if (tabButtons.length && testCategories.length) {
  tabButtons.forEach((button, index) => {
    const category = button.getAttribute("data-category");
    const panel = document.querySelector(
      `.test-category[data-category="${category}"]`,
    );

    if (panel) {
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", button.classList.contains("active") ? "true" : "false");
      button.setAttribute("aria-controls", panel.id || `panel-${category}`);
      if (!panel.id) {
        panel.id = `panel-${category}`;
      }
      button.id = button.id || `tab-${category}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", button.id);
      panel.setAttribute("tabindex", "0");
    }

    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });
      testCategories.forEach((cat) => cat.classList.remove("active"));

      button.classList.add("active");
      button.setAttribute("aria-selected", "true");
      panel?.classList.add("active");
      syncTabPanels(panel || null);
    });

    button.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const offset = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (index + offset + tabButtons.length) % tabButtons.length;
        tabButtons[nextIndex]?.focus();
        tabButtons[nextIndex]?.click();
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        tabButtons[0]?.focus();
        tabButtons[0]?.click();
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        tabButtons[tabButtons.length - 1]?.focus();
        tabButtons[tabButtons.length - 1]?.click();
      }
    });
  });

  const tabList = document.querySelector(".category-tabs");
  if (tabList) {
    tabList.setAttribute("role", "tablist");
  }

  const activePanel = document.querySelector(".test-category.active");
  syncTabPanels(activePanel);
}

const docPreviewModal = document.getElementById("docPreviewModal");
const docPreviewViewer = document.getElementById("docPreviewViewer");
const docPreviewActions = document.getElementById("docPreviewActions");
const docPreviewTitle = document.getElementById("docPreviewTitle");
const docPreviewType = document.getElementById("docPreviewType");
let docPreviewTrigger = null;
let releaseDocModalFocusTrap = null;

function clearDocPreviewMedia() {
  if (!docPreviewViewer) {
    return;
  }
  docPreviewViewer.querySelectorAll("video").forEach((video) => {
    video.pause();
  });
  docPreviewViewer.innerHTML = "";
  docPreviewViewer.classList.remove("doc-modal-viewer--video");
}

function openDocPreviewModal(tile, trigger) {
  if (!docPreviewModal || !tile) {
    return;
  }

  const src = tile.getAttribute("data-doc-src");
  const title = tile.getAttribute("data-doc-title") || "Document preview";
  const filename = tile.getAttribute("data-doc-filename") || "";
  const type = tile.getAttribute("data-doc-type") || "pdf";
  if (!src) {
    return;
  }

  docPreviewTrigger = trigger || document.activeElement;
  if (docPreviewTitle) {
    docPreviewTitle.textContent = title;
  }
  if (docPreviewType) {
    docPreviewType.textContent = type === "video" ? "Video" : "PDF";
  }

  clearDocPreviewMedia();
  if (type === "video") {
    docPreviewViewer?.classList.add("doc-modal-viewer--video");
    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.preload = "metadata";
    const source = document.createElement("source");
    source.src = src;
    source.type = "video/mp4";
    video.appendChild(source);
    docPreviewViewer?.appendChild(video);
  } else {
    const iframe = document.createElement("iframe");
    iframe.src = pdfViewerUrl(src);
    iframe.title = title;
    iframe.loading = "eager";
    docPreviewViewer?.appendChild(iframe);
  }

  if (docPreviewActions) {
    docPreviewActions.innerHTML = "";
    const openLink = document.createElement("a");
    openLink.className = "button button-dark";
    openLink.href = pdfViewerUrl(src);
    openLink.target = "_blank";
    openLink.rel = "noopener noreferrer";
    openLink.textContent = type === "video" ? "Open Video" : "Open PDF";
    docPreviewActions.appendChild(openLink);

    const downloadLink = document.createElement("a");
    downloadLink.className = "button button-outline";
    downloadLink.href = src;
    downloadLink.download = filename;
    downloadLink.textContent = "Download";
    docPreviewActions.appendChild(downloadLink);

    if (type === "pdf") {
      const printButton = document.createElement("button");
      printButton.type = "button";
      printButton.className = "button button-outline";
      printButton.setAttribute("data-print-src", src);
      printButton.textContent = "Print";
      docPreviewActions.appendChild(printButton);
    }
  }

  docPreviewModal.hidden = false;
  document.body.classList.add("doc-modal-open");
  setBackgroundInert(true);
  releaseDocModalFocusTrap = trapFocus(docPreviewModal);
  docPreviewModal.querySelector(".doc-modal-close")?.focus();
}

function closeDocPreviewModal() {
  if (!docPreviewModal || docPreviewModal.hidden) {
    return;
  }

  docPreviewModal.hidden = true;
  document.body.classList.remove("doc-modal-open");
  releaseDocModalFocusTrap?.();
  releaseDocModalFocusTrap = null;
  clearDocPreviewMedia();
  if (docPreviewActions) {
    docPreviewActions.innerHTML = "";
  }
  setBackgroundInert(false);

  if (docPreviewTrigger instanceof HTMLElement) {
    docPreviewTrigger.focus();
  }
  docPreviewTrigger = null;
}

document.querySelectorAll(".doc-filter[data-doc-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.getAttribute("data-doc-filter") || "all";
    document.querySelectorAll(".doc-filter[data-doc-filter]").forEach((peer) => {
      const active = peer === button;
      peer.classList.toggle("is-active", active);
      peer.setAttribute("aria-pressed", active ? "true" : "false");
    });
    document.querySelectorAll("[data-doc-category-section]").forEach((section) => {
      const category = section.getAttribute("data-doc-category-section");
      section.hidden = filter !== "all" && category !== filter;
    });
    if (filter !== "all") {
      document.getElementById(`docs-${filter}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

document.querySelectorAll("[data-doc-preview]").forEach((button) => {
  button.addEventListener("click", () => {
    const tile = button.closest(".doc-tile");
    openDocPreviewModal(tile, button);
  });
});

docPreviewModal?.querySelectorAll("[data-close-doc-preview]").forEach((element) => {
  element.addEventListener("click", () => {
    closeDocPreviewModal();
  });
});

document.addEventListener("click", (event) => {
  const printButton = event.target.closest("[data-print-src]");
  if (!printButton) {
    return;
  }

  const src = printButton.getAttribute("data-print-src");
  if (!src) {
    return;
  }

  const printWindow = window.open(pdfViewerUrl(src), "_blank", "noopener,noreferrer");
  if (!printWindow) {
    return;
  }

  let printed = false;
  const triggerPrint = () => {
    if (printed) {
      return;
    }
    printed = true;
    try {
      printWindow.focus();
      printWindow.print();
    } catch (_) {
      /* Browser may block print until the PDF viewer finishes loading. */
    }
  };

  printWindow.addEventListener("load", triggerPrint);
  window.setTimeout(triggerPrint, 1200);
});

const existingClientCopy =
  'This form is only for preexisting RSM clients that already opened an account through the Account Requisition Form and have a KOLIMS account. If you do not yet have an account, use the New account form first.';

const requestForms = {
  account: {
    title: "RSM—Account Requisition Form",
    heading: "Account requisition",
    label: "New practice",
    existingClient: false,
    noticeTitle: "RSM—Account Requisition Form Administrative, Privacy, and Compliance Notice",
    prep: [
      "Practice, facility, and provider details",
      "A contact email for account follow-up and KOLIMS setup",
      "Do not enter patient names or other identifiable patient information",
    ],
    steps: [
      "RSM reviews your account request.",
      "We coordinate account setup, KOLIMS access, and initial kit details as needed.",
      "The lab team confirms the next step with you.",
    ],
    helpCopy:
      "Prefer to walk through account setup, KOLIMS access, or initial kit coordination first? Reach out and we will help.",
    copy:
      "<p>Complete this form to request RSM account setup, KOLIMS portal setup, and initial test kit coordination. Please provide complete and accurate information. Missing, incomplete, or unclear information may delay setup.</p>",
    embed: "https://docs.google.com/forms/d/e/1FAIpQLSeGc2Z8M2824wihqCwuQvs4vyuJGZxIrqVEU480QLpQptLYvw/viewform?embedded=true",
    open: "https://docs.google.com/forms/d/e/1FAIpQLSeGc2Z8M2824wihqCwuQvs4vyuJGZxIrqVEU480QLpQptLYvw/viewform?usp=header",
  },
  bulk: {
    title: "RSM—Bulk Shipment Request Form",
    heading: "Bulk shipment",
    label: "Existing account",
    existingClient: true,
    noticeTitle: "RSM—Bulk Shipment Request Form Administrative, Privacy, and Compliance Notice",
    attestationTitle: "RSM—Bulk Shipment Request Form Preliminary Attestation Statement",
    prep: [
      "Practice name exactly as it appears in the RSM account and KOLIMS",
      "The practice's primary KOLIMS administrator email",
      "Kit quantities that do not exceed 30 kits combined across both kit types",
    ],
    steps: [
      "RSM reviews this bulk kit supply request.",
      "If the request can be fulfilled, RSM ships blank collection kits, each with a blank TRF, to the practice or facility.",
      "Open the kit with the patient at the visit and complete the practice, provider, test, and diagnosis portions of the TRF before they leave. Testing starts only after the completed, signed TRF returns with a specimen.",
    ],
    helpCopy:
      "If you'd rather ship a kit to a patient's home instead of keeping office stock, place a drop shipment in KOLIMS. For a KOLIMS walkthrough, call or email the lab.",
    copy:
      `<p>${existingClientCopy}</p>` +
      "<p>This form requests a bulk shipment of test collection kits to your practice or facility, to keep on hand and give to patients at the visit. Each kit includes a blank TRF. Combined requests should not exceed 30 kits across both kit types, because kits expire. Always check the expiration date before handing a kit to a patient.</p>" +
      '<p>If you\'d rather have RSM ship a kit straight to a patient\'s home instead of keeping stock in-office, place that as a drop shipment through RSM\'s KOLIMS Provider Portal at <a href="https://app.kolims.com/" target="_blank" rel="noopener noreferrer">app.kolims.com</a>.</p>',
    embed: "https://docs.google.com/forms/d/e/1FAIpQLSfyjBgmsnKgQ5Bcl0NkhIKIrm_ZYNP83RNkc0sJCmI7k3x1uA/viewform?embedded=true",
    open: "https://docs.google.com/forms/d/e/1FAIpQLSfyjBgmsnKgQ5Bcl0NkhIKIrm_ZYNP83RNkc0sJCmI7k3x1uA/viewform?usp=header",
  },
  drop: {
    title: "RSM—Patient Direct Drop Shipment Request Form",
    heading: "Patient drop shipment",
    label: "Exceptional cases only",
    existingClient: true,
    noticeTitle: "RSM—Patient Direct Drop Shipment Request Form Administrative, Privacy, and Compliance Notice",
    attestationTitle: "RSM—Patient Direct Drop Shipment Request Form Preliminary Attestation Statement",
    prep: [
      "Use this form only if RSM has directed you to. Otherwise use KOLIMS",
      "Patient mailing details exactly as in the patient record. Do not submit New York or California addresses",
      "The practice's primary KOLIMS administrator email",
    ],
    steps: [
      "RSM reviews this patient drop shipment request.",
      "If the request can be fulfilled, RSM ships a kit and a blank TRF to the identified patient.",
      "Testing starts only after the completed, signed TRF returns with the specimen.",
    ],
    helpCopy:
      "Do not use this form unless RSM has directed you to. Place patient drop shipments in the KOLIMS Provider Portal. For onboarding or a walkthrough, call or email the lab.",
    copy:
      '<p><strong>This form is only for exceptional cases in which you have been directed to use this form instead of KOLIMS.</strong> If you are able to place this request through RSM\'s KOLIMS Provider Portal, do so at <a href="https://app.kolims.com/" target="_blank" rel="noopener noreferrer">app.kolims.com</a>.</p>' +
      `<p>${existingClientCopy}</p>`,
    bannerLabel: "Exceptional cases only",
    bannerCopy:
      "Place patient drop shipments in RSM's KOLIMS Provider Portal. Use this form only if RSM has directed you to use it instead.",
    bannerCta: "Open KOLIMS Provider Portal",
    bannerHref: "https://app.kolims.com/",
    embed: "https://docs.google.com/forms/d/e/1FAIpQLSc7pjq2CfsZwUvfBXhXvfBhEpKbdAjtfklejc5vFBXUFqHdQA/viewform?embedded=true",
    open: "https://docs.google.com/forms/d/e/1FAIpQLSc7pjq2CfsZwUvfBXhXvfBhEpKbdAjtfklejc5vFBXUFqHdQA/viewform?usp=header",
  },
};

const requestFormFilters = document.querySelectorAll(".request-form-filter");
const requestFormFrame = document.getElementById("requestFormFrame");
const requestFormLabel = document.getElementById("requestFormLabel");
const requestFormOpen = document.getElementById("requestFormOpen");
const requestFormFallback = document.getElementById("requestFormFallback");
const requestFormHeading = document.getElementById("requestFormHeading");
const requestFormCopy = document.getElementById("requestFormCopy");
const requestFormPanel = document.getElementById("requestFormPanel");
const requestHelpCopy = document.getElementById("requestHelpCopy");
const requestNextSteps = document.getElementById("requestNextSteps");
const requestPrepList = document.getElementById("requestPrepList");
const requestFormLive = document.getElementById("requestFormLive");
const requestHelpPortal = document.getElementById("requestHelpPortal");
const requestHelpEmail = document.getElementById("requestHelpEmail");
const requestNotices = document.querySelectorAll("[data-request-notice]");
const requestNoticeSummary = document.getElementById("requestNoticeSummary");
const requestAttestationDetails = document.getElementById("requestAttestationDetails");
const requestAttestationSummary = document.getElementById("requestAttestationSummary");
const requestAttestations = document.querySelectorAll("[data-request-attestation]");
const requestFormBanner = document.getElementById("requestFormBanner");
const requestFormBannerLabel = document.getElementById("requestFormBannerLabel");
const requestFormBannerCopy = document.getElementById("requestFormBannerCopy");
const requestFormBannerCta = document.getElementById("requestFormBannerCta");

function fillList(listEl, items, tagName) {
  if (!listEl || !items) {
    return;
  }
  listEl.replaceChildren(
    ...items.map((text) => {
      const item = document.createElement(tagName);
      item.textContent = text;
      return item;
    })
  );
}

function hashToFormKey(hash) {
  const id = (hash || "").replace(/^#/, "");
  if (id === "bulk-shipment-form" || id === "existing-account-forms") {
    return "bulk";
  }
  if (id === "drop-shipment-form") {
    return "drop";
  }
  return "account";
}

function selectRequestForm(key, { updateHash = false } = {}) {
  const form = requestForms[key] || requestForms.account;
  requestFormFilters.forEach((button) => {
    const active = button.getAttribute("data-form-key") === key;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
    button.setAttribute("tabindex", active ? "0" : "-1");
    if (active && requestFormPanel) {
      requestFormPanel.setAttribute("aria-labelledby", button.id);
    }
  });
  if (requestFormHeading) {
    requestFormHeading.textContent = form.heading;
  }
  if (requestFormCopy) {
    requestFormCopy.innerHTML = form.copy;
  }
  fillList(requestPrepList, form.prep, "li");
  fillList(requestNextSteps, form.steps, "li");
  if (requestFormLive && updateHash) {
    requestFormLive.textContent = `${form.title} selected.`;
  }
  if (requestHelpCopy) {
    requestHelpCopy.textContent = form.helpCopy;
  }
  if (requestHelpPortal) {
    requestHelpPortal.hidden = !form.existingClient;
    requestHelpPortal.classList.toggle("button-primary", form.existingClient);
    requestHelpPortal.classList.toggle("button-outline", !form.existingClient);
  }
  if (requestHelpEmail) {
    requestHelpEmail.classList.toggle("button-primary", !form.existingClient);
    requestHelpEmail.classList.toggle("button-outline", form.existingClient);
  }
  if (requestFormLabel) {
    requestFormLabel.textContent = form.label;
  }
  if (requestFormOpen) {
    requestFormOpen.href = form.open;
  }
  if (requestFormFallback) {
    requestFormFallback.href = form.open;
  }
  requestNotices.forEach((notice) => {
    notice.hidden = notice.getAttribute("data-request-notice") !== key;
  });
  if (requestNoticeSummary && form.noticeTitle) {
    requestNoticeSummary.textContent = form.noticeTitle;
  }
  const hasAttestation = Boolean(form.attestationTitle);
  if (requestAttestationDetails) {
    requestAttestationDetails.hidden = !hasAttestation;
  }
  requestAttestations.forEach((attestation) => {
    attestation.hidden = attestation.getAttribute("data-request-attestation") !== key;
  });
  if (requestAttestationSummary && form.attestationTitle) {
    requestAttestationSummary.textContent = form.attestationTitle;
  }
  if (requestFormBanner) {
    const showBanner = Boolean(form.bannerCopy);
    requestFormBanner.hidden = !showBanner;
    if (showBanner) {
      if (requestFormBannerLabel && form.bannerLabel) {
        requestFormBannerLabel.textContent = form.bannerLabel;
      }
      if (requestFormBannerCopy) {
        requestFormBannerCopy.textContent = form.bannerCopy;
      }
      if (requestFormBannerCta) {
        requestFormBannerCta.href = form.bannerHref || "https://app.kolims.com/";
        requestFormBannerCta.textContent = form.bannerCta || "Open KOLIMS Provider Portal";
      }
    }
  }
  if (requestFormFrame && requestFormFrame.getAttribute("src") !== form.embed) {
    requestFormFrame.src = form.embed;
    requestFormFrame.title = form.title;
  }
  if (updateHash) {
    const button = document.querySelector(`.request-form-filter[data-form-key="${key}"]`);
    if (button?.id && `#${button.id}` !== window.location.hash) {
      history.replaceState(null, "", `#${button.id}`);
    }
  }
}

if (requestFormFilters.length && requestFormFrame) {
  const formKeys = ["account", "bulk", "drop"];
  requestFormFilters.forEach((button) => {
    button.addEventListener("click", () => {
      selectRequestForm(button.getAttribute("data-form-key"), { updateHash: true });
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }
      event.preventDefault();
      const current = formKeys.indexOf(button.getAttribute("data-form-key"));
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const nextKey = formKeys[(current + delta + formKeys.length) % formKeys.length];
      const nextButton = document.querySelector(`.request-form-filter[data-form-key="${nextKey}"]`);
      selectRequestForm(nextKey, { updateHash: true });
      nextButton?.focus();
    });
  });
  selectRequestForm(hashToFormKey(window.location.hash));
  window.addEventListener("hashchange", () => {
    selectRequestForm(hashToFormKey(window.location.hash));
  });
}

applyPdfViewerParamsToEmbeds();

const SITE_TERMS_VERSION = "2026-09-01.15";
const SITE_CONSENT_KEY = "rsm-site-legal-consent";

function getStoredSiteConsent() {
  try {
    const raw = localStorage.getItem(SITE_CONSENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function hasValidSiteConsent() {
  const record = getStoredSiteConsent();
  return (
    record?.termsVersion === SITE_TERMS_VERSION &&
    typeof record?.acceptedAt === "string" &&
    record.acceptedAt.length > 0
  );
}

function isBlockingLegalGatePage() {
  const path = (window.location.pathname || "/").replace(/\/$/, "") || "/";
  return (
    path === "/request-kit" ||
    path.endsWith("/request-kit.html") ||
    path === "/document-center" ||
    path.endsWith("/document-center.html")
  );
}

function getSiteLegalNoticeMarkup(options = {}) {
  const { gate = false } = options;
  const innerClass = gate
    ? "site-legal-panel-inner site-legal-panel-inner--gate"
    : "site-legal-panel-inner";

  return `
    <div class="${innerClass}">
      <p class="site-legal-panel-meta" id="site-legal-panel-meta">
        <strong>Cookie notice:</strong> theme preference storage only; no ad or analytics cookies.
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
  `;
}

function syncSiteLegalGateOffset() {
  const header = document.querySelector(".site-header");
  const height = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
  document.documentElement.style.setProperty(
    "--site-legal-gate-top",
    `${height}px`,
  );
}

function isPanelCosmeticallyHidden(element) {
  if (!element?.isConnected) {
    return true;
  }

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") {
    return true;
  }

  const rect = element.getBoundingClientRect();
  return rect.width < 2 && rect.height < 2;
}

function scheduleLegalPanelRecovery(notice, { blocking = false, inline = false } = {}) {
  if (!blocking || inline) {
    return;
  }

  window.setTimeout(() => {
    if (!notice.isConnected || !isPanelCosmeticallyHidden(notice)) {
      return;
    }

    const main = document.querySelector("main#main-content, main");
    document.documentElement.classList.remove("site-legal-gate-open");
    document.documentElement.style.removeProperty("--site-legal-gate-top");
    if (main) {
      main.inert = false;
    }
    notice.remove();

    if (document.getElementById("site-legal-inline-gate") || !main) {
      return;
    }

    const inlineGate = document.createElement("section");
    inlineGate.id = "site-legal-inline-gate";
    inlineGate.className = "site-legal-inline-gate";
    inlineGate.setAttribute("role", "region");
    inlineGate.setAttribute("aria-label", "Privacy, terms, and site preferences");
    inlineGate.innerHTML = `<div class="site-legal-inline-gate-card">${getSiteLegalNoticeMarkup({ gate: true })}</div>`;
    main.insertBefore(inlineGate, main.firstChild);

    for (const child of main.children) {
      if (child !== inlineGate) {
        child.inert = true;
      }
    }

    bindSiteLegalNotice(inlineGate, { blocking: true, inline: true });
  }, 50);
}

function mountSiteLegalNotice(notice, { blocking = false } = {}) {
  if (blocking) {
    document.body.appendChild(notice);
    return;
  }

  const main = document.querySelector("main#main-content, main");
  if (main?.parentNode) {
    main.parentNode.insertBefore(notice, main);
    return;
  }

  document.body.insertBefore(notice, document.body.firstChild);
}

function bindSiteLegalNotice(notice, { blocking = false, inline = false } = {}) {
  const checkbox = notice.querySelector("#site-legal-gate-checkbox");
  const acceptButton = notice.querySelector(".site-legal-panel-accept");
  const main = document.querySelector("main#main-content, main");
  let gateResizeHandler = null;

  if (blocking && !inline) {
    document.documentElement.classList.add("site-legal-gate-open");
    syncSiteLegalGateOffset();
    gateResizeHandler = () => syncSiteLegalGateOffset();
    window.addEventListener("resize", gateResizeHandler);
    if (main) {
      main.inert = true;
    }
  }

  checkbox?.addEventListener("change", () => {
    if (acceptButton) {
      acceptButton.disabled = !checkbox.checked;
    }
  });

  acceptButton?.addEventListener("click", () => {
    if (!checkbox?.checked) {
      return;
    }

    const record = {
      termsVersion: SITE_TERMS_VERSION,
      acceptedAt: new Date().toISOString(),
      method: "checkbox-clickwrap",
      termsUrl: "https://www.rsmdiagnosticslab.com/terms-of-service",
      privacyUrl: "https://www.rsmdiagnosticslab.com/privacy-policy",
      privacyAcknowledged: true,
      governingLaw: "Delaware, United States",
    };
    localStorage.setItem(SITE_CONSENT_KEY, JSON.stringify(record));

    if (blocking && !inline) {
      document.documentElement.classList.remove("site-legal-gate-open");
      document.documentElement.style.removeProperty("--site-legal-gate-top");
      if (gateResizeHandler) {
        window.removeEventListener("resize", gateResizeHandler);
      }
      if (main) {
        main.inert = false;
      }
    }

    if (inline && main) {
      for (const child of main.children) {
        child.inert = false;
      }
    }

    notice.remove();
  });

  scheduleLegalPanelRecovery(notice, { blocking, inline });
}

function initBlockingLegalGate() {
  const notice = document.createElement("aside");
  notice.className = "site-legal-panel site-legal-panel--gate";
  notice.setAttribute("role", "region");
  notice.setAttribute("aria-label", "Privacy, terms, and site preferences");
  notice.innerHTML = `
    <div class="site-legal-panel-scrim" aria-hidden="true"></div>
    <div class="site-legal-panel-shell site-legal-panel-card">
      ${getSiteLegalNoticeMarkup({ gate: true })}
    </div>
  `;

  mountSiteLegalNotice(notice, { blocking: true });
  bindSiteLegalNotice(notice, { blocking: true });
}

function initFloatingLegalNotice() {
  let notice = document.getElementById("site-legal-notice");
  if (!notice) {
    notice = document.createElement("aside");
    notice.id = "site-legal-notice";
    notice.className = "site-legal-panel site-legal-panel--float";
    notice.setAttribute("role", "region");
    notice.setAttribute("aria-label", "Privacy, terms, and site preferences");
    notice.innerHTML = getSiteLegalNoticeMarkup();
    mountSiteLegalNotice(notice, { blocking: false });
  }

  bindSiteLegalNotice(notice, { blocking: false });
}

function initSiteLegalGate() {
  const existingNotice = document.getElementById("site-legal-notice");

  if (hasValidSiteConsent()) {
    existingNotice?.remove();
    return;
  }

  if (isBlockingLegalGatePage()) {
    existingNotice?.remove();
    initBlockingLegalGate();
    return;
  }

  initFloatingLegalNotice();
}

initSiteLegalGate();

