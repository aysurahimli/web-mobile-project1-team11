chrome.runtime.sendMessage({ message: "wake_up" });

if (window.location.href.startsWith("https://www.linkedin.com/in")) {
    fetchAndSaveLinkedInData()
    chrome.runtime.sendMessage({ action: "closeLinkedInTab" })

}

chrome.runtime.onMessage.addListener((request) => {
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


function fetchAndSaveLinkedInData() {
    // Select the name element and check if it exists
    const nameElement = document.querySelector('h1');

    if (nameElement) {
        const fullName = nameElement.innerText.split(" ");
        const name = fullName[0];
        const surname = fullName.length > 1 ? fullName[1] : "";

        // Retrieve existing custom fields from storage and update with LinkedIn data
        chrome.storage.local.get("customFields", (data) => {
            const customFields = data.customFields || {};
            customFields["name"] = name;
            customFields["surname"] = surname;

            // Save updated customFields back to storage
            chrome.storage.local.set({ customFields }, () => {
                console.log("LinkedIn data saved to storage:", customFields);
            });
        });
    } else {
        console.log("Name element not found on LinkedIn profile page.");
    }
}