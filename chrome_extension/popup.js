const API_BASE = "http://localhost:8000";

const statusEl = document.getElementById("status");
const loader = document.getElementById("loader");
const detectBtn = document.getElementById("detectBtn");
const resultCard = document.getElementById("resultCard");
const predictionLabel = document.getElementById("predictionLabel");
const confidenceBadge = document.getElementById("confidenceBadge");
const textScore = document.getElementById("textScore");
const imageScore = document.getElementById("imageScore");
const metaScore = document.getElementById("metaScore");
const factScore = document.getElementById("factScore");
const explanationsList = document.getElementById("explanations");
const metadataSection = document.getElementById("metadata");

const setLoading = (isLoading) => {
  loader.classList.toggle("hidden", !isLoading);
  detectBtn.disabled = isLoading;
  statusEl.textContent = isLoading ? "Analyzing page, please wait..." : "Ready to analyze the current page.";
};

const setError = (message) => {
  statusEl.textContent = `Error: ${message}`;
  statusEl.style.color = "#ff7a7a";
  resultCard.classList.add("hidden");
};

const setResult = (data, pageData) => {
  resultCard.classList.remove("hidden");
  statusEl.textContent = "Analysis complete.";
  statusEl.style.color = "#90a0c4";

  predictionLabel.textContent = data.label;
  predictionLabel.className = `prediction-label ${data.label === "REAL" ? "prediction-real" : "prediction-fake"}`;
  confidenceBadge.textContent = `Confidence ${Math.round(data.confidence * 100)}%`;

  textScore.textContent = data.text_weight.toFixed(2);
  imageScore.textContent = data.image_weight.toFixed(2);
  metaScore.textContent = data.meta_weight.toFixed(2);
  factScore.textContent = data.fact_check_score.toFixed(2);

  explanationsList.innerHTML = "";
  (data.explanations || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    explanationsList.appendChild(li);
  });

  // Display extracted metadata
  if (metadataSection) {
    metadataSection.innerHTML = `
      <h4>Extracted Data:</h4>
      <table class="metadata-table">
        <tr><td>User:</td><td>${pageData.user_name || "N/A"}</td></tr>
        <tr><td>Timestamp:</td><td>${pageData.timestamp_post || "N/A"}</td></tr>
        <tr><td>Likes:</td><td>${pageData.num_like_post || 0}</td></tr>
        <tr><td>Comments:</td><td>${pageData.num_comment_post || 0}</td></tr>
        <tr><td>Shares:</td><td>${pageData.num_share_post || 0}</td></tr>
        <tr><td>Engagement:</td><td>${(pageData.engagement_score || 0).toFixed(1)}</td></tr>
      </table>
    `;
  }
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
  if (!tab?.id) {
    throw new Error("Unable to locate active tab.");
  }

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
    const pageData = await extractPageData();

    if (!pageData.title || !pageData.content) {
      throw new Error("Page extraction failed. Try a news article page.");
    }

    const payload = {
      title: pageData.title,
      content: pageData.content,
      image_url: pageData.image_url || null,
    };

    const prediction = await fetchPrediction(payload);
    setResult(prediction, pageData);
  } catch (error) {
    setError(error.message || "Unexpected error.");
  } finally {
    setLoading(false);
  }
};

detectBtn.addEventListener("click", onAnalyzeClick);
