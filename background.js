chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openLinkedInProfile" && request.url) {
    chrome.tabs.create({ url: request.url, active: false }, (tab) => {
      linkedInTabId = tab.id;
    });
  }
  if (request.action === "autoFillForm") {
    console.log("Forwarding autofill request to content script.");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "autoFillForm" }, (response) => {
          console.log("Response from content script:", response);
        });
      } else {
        console.error("No active tab found to forward autofill.");
      }
    });
  }

});
