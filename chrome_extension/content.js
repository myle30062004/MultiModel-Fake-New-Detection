const API_BASE = "http://localhost:8000";
const POST_SELECTOR = "[data-newsguard-post='true']";
const ACTION_CLASS = "newsguard-check-button";
const PANEL_CLASS = "newsguard-result-panel";
const processedPosts = new WeakSet();
let activePanel = null;
let activeAnchorPost = null;

const injectStyles = () => {
  if (document.getElementById("newsguard-content-style")) return;

  const style = document.createElement("style");
  style.id = "newsguard-content-style";
  style.textContent = `
    .${ACTION_CLASS} {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 26px;
      border: 1px solid rgba(24, 119, 242, 0.22);
      border-radius: 999px;
      background: rgba(24, 119, 242, 0.1);
      color: #1877f2;
      cursor: pointer;
      font: 800 12px/1.2 Inter, Roboto, Arial, sans-serif;
      padding: 4px 10px;
      transition: background 0.18s ease, transform 0.18s ease, opacity 0.18s ease;
    }

    .${ACTION_CLASS}:hover {
      background: rgba(24, 119, 242, 0.18);
      transform: translateY(-1px);
    }

    .${ACTION_CLASS}:disabled {
      cursor: progress;
      opacity: 0.7;
      transform: none;
    }

    .${ACTION_CLASS}::before {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: currentColor;
      content: "";
    }

    .${PANEL_CLASS} {
      position: fixed;
      top: 72px;
      right: 18px;
      z-index: 2147483647;
      width: min(360px, calc(100vw - 24px));
      max-height: min(620px, calc(100vh - 24px));
      border: 1px solid rgba(24, 119, 242, 0.2);
      border-radius: 8px;
      background: #f7f9ff;
      box-shadow: 0 16px 42px rgba(0, 0, 0, 0.22);
      color: #1c1e21;
      font: 500 13px/1.45 Inter, Roboto, Arial, sans-serif;
      opacity: 0;
      overflow: hidden;
      transform: translateY(8px) scale(0.98);
      transform-origin: top right;
      transition: opacity 0.18s ease, transform 0.18s ease;
    }

    .${PANEL_CLASS}.is-open {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .${PANEL_CLASS}.is-fake {
      border-color: rgba(228, 30, 63, 0.25);
      background: #fff5f7;
    }

    .${PANEL_CLASS}.is-real {
      border-color: rgba(66, 183, 42, 0.28);
      background: #f4fff1;
    }

    .${PANEL_CLASS} .ng-panel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      padding: 10px 12px;
    }

    .${PANEL_CLASS} .ng-head-main {
      display: flex;
      min-width: 0;
      align-items: center;
      gap: 8px;
    }

    .${PANEL_CLASS} .ng-title {
      font-weight: 900;
    }

    .${PANEL_CLASS} .ng-badge {
      border-radius: 999px;
      color: #fff;
      font-size: 12px;
      font-weight: 900;
      padding: 5px 9px;
      white-space: nowrap;
    }

    .${PANEL_CLASS} .ng-close {
      display: inline-grid;
      width: 28px;
      height: 28px;
      place-items: center;
      border: 0;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.06);
      color: inherit;
      cursor: pointer;
      font: 900 18px/1 Arial, sans-serif;
    }

    .${PANEL_CLASS} .ng-close:hover {
      background: rgba(0, 0, 0, 0.12);
    }

    .${PANEL_CLASS}.is-fake .ng-badge {
      background: #e41e3f;
    }

    .${PANEL_CLASS}.is-real .ng-badge {
      background: #42b72a;
    }

    .${PANEL_CLASS} .ng-body {
      display: grid;
      gap: 10px;
      padding: 10px 12px 12px;
    }

    .${PANEL_CLASS} .ng-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .${PANEL_CLASS} .ng-metric,
    .${PANEL_CLASS} .ng-meta {
      border-radius: 7px;
      background: rgba(255, 255, 255, 0.75);
      padding: 8px;
    }

    .${PANEL_CLASS} .ng-label {
      display: block;
      color: #65676b;
      font-size: 11px;
      font-weight: 800;
      margin-bottom: 2px;
    }

    .${PANEL_CLASS} .ng-value {
      color: #050505;
      font-size: 13px;
      font-weight: 900;
    }

    .${PANEL_CLASS} .ng-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }

    .${PANEL_CLASS} .ng-note {
      color: #65676b;
      font-size: 12px;
      margin: 0;
    }

    .${PANEL_CLASS} .ng-loading {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #65676b;
      font-weight: 800;
      padding: 12px;
    }

    .${PANEL_CLASS} .ng-spinner {
      width: 18px;
      height: 18px;
      border: 3px solid rgba(24, 119, 242, 0.18);
      border-top-color: #1877f2;
      border-radius: 999px;
      animation: ng-spin 0.8s linear infinite;
    }

    @keyframes ng-spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (prefers-color-scheme: dark) {
      .${PANEL_CLASS} {
        background: #202938;
        color: #f0f2f5;
      }

      .${PANEL_CLASS}.is-fake {
        background: #331b24;
      }

      .${PANEL_CLASS}.is-real {
        background: #1f3321;
      }

      .${PANEL_CLASS} .ng-metric,
      .${PANEL_CLASS} .ng-meta {
        background: rgba(255, 255, 255, 0.08);
      }

      .${PANEL_CLASS} .ng-value,
      .${PANEL_CLASS} .ng-title {
        color: #f0f2f5;
      }

      .${PANEL_CLASS} .ng-label,
      .${PANEL_CLASS} .ng-note,
      .${PANEL_CLASS} .ng-loading {
        color: #b0b3b8;
      }

      .${PANEL_CLASS} .ng-close {
        background: rgba(255, 255, 255, 0.08);
      }
    }
  `;
  document.head.appendChild(style);
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const positionFloatingPanel = (panel, postElement) => {
  if (!panel || !postElement) return;

  const margin = 12;
  const rect = postElement.getBoundingClientRect();
  const panelWidth = Math.min(360, window.innerWidth - margin * 2);
  const panelHeight = panel.offsetHeight || 360;
  const availableRight = window.innerWidth - rect.right;
  const availableLeft = rect.left;

  let left;
  if (availableRight >= panelWidth + margin) {
    left = rect.right + margin;
  } else if (availableLeft >= panelWidth + margin) {
    left = rect.left - panelWidth - margin;
  } else {
    left = window.innerWidth - panelWidth - margin;
  }

  const top = clamp(rect.top + 8, margin, Math.max(margin, window.innerHeight - panelHeight - margin));
  panel.style.left = `${clamp(left, margin, window.innerWidth - panelWidth - margin)}px`;
  panel.style.top = `${top}px`;
};

const closeFloatingPanel = () => {
  if (activePanel) {
    activePanel.remove();
  }
  activePanel = null;
  activeAnchorPost = null;
};

const getFloatingPanel = (postElement) => {
  if (!activePanel) {
    activePanel = document.createElement("section");
    activePanel.className = PANEL_CLASS;
    document.body.appendChild(activePanel);
  }

  activeAnchorPost = postElement;
  activePanel.dataset.anchorPostId = postElement.dataset.postId || "";
  positionFloatingPanel(activePanel, postElement);
  window.requestAnimationFrame(() => activePanel?.classList.add("is-open"));
  return activePanel;
};

const renderPanelHeader = (title, badgeHtml = "") => `
  <div class="ng-panel-head">
    <div class="ng-head-main">
      <span class="ng-title">${escapeHtml(title)}</span>
      ${badgeHtml}
    </div>
    <button class="ng-close" type="button" aria-label="Close NewsGuard result">x</button>
  </div>
`;

const bindPanelClose = (panel) => {
  panel.querySelector(".ng-close")?.addEventListener("click", closeFloatingPanel);
};

const numberFromDataset = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const normalizeModelLabel = (value) => {
  const label = String(value || "").trim().toUpperCase();
  if (label.includes("FAKE")) return "FAKE";
  if (label.includes("REAL")) return "REAL";
  return "UNKNOWN";
};

const formatPercent = (value) => `${Math.round(Number(value || 0) * 100)}%`;

const formatSignal = (value) => {
  const number = Number(value || 0);
  if (number > 0 && number < 0.01) return "<0.01";
  return number.toFixed(2);
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const collectPostData = (postElement) => {
  const content =
    postElement.dataset.postContent ||
    postElement.querySelector(".post-message")?.innerText?.trim() ||
    "";

  const metadata = {
    post_id: postElement.dataset.postId || "",
    user_name:
      postElement.dataset.postUser ||
      postElement.querySelector(".post-user")?.innerText?.trim() ||
      "Unknown User",
    timestamp_post: numberFromDataset(postElement.dataset.postTimestamp),
    num_like_post: numberFromDataset(postElement.dataset.postLikes),
    num_comment_post: numberFromDataset(postElement.dataset.postComments),
    num_share_post: numberFromDataset(postElement.dataset.postShares),
    engagement_score: numberFromDataset(postElement.dataset.postEngagement),
    text_length: numberFromDataset(postElement.dataset.postTextLength) || content.length,
    image_count: numberFromDataset(postElement.dataset.postImageCount),
  };

  return {
    title: `Post by ${metadata.user_name}`,
    content,
    image_url:
      postElement.dataset.postImage ||
      postElement.querySelector(".post-image")?.src ||
      null,
    metadata,
  };
};

const metric = (label, value) => `
  <div class="ng-metric">
    <span class="ng-label">${escapeHtml(label)}</span>
    <span class="ng-value">${escapeHtml(value)}</span>
  </div>
`;

const meta = (label, value) => `
  <div class="ng-meta">
    <span class="ng-label">${escapeHtml(label)}</span>
    <span class="ng-value">${escapeHtml(value)}</span>
  </div>
`;

const renderResultPanel = (postElement, result, payload, elapsedSeconds) => {
  const label = normalizeModelLabel(result.label);
  const panel = getFloatingPanel(postElement);
  const metadata = result.post_metadata || payload.metadata;
  const hasImage =
    typeof result.has_image === "boolean"
      ? result.has_image
      : Number(metadata.image_count || 0) > 0 || Boolean(payload.image_url);

  panel.className = `${PANEL_CLASS} is-open ${label === "FAKE" ? "is-fake" : "is-real"}`;
  panel.innerHTML = `
    ${renderPanelHeader(
      "NewsGuard model result",
      `<span class="ng-badge">${escapeHtml(label)} - ${escapeHtml(formatPercent(result.confidence))}</span>`,
    )}
    <div class="ng-body">
      <div class="ng-grid">
        ${metric("Text signal", formatSignal(result.text_weight))}
        ${metric("Image signal", hasImage ? formatSignal(result.image_weight) : "No image")}
        ${metric("Metadata signal", formatSignal(result.meta_weight))}
      </div>
      <div class="ng-meta-grid">
        ${meta("User", metadata.user_name || "Unknown")}
        ${meta("Text length", metadata.text_length || payload.content.length)}
        ${meta("Likes", metadata.num_like_post || 0)}
        ${meta("Comments", metadata.num_comment_post || 0)}
        ${meta("Shares", metadata.num_share_post || 0)}
        ${meta("Engagement score", Number(metadata.engagement_score || 0).toFixed(0))}
        ${meta("Images", metadata.image_count || 0)}
        ${meta("Image status", result.image_status || (hasImage ? "loaded" : "missing"))}
        ${meta("Processing", `${elapsedSeconds.toFixed(2)}s`)}
      </div>
      <p class="ng-note">${escapeHtml((result.explanations || ["Model returned no explanation."]).slice(0, 2).join(" "))}</p>
    </div>
  `;
  bindPanelClose(panel);
  positionFloatingPanel(panel, postElement);
};

const renderErrorPanel = (postElement, message) => {
  const panel = getFloatingPanel(postElement);
  panel.className = `${PANEL_CLASS} is-open is-fake`;
  panel.innerHTML = `
    ${renderPanelHeader("NewsGuard model result", '<span class="ng-badge">ERROR</span>')}
    <div class="ng-body">
      <p class="ng-note">${escapeHtml(message)}</p>
    </div>
  `;
  bindPanelClose(panel);
  positionFloatingPanel(panel, postElement);
};

const renderLoadingPanel = (postElement) => {
  const panel = getFloatingPanel(postElement);
  panel.className = `${PANEL_CLASS} is-open`;
  panel.innerHTML = `
    ${renderPanelHeader("NewsGuard model result")}
    <div class="ng-loading">
      <span class="ng-spinner" aria-hidden="true"></span>
      <span>Sending this post to the model...</span>
    </div>
  `;
  bindPanelClose(panel);
  positionFloatingPanel(panel, postElement);
};

const runPredictionForPost = async (postElement, button) => {
  const payload = collectPostData(postElement);

  if (!payload.content) {
    renderErrorPanel(postElement, "Cannot analyze this post because no text content was found.");
    return;
  }

  const startedAt = performance.now();
  button.disabled = true;
  button.textContent = "Checking...";
  renderLoadingPanel(postElement);

  try {
    const response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail || response.statusText);
    }

    const result = await response.json();
    renderResultPanel(postElement, result, payload, (performance.now() - startedAt) / 1000);
    button.textContent = "Recheck";
  } catch (error) {
    renderErrorPanel(postElement, error.message || "Prediction request failed.");
    button.textContent = "Retry";
  } finally {
    button.disabled = false;
  }
};

