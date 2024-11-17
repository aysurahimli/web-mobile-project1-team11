const profileDropdown = document.getElementById("profileDropdown");
const newProfileButton = document.getElementById("newProfileButton");
const newProfileName = document.getElementById("newProfileName");
const saveProfileButton = document.getElementById("saveProfileButton");
const currentProfileDiv = document.getElementById("currentProfile");

document.addEventListener("DOMContentLoaded", loadProfiles);

function loadProfiles() {
    chrome.storage.local.get("profiles", (data) => {
        const profiles = data.profiles || {};
        profileSelector.innerHTML = "";
        for (const profile in profiles) {
            const option = document.createElement("option");
            option.value = profile;
            option.textContent = profile;
            profileSelector.appendChild(option);
        }
    });
}