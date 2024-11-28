document.addEventListener("DOMContentLoaded", () => {
    const addJobButton = document.getElementById("addJobButton");
    const addJobModal = document.getElementById("addJobModal");
    const closeModal = document.getElementById("closeModal");
    const addJobForm = document.getElementById("addJobForm");
    const jobList = document.getElementById("jobList");
    const exportDataButton = document.getElementById("exportDataButton");
    const importDataInput = document.getElementById("importDataInput");
    const importDataButton = document.getElementById("importDataButton");

    function loadJobs() {
        chrome.storage.local.get("jobs", (data) => {
            const jobs = data.jobs || [];
            renderJobs(jobs);
        });
    }

    function renderJobs(jobs) {
        jobList.innerHTML = "";
        jobs.forEach((job, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${job.company}</td>
                <td>${job.title}</td>
                <td>${job.date}</td>
                <td>${job.status}</td>
                <td>
                    <button class="deleteJob" data-index="${index}">Delete</button>
                </td>
            `;
            jobList.appendChild(row);
        });

        // Add delete event listeners
        document.querySelectorAll(".deleteJob").forEach((button) => {
            button.addEventListener("click", deleteJob);
        });
    }

    function deleteJob(event) {
        const index = event.target.getAttribute("data-index");
        chrome.storage.local.get("jobs", (data) => {
            const jobs = data.jobs || [];
            jobs.splice(index, 1); // Remove job at index
            chrome.storage.local.set({ jobs }, loadJobs);
        });
    }

    // Open the modal
    addJobButton.addEventListener("click", () => {
        addJobModal.style.display = "block";
    });

    // Close the modal
    closeModal.addEventListener("click", () => {
        addJobModal.style.display = "none";
    });

    // Save a new job
    addJobForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const newJob = {
            company: document.getElementById("companyName").value,
            title: document.getElementById("jobTitle").value,
            date: document.getElementById("dateApplied").value,
            status: document.getElementById("applicationStatus").value,
        };

        chrome.storage.local.get("jobs", (data) => {
            const jobs = data.jobs || [];
            jobs.push(newJob);
            chrome.storage.local.set({ jobs }, () => {
                addJobModal.style.display = "none";
                loadJobs();
            });
        });
    });

    // Export data
    exportDataButton.addEventListener("click", () => {
        chrome.storage.local.get(["jobs", "profiles"], (data) => {
            const exportData = {
                jobs: data.jobs || [],
                profiles: data.profiles || []
            };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "data_export.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });

    // Import data
    importDataButton.addEventListener("click", () => {
        importDataInput.click(); // Trigger file input click
    });

    importDataInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const importedData = JSON.parse(e.target.result);
                chrome.storage.local.set({ jobs: importedData.jobs, profiles: importedData.profiles }, () => {
                    loadJobs(); // Reload jobs after import
                    alert("Data imported successfully!");
                });
            };
            reader.readAsText(file);
        }
    });

    // Listen for messages from content.js
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === "reloadJobs") {
            loadJobs(); // Reload jobs when notified
        }
    });

    loadJobs();
});