const profileDropdown = document.getElementById("profileDropdown");
const newProfileButton = document.getElementById("newProfileButton");
const newProfileName = document.getElementById("newProfileName");
const saveProfileButton = document.getElementById("saveProfileButton");
const currentProfileDiv = document.getElementById("currentProfile");

document.addEventListener("DOMContentLoaded", loadProfiles);

function loadProfiles() {
    chrome.storage.local.get("profiles", (data) => {
        const profiles = data.profiles || {};
        profileDropdown.innerHTML = "";
        for (const profile in profiles) {
            const option = document.createElement("option");
            option.value = profile;
            option.textContent = profile;
            profileDropdown.appendChild(option);
        }
    });
}

newProfileButton.addEventListener("click", () => {
    const profileName = newProfileName.value.trim();
    if (profileName) {
        chrome.storage.local.get("profiles", (data) => {
            const profiles = data.profiles || {};
            profiles[profileName] = {}; 
            chrome.storage.local.set({ profiles }, loadProfiles);
        });
    }
});

saveProfileButton.addEventListener("click", () => {
    const selectedProfile = profileDropdown.value;
    if (selectedProfile) {
        chrome.storage.local.get("customFields", (data) => {
            const customFields = data.customFields || {};
            chrome.storage.local.get("profiles", (profileData) => {
                const profiles = profileData.profiles || {};
                profiles[selectedProfile] = customFields;
                chrome.storage.local.set({ profiles });
            });
        });
    }
});

profileDropdown.addEventListener("change", () => {
    const selectedProfile = profileDropdown.value;
    chrome.storage.local.get("profiles", (data) => {
        const profiles = data.profiles || {};
        const customFields = profiles[selectedProfile] || {};
        chrome.storage.local.set({ customFields });
        currentProfileDiv.textContent = `Current Profile: ${selectedProfile}`;
    });
});