const createActionButton = (postElement) => {
  const slot = postElement.querySelector(".newsguard-extension-slot");
  const target = slot || postElement.querySelector(".post-user")?.parentElement || postElement;
  const button = document.createElement("button");
  button.type = "button";
  button.className = ACTION_CLASS;
  button.textContent = "Check";
  button.title = "Send this post to NewsGuard model";
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    runPredictionForPost(postElement, button);
  });
  target.appendChild(button);
};

const decoratePost = (postElement) => {
  if (processedPosts.has(postElement)) return;
  processedPosts.add(postElement);
  createActionButton(postElement);
};

const scanFeedPosts = () => {
  injectStyles();
  document.documentElement.dataset.newsguardExtensionActive = "true";
  document.querySelectorAll(POST_SELECTOR).forEach(decoratePost);
};

const repositionActivePanel = () => {
  if (activePanel && activeAnchorPost?.isConnected) {
    positionFloatingPanel(activePanel, activeAnchorPost);
  }
};

const extractTextContent = () => {
  const article = document.querySelector("article") || document.querySelector("main") || document.body;
  const paragraphs = Array.from(article.querySelectorAll("p:not([hidden])"));
  const text = paragraphs.map((p) => p.innerText.trim()).filter(Boolean).join("\n\n");
  return text.length > 100 ? text : document.body.innerText.trim();
};

