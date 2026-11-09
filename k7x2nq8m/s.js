/* Technical authorship: Lucas J. Cooke, Partner Relations Coordinator. Contact: l.jcooke@icloud.com. LinkedIn: https://www.linkedin.com/in/lucas-cooke/ */

function scrollK7FromHash() {
  const id = (window.location.hash || "").replace(/^#/, "");
  if (!id) {
    return;
  }
  const target = document.getElementById(id);
  if (!target) {
    return;
  }
  target.scrollIntoView({ block: "start" });
}

scrollK7FromHash();
window.addEventListener("hashchange", scrollK7FromHash);

function fitResumeDocument() {
  const frame = document.querySelector(".resume-frame");
  const doc = frame && frame.querySelector(".resume-document");
  if (!frame || !doc) {
    return;
  }
  doc.style.transform = "none";
  frame.style.height = "";
  const naturalWidth = doc.offsetWidth;
  const naturalHeight = doc.offsetHeight;
  if (!naturalWidth || !naturalHeight) {
    return;
  }
  const scale = Math.min(1, frame.clientWidth / naturalWidth);
  if (scale >= 0.999) {
    doc.style.transform = "";
    return;
  }
  doc.style.transform = "scale(" + scale + ")";
  frame.style.height = Math.ceil(naturalHeight * scale) + "px";
}

fitResumeDocument();
window.addEventListener("resize", fitResumeDocument);
if (typeof ResizeObserver !== "undefined") {
  const frame = document.querySelector(".resume-frame");
  if (frame) {
    new ResizeObserver(fitResumeDocument).observe(frame);
  }
}

function cleanProfileTitle(title) {
  if (!title) {
    return "";
  }
  return String(title)
    .trim()
    .replace(/\s*[|\-–—]\s*(LinkedIn|Handshake|Temple University|Temple).*$/i, "")
    .replace(/\s+-\s+Temple.*$/i, "")
    .trim();
}

function applyProfileMeta(card, data) {
  if (!card || !data) {
    return;
  }
  const photo = card.querySelector("[data-photo]");
  const nameEl = card.querySelector("[data-name]");
  const headlineEl = card.querySelector("[data-headline]");
  const imageUrl = data.image && (data.image.url || data.image);
  if (
    photo &&
    typeof imageUrl === "string" &&
    !/FOX2019|T\.png|favicon/i.test(imageUrl)
  ) {
    photo.src = imageUrl;
  }
  if (nameEl) {
    const cleaned = cleanProfileTitle(data.title);
    // Skip site titles, vanity slugs, and anything that is not a display name.
    if (
      cleaned &&
      cleaned.length < 80 &&
      /\s/.test(cleaned) &&
      !/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(cleaned) &&
      !/connect and innovate|temple mis/i.test(cleaned)
    ) {
      nameEl.textContent = cleaned;
    }
  }
  if (headlineEl) {
    let desc = data.description ? String(data.description).trim() : "";
    if (desc && !/disclaimer|portfolio are posted/i.test(desc)) {
      // Keep under-name copy short so live skill dumps don't overwhelm the card.
      if (desc.length > 160) {
        const cut = desc.slice(0, 157);
        const lastSpace = cut.lastIndexOf(" ");
        desc = (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[,;:\s]+$/, "") + "…";
      }
      headlineEl.textContent = desc;
      headlineEl.hidden = false;
    } else {
      headlineEl.textContent = "";
      headlineEl.hidden = true;
    }
  }
}

async function fetchMicrolink(url) {
  const endpoint =
    "https://api.microlink.io?" +
    new URLSearchParams({ url: url, metaOnly: "true" }).toString();
  const res = await fetch(endpoint, { credentials: "omit" });
  if (!res.ok) {
    return null;
  }
  const json = await res.json();
  if (!json || json.status !== "success" || !json.data) {
    return null;
  }
  return json.data;
}

async function enrichProfileCard(card) {
  const primary = card.getAttribute("data-source");
  const fallback = card.getAttribute("data-fallback-source");
  let data = null;
  if (primary) {
    try {
      data = await fetchMicrolink(primary);
    } catch (err) {
      data = null;
    }
  }
  if (!data && fallback) {
    try {
      data = await fetchMicrolink(fallback);
    } catch (err) {
      data = null;
    }
  }
  if (data) {
    applyProfileMeta(card, data);
  }
}

document.querySelectorAll(".k7-profile-card[data-source]").forEach(enrichProfileCard);
