
const form = document.querySelector("form");
const STORAGE_KEY = "greenCampusComplaints";

if (form) {
    let complaints = [];

    try {
        complaints = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(complaints)) {
            complaints = [];
        }
    } catch (error) {
        complaints = [];
    }

    // Existing complaints ko IDs aur default status dena
    complaints = complaints.map(function (item) {
        if (!item.complaintId) {
            item.complaintId =
                "GC-" + String(item.id || (Date.now() + Math.random()))
                    .replace(".", "");
        }

        return {
            ...item,
            id: item.id || (Date.now() + Math.random()),
            status: item.status || "Pending"
        };
    });

    let section = document.getElementById("complaint-list");

    if (!section) {
        section = document.createElement("section");
        section.id = "complaint-list";
        form.insertAdjacentElement("afterend", section);
    }

    function saveComplaints() {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(complaints)
        );
    }

    // Complaint list display
    function displayComplaints() {
        section.replaceChildren();

        const heading = document.createElement("h2");
        heading.textContent = "Reported Issues";
        section.appendChild(heading);

        // Search box
        const search = document.createElement("input");
        search.type = "search";
        search.placeholder = "Search by ID, issue or location...";
        search.style.cssText =
            "width:100%;padding:10px;box-sizing:border-box;margin-bottom:10px;";

        // Status filter
        const filter = document.createElement("select");
        filter.style.cssText =
            "width:100%;padding:10px;margin-bottom:15px;";

        [
            "All Statuses",
            "Pending",
            "In Progress",
            "Resolved"
        ].forEach(function (status) {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            filter.appendChild(option);
        });

        section.append(search, filter);

        const list = document.createElement("div");
        section.appendChild(list);

        function renderFilteredComplaints() {
            list.replaceChildren();

            const query = search.value.toLowerCase().trim();
            const selectedStatus = filter.value;

            const filtered = complaints.filter(function (item) {
                const searchableText = [
                    item.complaintId,
                    item.type,
                    item.description,
                    item.location,
                    item.date
                ].join(" ").toLowerCase();

                const matchesSearch = searchableText.includes(query);
                const matchesStatus =
                    selectedStatus === "All Statuses" ||
                    item.status === selectedStatus;

                return matchesSearch && matchesStatus;
            });

            if (filtered.length === 0) {
                const message = document.createElement("p");
                message.textContent = complaints.length === 0
                    ? "No complaints reported yet."
                    : "No matching complaints found.";

                list.appendChild(message);
                return;
            }

            filtered.forEach(function (item) {
                const card = document.createElement("div");

                card.style.cssText =
                    "border:1px solid #ccc;padding:12px;margin:10px 0;border-radius:8px;";

                const idLine = document.createElement("p");
                const idStrong = document.createElement("strong");
                idStrong.textContent = "Complaint ID: ";
                idLine.append(idStrong, item.complaintId);

                const title = document.createElement("h3");
                title.textContent = item.type || "Environmental Issue";

                const description = document.createElement("p");
                description.textContent = item.description || "";

                const location = document.createElement("p");
                location.textContent =
                    "Location: " + (item.location || "");

                const date = document.createElement("small");
                date.textContent =
                    "Reported: " + (item.date || "Unknown");

                const statusLabel = document.createElement("label");
                statusLabel.textContent = "Complaint Status: ";

                const statusSelect = document.createElement("select");

                [
                    "Pending",
                    "In Progress",
                    "Resolved"
                ].forEach(function (status) {
                    const option = document.createElement("option");
                    option.value = status;
                    option.textContent = status;
                    statusSelect.appendChild(option);
                });

                statusSelect.value = item.status;
                statusSelect.setAttribute(
                    "aria-label",
                    "Status for " + title.textContent
                );

                statusSelect.addEventListener("change", function () {
                    const previousStatus = item.status;
                    item.status = statusSelect.value;

                    try {
                        saveComplaints();
                        renderFilteredComplaints();
                    } catch (error) {
                        item.status = previousStatus;
                        alert("Status save nahi ho paya. Storage check karo.");
                        renderFilteredComplaints();
                    }
                });

                statusLabel.appendChild(statusSelect);

                // Delete complaint button
                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.textContent = "Delete Complaint";

                deleteButton.style.cssText =
                    "display:block;margin-top:12px;padding:9px 12px;background:#dc3545;color:white;border:none;border-radius:5px;cursor:pointer;";

                deleteButton.addEventListener("click", function () {
                    const confirmed = confirm(
                        "Delete complaint " +
                        item.complaintId +
                        " permanently?"
                    );

                    if (!confirmed) return;

                    const index = complaints.findIndex(function (entry) {
                        return entry.id === item.id;
                    });

                    if (index === -1) return;

                    const deletedComplaint = complaints.splice(index, 1)[0];

                    try {
                        saveComplaints();
                        displayComplaints();
                    } catch (error) {
                        complaints.splice(index, 0, deletedComplaint);
                        alert("Delete failed. Browser storage check karo.");
                        displayComplaints();
                    }
                });

                card.append(
                    idLine,
                    title,
                    description,
                    location,
                    date,
                    statusLabel,
                    deleteButton
                );

                list.appendChild(card);
            });
        }

        search.addEventListener("input", renderFilteredComplaints);
        filter.addEventListener("change", renderFilteredComplaints);

        renderFilteredComplaints();
    }

    // Submit new complaint
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const category = form.querySelector("select");
        const description = form.querySelector("textarea");

        const inputs = form.querySelectorAll(
            'input:not([type="submit"]):not([type="button"]):not([type="hidden"])'
        );

        const locationInput = Array.from(inputs).find(function (input) {
            return /location/i.test(
                (input.name || "") + " " +
                (input.id || "") + " " +
                (input.placeholder || "")
            );
        }) || inputs[0];

        if (!category || !description || !locationInput) {
            alert("Form fields nahi mile. index.html check karo.");
            return;
        }

        const type = category.value.trim();
        const details = description.value.trim();
        const place = locationInput.value.trim();

        if (!type || !details || !place) {
            alert("Please fill in all complaint fields.");
            return;
        }

        const id = Date.now() + Math.random();

        const complaint = {
            id: id,
            complaintId: "GC-" + String(id).replace(".", ""),
            type: type,
            description: details,
            location: place,
            date: new Date().toLocaleString(),
            status: "Pending"
        };

        complaints.unshift(complaint);

        try {
            saveComplaints();
        } catch (error) {
            complaints.shift();
            alert("Complaint save nahi hui. Browser storage check karo.");
            return;
        }

        displayComplaints();
        form.reset();
        alert("Complaint saved successfully!");
    });

    // Save migrated complaints
    try {
        saveComplaints();
    } catch (error) {
        console.error("Could not save complaints:", error);
    }

    displayComplaints();
}
