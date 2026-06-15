const API_BASE = "http://localhost:8000";
const REPORT_URL = "http://localhost:5173/";

const statusEl = document.getElementById("status");
const statusIndicator = document.getElementById("statusIndicator");
const loader = document.getElementById("loader");
const detectBtn = document.getElementById("detectBtn");
const resultCard = document.getElementById("resultCard");
const explainabilityCard = document.getElementById("explainabilityCard");
const predictionLabel = document.getElementById("predictionLabel");
const confidenceValue = document.getElementById("confidenceValue");
const processingTime = document.getElementById("processingTime");
const riskLevel = document.getElementById("riskLevel");
const textScore = document.getElementById("textScore");
const imageScore = document.getElementById("imageScore");
const metaScore = document.getElementById("metaScore");
const textMeter = document.getElementById("textMeter");
const imageMeter = document.getElementById("imageMeter");
const metaMeter = document.getElementById("metaMeter");
const keywordList = document.getElementById("keywordList");
const sentenceList = document.getElementById("sentenceList");
const reasoningSummary = document.getElementById("reasoningSummary");
const fullReportBtn = document.getElementById("fullReportBtn");
const reanalyzeBtn = document.getElementById("reanalyzeBtn");
const saveBtn = document.getElementById("saveBtn");
const settingsBtn = document.getElementById("settingsBtn");
const feedbackBtn = document.getElementById("feedbackBtn");

let lastResult = null;
let lastPageData = null;

const suspiciousPatterns = [
  "breaking",
  "shocking",
  "secret",
  "unverified",
  "viral",
  "share before deleted",
  "screenshots",
  "no source",
];

const setState = (state, message) => {
  statusIndicator.className = `status-dot ${state}`;
  statusEl.textContent = message;
};

const setLoading = (isLoading) => {
  loader.classList.toggle("hidden", !isLoading);
  detectBtn.disabled = isLoading;
  setState(isLoading ? "loading" : "online", isLoading ? "Scanning article text, images, and metadata..." : "Ready to scan the current webpage.");
};

const setError = (message) => {
  setState("error", `Error: ${message}`);
  resultCard.classList.add("hidden");
  explainabilityCard.classList.add("hidden");
};

const toFixed = (value) => Number(value || 0).toFixed(2);

const getRiskLevel = (label, confidence) => {
  const isFake = String(label || "").toUpperCase().includes("FAKE");
  if (isFake && confidence >= 0.75) return "High";
  if (isFake || confidence < 0.65) return "Moderate";
  return "Low";
};

const extractKeywords = (content, apiKeywords = []) => {
  if (apiKeywords.length > 0) return apiKeywords.slice(0, 6);
  const lower = String(content || "").toLowerCase();
  return suspiciousPatterns.filter((item) => lower.includes(item)).slice(0, 6);
};

const extractSentences = (content, keywords) => {
  const sentences = String(content || "")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const matches = sentences.filter((sentence) =>
    keywords.some((keyword) => sentence.toLowerCase().includes(keyword.toLowerCase())),
  );

  return (matches.length > 0 ? matches : sentences).slice(0, 3);
};

const renderList = (container, rows, className, fallback) => {
  container.textContent = "";
  if (!rows.length) {
    const item = document.createElement(className === "keyword-pill" ? "span" : "li");
    item.className = className;
    item.textContent = fallback;
    container.appendChild(item);
    return;
  }

  rows.forEach((row) => {
    const item = document.createElement(className === "keyword-pill" ? "span" : "li");
    item.className = className;
    item.textContent = row;
    container.appendChild(item);
  });
};

const setResult = (data, pageData, elapsedSeconds) => {
  lastResult = data;
  lastPageData = pageData;
  resultCard.classList.remove("hidden");
  explainabilityCard.classList.remove("hidden");
  setState("online", "Analysis complete.");

  const label = data.label || "UNKNOWN";
  const confidence = Number(data.confidence || 0);
  const risk = getRiskLevel(label, confidence);
  const isReal = String(label).toUpperCase().includes("REAL");

  predictionLabel.textContent = isReal ? "Real" : "Fake";
  predictionLabel.className = `prediction-badge ${isReal ? "real" : "fake"}`;
  confidenceValue.textContent = `${Math.round(confidence * 100)}%`;
  processingTime.textContent = `${elapsedSeconds.toFixed(2)}s`;
  riskLevel.textContent = risk;
  riskLevel.style.color = risk === "High" ? "#E41E3F" : risk === "Moderate" ? "#a66b00" : "#42B72A";

  const text = Number(data.text_weight || 0);
  const image = Number(data.image_weight || 0);
  const meta = Number(data.meta_weight || 0);
  textScore.textContent = toFixed(text);
  imageScore.textContent = toFixed(image);
  metaScore.textContent = toFixed(meta);
  textMeter.value = text;
  imageMeter.value = image;
  metaMeter.value = meta;

  const keywords = extractKeywords(pageData.content, data.suspicious_phrases || []);
  renderList(keywordList, keywords, "keyword-pill", "No obvious keyword trigger");
  renderList(sentenceList, extractSentences(pageData.content, keywords), "", "No highlighted sentence returned");

  const explanations = data.explanations || [];
  reasoningSummary.textContent =
    explanations.length > 0
      ? explanations.slice(0, 2).join(" ")
      : "The model combined text, image, and metadata signals to produce this advisory result.";
};

const fetchPrediction = async (payload) => {
  const response = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || response.statusText);
  }
  return response.json();
};

const extractPageData = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("Unable to locate active tab.");

  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_PAGE_DATA" }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (!response) {
        reject(new Error("No response from content script."));
      } else {
        resolve(response);
      }
    });
  });
};

const onAnalyzeClick = async () => {
  try {
    setLoading(true);
    const startedAt = performance.now();
    const pageData = await extractPageData();

    if (!pageData.title || !pageData.content) {
      throw new Error("Page extraction failed. Try a news article page.");
    }

    const prediction = await fetchPrediction({
      title: pageData.title,
      content: pageData.content,
      image_url: pageData.image_url || null,
      metadata: pageData.metadata || {},
    });

    setResult(prediction, pageData, (performance.now() - startedAt) / 1000);
  } catch (error) {
    setError(error.message || "Unexpected error.");
  } finally {
    setLoading(false);
  }
};

const saveResult = async () => {
  if (!lastResult || !lastPageData) {
    setError("Run a scan before saving.");
    return;
  }

  await chrome.storage.local.set({
    newsguardLastResult: {
      savedAt: new Date().toISOString(),
      page: lastPageData,
      result: lastResult,
    },
  });
  setState("online", "Result saved in the extension.");
};

detectBtn.addEventListener("click", onAnalyzeClick);
reanalyzeBtn.addEventListener("click", onAnalyzeClick);
saveBtn.addEventListener("click", saveResult);
fullReportBtn.addEventListener("click", () => chrome.tabs.create({ url: REPORT_URL }));
settingsBtn.addEventListener("click", () => chrome.tabs.create({ url: REPORT_URL }));
feedbackBtn.addEventListener("click", () => chrome.tabs.create({ url: "mailto:feedback@newsguard.local" }));
