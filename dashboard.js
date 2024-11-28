document.addEventListener("DOMContentLoaded", () => {
    const addJobButton = document.getElementById("addJobButton");
    const addJobModal = document.getElementById("addJobModal");
    const closeModal = document.getElementById("closeModal");
    const addJobForm = document.getElementById("addJobForm");
    const jobList = document.getElementById("jobList");

    // Load jobs from storage and render the table
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

    loadJobs();
});