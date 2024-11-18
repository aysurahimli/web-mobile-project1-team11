// Select HTML elements
const addFieldButton = document.getElementById("addFieldButton");
const fieldNameInput = document.getElementById("fieldName");
const fieldValueInput = document.getElementById("fieldValue");
const customFieldsContainer = document.getElementById("customFieldsContainer");
const linkedinProfileUrlInput = document.getElementById("linkedinProfileUrl");
const saveProfileUrlButton = document.getElementById("saveProfileUrlButton");

// Load stored fields and LinkedIn URL on popup load
document.addEventListener("DOMContentLoaded", () => {
    loadCustomFields();
    loadLinkedinProfileUrl();
});

// Function to load custom fields from local storage
function loadCustomFields() {
    chrome.storage.local.get("customFields", (data) => {
        const customFields = data.customFields || {};
        customFieldsContainer.innerHTML = ""; // Clear existing content
        for (const [name, value] of Object.entries(customFields)) {
            displayField(name, value);
        }
    });
}

// Function to display a field in the popup
function displayField(name, value) {
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "field";
    fieldDiv.innerHTML = `
        <strong>${name}</strong>: <span>${value}</span>
        <button class="editField">Edit</button>
        <button class="deleteField">Delete</button>
    `;
    customFieldsContainer.appendChild(fieldDiv);

    // Add event listeners for edit and delete buttons
    fieldDiv.querySelector(".editField").addEventListener("click", () => editField(name, value));
    fieldDiv.querySelector(".deleteField").addEventListener("click", () => deleteField(name));
}

// Add new custom field
addFieldButton.addEventListener("click", () => {
    const name = fieldNameInput.value.trim();
    const value = fieldValueInput.value.trim();
    if (name && value) {
        // Save to local storage
        chrome.storage.local.get("customFields", (data) => {
            const customFields = data.customFields || {};
            customFields[name] = value; // Add or update field
            chrome.storage.local.set({ customFields }, () => {
                displayField(name, value); // Show new field in the popup
                fieldNameInput.value = ""; // Clear input fields
                fieldValueInput.value = "";
            });
        });
    }
});

// Edit an existing field
function editField(name, value) {
    fieldNameInput.value = name;
    fieldValueInput.value = value;

    // Remove the old field before re-adding it
    deleteField(name);
}

// Delete a custom field
function deleteField(name) {
    chrome.storage.local.get("customFields", (data) => {
        const customFields = data.customFields || {};
        delete customFields[name];
        chrome.storage.local.set({ customFields }, loadCustomFields);
    });
}

// Save LinkedIn profile URL
saveProfileUrlButton.addEventListener("click", () => {
    const profileUrl = linkedinProfileUrlInput.value.trim();
    if (profileUrl.startsWith("https://www.linkedin.com/in/")) {
        chrome.storage.local.set({ linkedinProfileUrl: profileUrl }, () => {
            alert("LinkedIn Profile URL saved!");
        });
    } else {
        alert("Please enter a valid LinkedIn profile URL.");
    }
});

// Load LinkedIn profile URL on popup open
function loadLinkedinProfileUrl() {
    chrome.storage.local.get("linkedinProfileUrl", (data) => {
        linkedinProfileUrlInput.value = data.linkedinProfileUrl || "https://www.linkedin.com/in/";
    });
}

// Get data from LinkedIn by opening the profile page
document.getElementById("getLinkedinData").addEventListener("click", () => {
    chrome.storage.local.get("linkedinProfileUrl", (data) => {
        const profileUrl = data.linkedinProfileUrl;
        if (profileUrl) {
            // Send a message to the background script to open the LinkedIn profile page
            chrome.runtime.sendMessage({ action: "openLinkedInProfile", url: profileUrl });
        } else {
            alert("Please save your LinkedIn profile URL first.");
        }
    });
});

// Auto-fill form on the current page
document.getElementById("autoFillButton").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "autoFillForm" });
    });
});

// Reload fields when updated in storage
chrome.runtime.onMessage.addListener((request) => {
    if (request.message === "load_fields") {
        loadCustomFields();
    }
});
