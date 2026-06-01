chrome.runtime.onInstalled.addListener(() => {
  console.log("NewsGuard Detector background service worker installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "PING") {
    sendResponse({ status: "alive" });
  }
});
