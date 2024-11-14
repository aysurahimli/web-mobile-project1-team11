chrome.runtime.sendMessage({ message: "wake_up" });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "autoFillForm") {
        chrome.storage.local.get("customFields", (data) => {
            const customFields = data.customFields || {};
            console.log(customFields)

            if (customFields["name"]) {
                const portfolioField = document.querySelector("input[name='name']") ||
                    document.querySelector("#name") ||
                    document.querySelector("input[placeholder='name']");
                if (portfolioField) {
                    portfolioField.value = customFields["name"];
                }
            }

            if (customFields["surname"]) {
                const portfolioField = document.querySelector("input[name='surname']") ||
                    document.querySelector("#surname") ||
                    document.querySelector("input[placeholder='surname']");
                if (portfolioField) {
                    portfolioField.value = customFields["surname"];
                }
            }
        });
    }
});
