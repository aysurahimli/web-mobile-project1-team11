// Select HTML elements
const addFieldButton = document.getElementById("addFieldButton");
const fieldNameInput = document.getElementById("fieldName");
const fieldValueInput = document.getElementById("fieldValue");
const customFieldsContainer = document.getElementById("customFieldsContainer");

// Load stored fields on popup load
document.addEventListener("DOMContentLoaded", loadCustomFields);

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

document.getElementById("autoFillButton").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "autoFillForm" });
    });
});
