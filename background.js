chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "wake_up") {
      console.log("Service Worker is now active.");
    }
  });
  