// Select HTML elements
const addFieldButton = document.getElementById("addFieldButton");
const fieldNameInput = document.getElementById("fieldName");
const fieldValueInput = document.getElementById("fieldValue");
const customFieldsContainer = document.getElementById("customFieldsContainer");
const linkedinProfileUrlInput = document.getElementById("linkedinProfileUrl");
const saveProfileUrlButton = document.getElementById("saveProfileUrlButton");
const profileSelect = document.getElementById('profileSelect');
const addProfileButton = document.getElementById('addProfileButton');

// Variables to hold profiles and the active profile
let profiles = []; // Array to hold user profiles
let activeProfile = null; // Variable to hold the currently active profile

// Load stored data on popup load
document.addEventListener("DOMContentLoaded", () => {
    loadProfiles(() => {
        loadLinkedinProfileUrl();
    });
});

// Function to load profiles from chrome.storage.local
function loadProfiles(callback) {
    chrome.storage.local.get(['profiles', 'activeProfileName'], (data) => {
        profiles = data.profiles || [];
        const activeProfileName = data.activeProfileName;
        populateProfileSelect();

        if (activeProfileName) {
            const profile = profiles.find(p => p.name === activeProfileName);
            if (profile) {
                activeProfile = profile;
                profileSelect.value = activeProfile.name;
                updateCustomFieldsUI();
            } else {
                // If the active profile name isn't found, default to the first profile
                if (profiles.length > 0) {
                    activeProfile = profiles[0];
                    profileSelect.value = activeProfile.name;
                    chrome.storage.local.set({ 'activeProfileName': activeProfile.name });
                    updateCustomFieldsUI();
                } else {
                    activeProfile = null;
                    profileSelect.value = '';
                    customFieldsContainer.innerHTML = ''; // Clear fields if no profile is selected
                }
            }
        } else {
            // No activeProfileName stored; default to first profile if exists
            if (profiles.length > 0) {
                activeProfile = profiles[0];
                profileSelect.value = activeProfile.name;
                chrome.storage.local.set({ 'activeProfileName': activeProfile.name });
                updateCustomFieldsUI();
            } else {
                activeProfile = null;
                profileSelect.value = '';
                customFieldsContainer.innerHTML = ''; // Clear fields if no profile is selected
            }
        }

        if (callback) callback();
    });
}

// Function to save profiles to chrome.storage.local
function saveProfiles() {
    chrome.storage.local.set({ 'profiles': profiles }, () => {
        console.log('Profiles saved.');
    });
}

// Function to populate the profile dropdown
function populateProfileSelect() {
    profileSelect.innerHTML = '<option value="">Select a profile</option>'; // Reset options
    profiles.forEach(profile => {
        const option = document.createElement('option');
        option.value = profile.name;
        option.textContent = profile.name;
        profileSelect.appendChild(option);
    });
}

// Function to switch to a specific profile
function switchProfile(profileName) {
    const profile = profiles.find(p => p.name === profileName);
    if (profile) {
        activeProfile = profile;
        // Store the active profile name in chrome.storage.local
        chrome.storage.local.set({ 'activeProfileName': profileName });
        updateCustomFieldsUI(); // Update the UI to show the fields of the selected profile
    } else {
        activeProfile = null;
        chrome.storage.local.remove('activeProfileName');
        customFieldsContainer.innerHTML = ''; // Clear fields if no profile is selected
        console.error("Profile not found");
    }
}

// Function to update the UI based on the active profile
function updateCustomFieldsUI() {
    customFieldsContainer.innerHTML = ''; // Clear existing fields

    if (activeProfile && activeProfile.fields.length > 0) {
        activeProfile.fields.forEach(field => {
            displayProfileField(field.name, field.value);
        });
    }
}

// Function to display a field in the popup for the active profile
function displayProfileField(name, value) {
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "field";
    fieldDiv.innerHTML = `
        <strong>${name}</strong>: <span>${value}</span>
        <button class="editField">Edit</button>
        <button class="deleteField">Delete</button>
    `;
    customFieldsContainer.appendChild(fieldDiv);

    // Add event listeners for edit and delete buttons
    fieldDiv.querySelector(".editField").addEventListener("click", () => editProfileField(name, value));
    fieldDiv.querySelector(".deleteField").addEventListener("click", () => deleteProfileField(name));
}

// Function to add a new profile
addProfileButton.addEventListener('click', () => {
    const profileName = prompt("Enter profile name:");
    if (profileName) {
        if (profiles.some(profile => profile.name === profileName)) {
            alert("Profile name already exists.");
            return;
        }
        const newProfile = { name: profileName, fields: [] };
        profiles.push(newProfile);
        saveProfiles(); // Save profiles to chrome.storage.local
        populateProfileSelect(); // Update the dropdown with the new profile
        profileSelect.value = profileName; // Set the dropdown to the new profile
        switchProfile(profileName); // Automatically switch to the new profile
    }
});

// Function to handle profile selection change
profileSelect.addEventListener('change', (event) => {
    const selectedProfileName = event.target.value;
    if (selectedProfileName) {
        switchProfile(selectedProfileName);
    } else {
        // No profile selected
        activeProfile = null;
        chrome.storage.local.remove('activeProfileName');
        customFieldsContainer.innerHTML = '';
    }
});

// Function to add a custom field to the active profile
addFieldButton.addEventListener("click", () => {
    if (activeProfile) {
        const fieldName = fieldNameInput.value.trim();
        const fieldValue = fieldValueInput.value.trim();
        if (fieldName && fieldValue) {
            // Check if field already exists
            const existingField = activeProfile.fields.find(field => field.name === fieldName);
            if (existingField) {
                existingField.value = fieldValue; // Update existing field
            } else {
                activeProfile.fields.push({ name: fieldName, value: fieldValue }); // Add new field
            }
            saveProfiles(); // Save profiles to chrome.storage.local after adding/updating a field
            updateCustomFieldsUI(); // Update the UI to reflect the new field
            fieldNameInput.value = ''; // Clear input
            fieldValueInput.value = ''; // Clear input
        } else {
            alert("Please enter both field name and value.");
        }
    } else {
        alert("Please select a profile first.");
    }
});

// Function to edit an existing field in the active profile
function editProfileField(name, value) {
    fieldNameInput.value = name;
    fieldValueInput.value = value;

    // Remove the old field before re-adding it
    deleteProfileField(name);
}

// Function to delete a field from the active profile
function deleteProfileField(name) {
    if (activeProfile) {
        activeProfile.fields = activeProfile.fields.filter(field => field.name !== name);
        saveProfiles();
        updateCustomFieldsUI();
    }
}

// Function to load LinkedIn profile URL on popup open
function loadLinkedinProfileUrl() {
    chrome.storage.local.get("linkedinProfileUrl", (data) => {
        linkedinProfileUrlInput.value = data.linkedinProfileUrl || "https://www.linkedin.com/in/";
    });
}

// Automatically save LinkedIn profile URL on input change
linkedinProfileUrlInput.addEventListener("input", () => {
    const profileUrl = linkedinProfileUrlInput.value.trim();
    if (profileUrl.startsWith("https://www.linkedin.com/in/")) {
        chrome.storage.local.set({ linkedinProfileUrl: profileUrl });
    }
});

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

// Reload profiles when updated in storage
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local") {
        if (changes.profiles || changes.activeProfileName) {
            loadProfiles();
        }
    }
});