const extractTitle = () => {
  const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
  if (ogTitle) return ogTitle;
  const titleTag = document.title;
  if (titleTag) return titleTag;
  const h1 = document.querySelector("h1")?.innerText;
  return h1 || "";
};

const extractImageUrl = () => {
  const ogImage = document.querySelector('meta[property="og:image"]')?.content;
  if (ogImage) return ogImage;
  const image = document.querySelector("article img, main img, img[src*='news']") || document.querySelector("img");
  return image?.src || "";
};

const extractUserName = () => {
  const userElement = document.querySelector(".post-user");
  return userElement?.innerText?.trim() || "Unknown User";
};

const extractTimestamp = () => {
  const timeElement = document.querySelector(".post-time");
  const rawTimestamp = timeElement?.dataset?.rawTimestamp;
  if (rawTimestamp) return Number(rawTimestamp) || Math.floor(Date.now() / 1000);
  return Math.floor(Date.now() / 1000);
};

const extractCount = (selector) => {
  const element = document.querySelector(selector);
  const text = element?.innerText?.match(/\d+/);
  return text ? Number(text[0]) : 0;
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "EXTRACT_PAGE_DATA") {
    const content = extractTextContent();
    sendResponse({
      title: extractTitle(),
      content,
      image_url: extractImageUrl(),
      url: window.location.href,
      metadata: {
        user_name: extractUserName(),
        timestamp_post: extractTimestamp(),
        num_like_post: extractCount(".post-likes"),
        num_comment_post: extractCount(".post-comments"),
        num_share_post: extractCount(".post-shares"),
        engagement_score: 0,
        text_length: content.length,
        image_count: document.querySelectorAll(".post-image").length,
      },
    });
  }
});

scanFeedPosts();
window.addEventListener("load", scanFeedPosts);
window.addEventListener("scroll", repositionActivePanel, { passive: true });
window.addEventListener("resize", repositionActivePanel);
document.addEventListener("visibilitychange", scanFeedPosts);

const observer = new MutationObserver(() => {
  window.requestAnimationFrame(scanFeedPosts);
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

let retryCount = 0;
const retryTimer = window.setInterval(() => {
  scanFeedPosts();
  retryCount += 1;
  if (retryCount >= 30) window.clearInterval(retryTimer);
}, 1000);
