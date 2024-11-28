// Select HTML elements
const addFieldButton = document.getElementById("addFieldButton");
const fieldNameInput = document.getElementById("fieldName");
const fieldValueInput = document.getElementById("fieldValue");
const customFieldsContainer = document.getElementById("customFieldsContainer");
const linkedinProfileUrlInput = document.getElementById("linkedinProfileUrl");
const profileSelect = document.getElementById("profileSelect");
const addProfileButton = document.getElementById("addProfileButton");
const deleteProfileButton = document.getElementById("deleteProfileButton");

// Variables to hold profiles and the active profile
let profiles = [];
let activeProfile = null;

document.addEventListener("DOMContentLoaded", () => {
    const openDashboardButton = document.getElementById("openDashboardButton");

    openDashboardButton.addEventListener("click", () => {
        chrome.runtime.openOptionsPage(() => {
            if (chrome.runtime.lastError) {
                console.error("Error opening options page:", chrome.runtime.lastError.message);
            }
        });
    });

    loadProfiles();
});

// Function to load profiles and the active profile from chrome.storage.local
function loadProfiles() {
    chrome.storage.local.get(["profiles", "activeProfileName"], (data) => {
        profiles = data.profiles || [];
        const activeProfileName = data.activeProfileName;

        populateProfileSelect();

        // Set the active profile if available
        activeProfile = profiles.find((p) => p.name === activeProfileName) || profiles[0] || null;

        if (activeProfile) {
            profileSelect.value = activeProfile.name;
            updateCustomFieldsUI();
            updateLinkedInUrlField();
        } else {
            clearUI();
        }
    });
}

// Function to save profiles to chrome.storage.local
function saveProfiles() {
    chrome.storage.local.set({ profiles });
}

// Function to update the profile dropdown
function populateProfileSelect() {
    profileSelect.innerHTML = '<option value="" disabled>Select a profile</option>';
    profiles.forEach((profile) => {
        const option = document.createElement("option");
        option.value = profile.name;
        option.textContent = profile.name;
        profileSelect.appendChild(option);
    });
}

// Function to switch to a specific profile
function switchProfile(profileName) {
    activeProfile = profiles.find((p) => p.name === profileName) || null;

    if (activeProfile) {
        chrome.storage.local.set({ activeProfileName: profileName });
        updateCustomFieldsUI();
        updateLinkedInUrlField();
    } else {
        clearUI();
    }
}

// Function to update the LinkedIn URL input field based on the active profile
function updateLinkedInUrlField() {
    linkedinProfileUrlInput.value = activeProfile?.linkedinUrl || "https://www.linkedin.com/in/";
}

// Function to save LinkedIn profile URL to the active profile
linkedinProfileUrlInput.addEventListener("input", () => {
    if (activeProfile) {
        activeProfile.linkedinUrl = linkedinProfileUrlInput.value.trim();
        saveProfiles();
    } else {
        alert("Please select a profile first.");
    }
});

// Function to update the custom fields UI based on the active profile
function updateCustomFieldsUI() {
    customFieldsContainer.innerHTML = "";

    if (activeProfile?.fields?.length) {
        activeProfile.fields.forEach(({ name, value }) => displayProfileField(name, value));
    }
}

// Function to clear the UI
function clearUI() {
    profileSelect.value = "";
    customFieldsContainer.innerHTML = "";
    linkedinProfileUrlInput.value = "https://www.linkedin.com/in/";
    activeProfile = null;
}

// Function to display a field in the custom fields container
function displayProfileField(name, value) {
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "field";
    fieldDiv.innerHTML = `
        <strong>${name}</strong>: <span>${value}</span>
        <button class="editField">Edit</button>
        <button class="deleteField">Delete</button>
    `;

    fieldDiv.querySelector(".editField").addEventListener("click", () => editProfileField(name, value));
    fieldDiv.querySelector(".deleteField").addEventListener("click", () => deleteProfileField(name));

    customFieldsContainer.appendChild(fieldDiv);
}

// Event listener for adding a new profile
addProfileButton.addEventListener("click", () => {
    const profileName = prompt("Enter profile name:");

    if (profileName && !profiles.some((p) => p.name === profileName)) {
        const newProfile = { name: profileName, fields: [], linkedinUrl: "" };
        profiles.push(newProfile);
        saveProfiles();
        populateProfileSelect();
        switchProfile(profileName);
    } else {
        alert("Profile name already exists or is invalid.");
    }
});

