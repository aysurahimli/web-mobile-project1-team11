chrome.runtime.sendMessage({ message: "wake_up" });

if (window.location.href.startsWith("https://www.linkedin.com/in")) {
    fetchAndSaveLinkedInData()
}

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "autoFillForm") {
        chrome.storage.local.get("customFields", (data) => {
            const customFields = data.customFields || {};

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
            if (customFields["jobTitle"]) {
                const portfolioField = document.querySelector("input[name='jobTitle']") ||
                    document.querySelector("#jobTitle") ||
                    document.querySelector("input[placeholder='jobTitle']");
                if (portfolioField) {
                    portfolioField.value = customFields["jobTitle"];
                }
            }
        });
    }
});


function fetchAndSaveLinkedInData() {
    // Select the name and job title elements and check if they exist
    const nameElement = document.querySelector('h1');
    const jobTitleElement = document.getElementsByTagName("h2")[2];

    if (nameElement) {
        const fullName = nameElement.innerText.split(" ");
        const name = fullName[0];
        const surname = fullName.length > 1 ? fullName[1] : "";
        const jobTitle = jobTitleElement ? jobTitleElement.innerText : ""; // Get job title if it exists

        // Retrieve existing custom fields from storage and update with LinkedIn data
        chrome.storage.local.get("customFields", (data) => {
            const customFields = data.customFields || {};
            customFields["name"] = name;
            customFields["surname"] = surname;
            customFields["jobTitle"] = jobTitle; // Add job title to custom fields

            // Save updated customFields back to storage
            chrome.storage.local.set({ customFields }, () => {
                console.log("LinkedIn data saved to storage:", customFields);
            });
        });
    } else {
        console.log("Name element not found on LinkedIn profile page.");
    }
}