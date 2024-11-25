chrome.runtime.sendMessage({ message: "wake_up" });

if (window.location.href.startsWith("https://www.linkedin.com/in")) {
    fetchAndSaveLinkedInData();
    // chrome.runtime.sendMessage({ action: "closeLinkedInTab" });
}

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "autoFillForm") {
        autoFillForm();
    }
});

function autoFillForm() {
    // Retrieve the profiles and active profile name
    chrome.storage.local.get(['profiles', 'activeProfileName'], (data) => {
        const profiles = data.profiles || [];
        const activeProfileName = data.activeProfileName;
        const activeProfile = profiles.find(p => p.name === activeProfileName);

        if (activeProfile && activeProfile.fields) {
            const customFields = {};
            activeProfile.fields.forEach(field => {
                customFields[field.name] = field.value;
            });

            // Now, use customFields to fill the form
            if (customFields["name"]) {
                const nameField = document.querySelector("input[name='name']") ||
                    document.querySelector("#name") ||
                    document.querySelector("input[placeholder='name']");
                if (nameField) {
                    nameField.value = customFields["name"];
                }
            }

            if (customFields["surname"]) {
                const surnameField = document.querySelector("input[name='surname']") ||
                    document.querySelector("#surname") ||
                    document.querySelector("input[placeholder='surname']");
                if (surnameField) {
                    surnameField.value = customFields["surname"];
                }
            }

            if (customFields["jobTitle"]) {
                const jobTitleField = document.querySelector("input[name='jobTitle']") ||
                    document.querySelector("#jobTitle") ||
                    document.querySelector("input[placeholder='jobTitle']");
                if (jobTitleField) {
                    jobTitleField.value = customFields["jobTitle"];
                }
            }
        } else {
            console.error("Active profile not found or has no fields.");
        }
    });
}

function fetchAndSaveLinkedInData() {
    // Select the name and job title elements and check if they exist
    const nameElement = document.querySelector('h1');
    let jobTitleElement = document.getElementsByTagName("h2")[2];

    if (!jobTitleElement) {
        jobTitleElement = document.querySelector(".text-body-medium");
    }

    if (nameElement && jobTitleElement) {
        const fullName = nameElement.innerText.split(" ");
        const name = fullName[0];
        const surname = fullName.length > 1 ? fullName.slice(1).join(' ') : "";
        const jobTitle = jobTitleElement.innerText.trim();

        // Retrieve profiles and active profile name from storage
        chrome.storage.local.get(['profiles', 'activeProfileName'], (data) => {
            const profiles = data.profiles || [];
            const activeProfileName = data.activeProfileName;
            const activeProfile = profiles.find(p => p.name === activeProfileName);

            if (activeProfile) {
                // Update or add fields in the active profile
                updateFieldInProfile(activeProfile, "name", name);
                updateFieldInProfile(activeProfile, "surname", surname);
                updateFieldInProfile(activeProfile, "jobTitle", jobTitle);

                // Save updated profiles back to storage
                chrome.storage.local.set({ profiles }, () => {
                    console.log("LinkedIn data saved to active profile:", activeProfile);
                });
            } else {
                console.error("Active profile not found.");
            }
        });
    } else {
        console.log("Name or job title element not found on LinkedIn profile page.");
    }
}

// Helper function to update or add a field in the profile
function updateFieldInProfile(profile, fieldName, fieldValue) {
    const existingField = profile.fields.find(field => field.name === fieldName);
    if (existingField) {
        existingField.value = fieldValue;
    } else {
        profile.fields.push({ name: fieldName, value: fieldValue });
    }
}
