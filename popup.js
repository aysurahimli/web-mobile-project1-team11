const profileDropdown = document.getElementById("profileDropdown");
const newProfileButton = document.getElementById("newProfileButton");
const newProfileName = document.getElementById("newProfileName");
const saveProfileButton = document.getElementById("saveProfileButton");
const currentProfileDiv = document.getElementById("currentProfile");

document.addEventListener("DOMContentLoaded", () => {
    loadProfiles();
    displaySavedForms();
    savedFormDropdown();
});

function loadProfiles() {
    chrome.storage.local.get(["profiles", "activeProfile"], (data) => {
        const profiles = data.profiles || {};
        const activeProfile = data.activeProfile || "";
        profileDropdown.innerHTML = "";
        for (const profileName in profiles) {
            const option = document.createElement("option");
            option.value = profileName;
            option.textContent = profileName;
            if (profileName === activeProfile) {
                option.selected = true;
            }
            profileDropdown.appendChild(option);
        }
        currentProfileDiv.textContent = activeProfile ? `Current Profile : ${activeProfile}` : "No profile selected";
    });
}

newProfileButton.addEventListener("click", () => {
    const profileName = newProfileName.value.trim();
    if (profileName) {
        chrome.storage.local.get("profiles", (data) => {
            const profiles = data.profiles || {};
            profiles[profileName] = {}; 
            chrome.storage.local.set({ profiles, activeProfile: profileName }, () => {
                newProfileName.value = "";
            loadProfiles();
            });
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
                chrome.storage.local.set({ profiles }, () => {
                    alert("Profile updated successfully!");
                });
            });
        });
    }
});

profileDropdown.addEventListener("change", () => {
    const selectedProfile = profileDropdown.value;
    if (selectedProfile) { 
    chrome.storage.local.get("profiles", (data) => {
        const profiles = data.profiles || {};
        const customFields = profiles[selectedProfile] || {};
        chrome.storage.local.set({ customFields, activeProfile: selectedProfile }, () => {
            currentProfileDiv.textContent = `Current Profile: ${selectedProfile}`;
        }
    );
});
}
});


document.querySelectorAll(".addMapping").forEach(button => {
    button.addEventListener("click", () => {
        const profileField = document.querySelector(".profileField").value;
        const formField = document.querySelector(".formField").value;
        if (profileField && formField) {
            saveMapping(profileField, formField);
            document.querySelector(".formField").value = "";
        }
    });
});

function saveMapping(profileField, formField) {
    chrome.storage.local.get({ mappings: [] }, (result) => {
        const mappings = result.mappings;
        mappings.push({ profileField, formField });
        chrome.storage.local.set({ mappings }, () => {
            displayMappings();
        });
    });
}

function displayMappings() {
    chrome.storage.local.get({ mappings: [] }, (result) => {
        const mappingList = document.getElementById("mappingList");
        mappingList.innerHTML = "";

        result.mappings.forEach(mapping => {
            const mappingElement = document.createElement("div");
            mappingElement.textContent = `${mapping.profileField} -> ${mapping.formField}`;
            mappingList.appendChild(mappingElement);
        });
    });
};

displayMappings();

document.getElementById("saveForm").addEventListener("click", () => {
    chrome.storage.local.get(["activeProfile", "profiles", "savedForms"], (result) => {
        const profiles = result.profiles || {};
        const activeProfileName = result.activeProfile;
        const savedForms = result.savedForms || [];

        if (activeProfileName || !profiles[activeProfileName]) {
            alert("No active profile found.");
            return;
        }

        const formToSave = {
            profileData: profiles[activeProfileName],
            profileName: activeProfileName,
            dateSaved: new Date().toLocaleString()
        };

        savedForms.push(formToSave);
        chrome.storage.local.set({savedForms}, () => {
            alert("Form data saved successfully!");
            savedFormDropdown();
        });
    });
});

function displaySavedForms() {
    chrome.storage.local.get("savedForms", (result) => {
        const savedForms = result.savedForms || [];
        const savedFormsContainer = document.getElementById("savedForms");

        savedFormsContainer.innerHTML = "";

        if (savedForms.length === 0) {
            savedFormsContainer.textContent = "No forms saved yet.";
            return;
        }

        savedForms.forEach((form, index) => {
            const formElement = document.createElement("div");
            formElement.textContent = `Form #${index + 1} saved on ${form.dateSaved}`;
            savedFormsContainer.appendChild(formElement);
        });
    });
}

function savedFormDropdown () {
    chrome.storage.local.get("savedForms", (result) => {
        const savedForms = result.savedForms || [];
        const savedFormDropdown = document.getElementById("savedFormDropdown");

        savedFormDropdown.innerHTML = "";

        if (savedForms.length === 0) {
            const placeholder = document.createElement("option");
            placeholder.textContent = "No saved forms available";
            placeholder.disabled = true;
            placeholder.selected = true;
            savedFormDropdown.appendChild(placeholder);
            return
        }

        savedForms.forEach((form, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${form.profileName} - Saved on ${form.dateSaved}`;
            savedFormDropdown.appendChild(option);
        });
    });
}