// Event listener for switching profiles
profileSelect.addEventListener("change", (event) => {
    const selectedProfileName = event.target.value;
    switchProfile(selectedProfileName);
});

// Event listener for deleting the active profile
deleteProfileButton.addEventListener("click", () => {
    if (activeProfile) {
        if (confirm(`Are you sure you want to delete the profile "${activeProfile.name}"?`)) {
            profiles = profiles.filter((p) => p.name !== activeProfile.name);
            saveProfiles();
            loadProfiles();
        }
    } else {
        alert("No profile selected to delete.");
    }
});

// Event listener for adding a custom field to the active profile
addFieldButton.addEventListener("click", () => {
    if (activeProfile) {
        const fieldName = fieldNameInput.value.trim();
        const fieldValue = fieldValueInput.value.trim();

        if (fieldName && fieldValue) {
            const existingField = activeProfile.fields.find((f) => f.name === fieldName);

            if (existingField) {
                existingField.value = fieldValue;
            } else {
                activeProfile.fields.push({ name: fieldName, value: fieldValue });
            }

            saveProfiles();
            updateCustomFieldsUI();
            fieldNameInput.value = "";
            fieldValueInput.value = "";
        } else {
            alert("Please enter both field name and value.");
        }
    } else {
        alert("Please select a profile first.");
    }
});

// Function to delete a custom field from the active profile
function deleteProfileField(name) {
    if (activeProfile) {
        activeProfile.fields = activeProfile.fields.filter((field) => field.name !== name);
        saveProfiles();
        updateCustomFieldsUI();
    }
}

// Event listener for fetching LinkedIn data
document.getElementById("getLinkedinData").addEventListener("click", () => {
    const profileUrl = activeProfile?.linkedinUrl?.trim();
    if (profileUrl && profileUrl.startsWith("https://www.linkedin.com/in/")) {
        chrome.runtime.sendMessage({ action: "openLinkedInProfile", url: profileUrl });
    } else {
        alert("Please enter a valid LinkedIn profile URL.");
    }
});

// Listener for storage changes to reload profiles and update the UI dynamically
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && changes.profiles) {
        loadProfiles();
    }
});

document.getElementById("autoFillButton").addEventListener("click", () => {
    console.log("autoFillForm begin")
    chrome.runtime.sendMessage({ action: "autoFillForm" });
})

// Select modal elements
const editFieldModal = document.getElementById("editFieldModal");
const closeModal = document.getElementById("closeModal");
const editFieldNameInput = document.getElementById("editFieldName");
const editFieldValueInput = document.getElementById("editFieldValue");
const saveEditButton = document.getElementById("saveEditButton");

let fieldToEdit = null; // Store the field currently being edited

// Function to open the modal for editing a field
function editProfileField(name, currentValue) {
    if (!activeProfile) {
        alert("Please select a profile first.");
        return;
    }

    fieldToEdit = name; // Store the field name to edit

    // Populate modal inputs with current values
    editFieldNameInput.value = name;
    editFieldValueInput.value = currentValue;

    // Show the modal
    editFieldModal.style.display = "flex";
}

// Save changes and close the modal
saveEditButton.addEventListener("click", () => {
    const newFieldName = editFieldNameInput.value.trim();
    const newFieldValue = editFieldValueInput.value.trim();

    if (newFieldName && newFieldValue) {
        // Find the field in the active profile and update it
        const field = activeProfile.fields.find((field) => field.name === fieldToEdit);

        if (field) {
            field.name = newFieldName;
            field.value = newFieldValue;
        }

        saveProfiles(); // Save the updated profile to storage
        updateCustomFieldsUI(); // Refresh the UI
        closeModal.click(); // Close the modal
    } else {
        alert("Field name and value cannot be empty.");
    }
});

// Close modal on clicking the close button
closeModal.addEventListener("click", () => {
    editFieldModal.style.display = "none";
});

// Close modal when clicking outside the modal content
window.addEventListener("click", (event) => {
    if (event.target === editFieldModal) {
        editFieldModal.style.display = "none";
    }
});