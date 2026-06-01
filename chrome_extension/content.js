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
  if (timeElement) {
    const text = timeElement.innerText?.trim();
    const timestamp = parseInt(text);
    if (!isNaN(timestamp)) return timestamp;
  }
  return Math.floor(Date.now() / 1000);
};

const extractLikesCount = () => {
  const likesElement = document.querySelector(".post-likes");
  if (likesElement) {
    const text = likesElement.innerText?.match(/\d+/);
    return text ? parseInt(text[0]) : 0;
  }
  return 0;
};

const extractCommentsCount = () => {
  const commentsElement = document.querySelector(".post-comments");
  if (commentsElement) {
    const text = commentsElement.innerText?.match(/\d+/);
    return text ? parseInt(text[0]) : 0;
  }
  return 0;
};

const extractSharesCount = () => {
  const sharesElement = document.querySelector(".post-shares");
  if (sharesElement) {
    const text = sharesElement.innerText?.match(/\d+/);
    return text ? parseInt(text[0]) : 0;
  }
  return 0;
};

const extractEngagementScore = () => {
  const engagementElement = document.querySelector(".post-engagement");
  if (engagementElement) {
    const text = engagementElement.innerText?.match(/[\d.]+/);
    return text ? parseFloat(text[0]) : 0.0;
  }
  return 0.0;
};

const extractTextLength = () => {
  return extractTextContent().length;
};

const extractImageCount = () => {
  return document.querySelectorAll(".post-image").length || 1;
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "EXTRACT_PAGE_DATA") {
    sendResponse({
      title: extractTitle(),
      content: extractTextContent(),
      image_url: extractImageUrl(),
      url: window.location.href,
      user_name: extractUserName(),
      timestamp_post: extractTimestamp(),
      num_like_post: extractLikesCount(),
      num_comment_post: extractCommentsCount(),
      num_share_post: extractSharesCount(),
      engagement_score: extractEngagementScore(),
      text_length: extractTextLength(),
      image_count: extractImageCount(),
    });
  }
});
