chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request.action)
  if (request.message === "wake_up") {
    console.log("Service Worker is now active.");
  }
  if (request.action === "openLinkedInProfile" && request.url) {
    chrome.tabs.create({ url: request.url });
  }
});
