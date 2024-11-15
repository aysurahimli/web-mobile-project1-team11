document.getElementById("saveProfile").addEventListener("click", () => {
    const profileName = document.getElementById("profileName").value;
    if (profileName) {
        saveProfile(profileName);
        document.getElementById("profileName").value = "";
    }
});

