


const form = document.querySelector("form");
const STORAGE_KEY = "greenCampusComplaints";

if (form) {
    let complaints = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );

    // Existing complaints ko status dena
    complaints = complaints.map(function (item) {
        return {
            ...item,
            id: item.id || (
                Date.now() + Math.random()
            ),
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

    function displayComplaints() {
        section.replaceChildren();

        const heading = document.createElement("h2");
        heading.textContent = "Reported Issues";
        section.appendChild(heading);

        if (complaints.length === 0) {
            const message = document.createElement("p");
            message.textContent = "No complaints reported yet.";
            section.appendChild(message);
            return;
        }

        complaints.forEach(function (item) {
            const card = document.createElement("div");
            card.style.border = "1px solid #ccc";
            card.style.padding = "12px";
            card.style.margin = "10px 0";
            card.style.borderRadius = "8px";

            const title = document.createElement("h3");
            title.textContent = item.type || "Environmental Issue";

            const description = document.createElement("p");
            description.textContent = item.description || "";

            const location = document.createElement("p");
            location.textContent = "Location: " + (item.location || "");

            const date = document.createElement("small");
            date.textContent = "Reported: " + (item.date || "Unknown");

            const statusLabel = document.createElement("label");
            statusLabel.textContent = "Complaint Status: ";

            const statusSelect = document.createElement("select");

            ["Pending", "In Progress", "Resolved"].forEach(
                function (status) {
                    const option = document.createElement("option");
                    option.value = status;
                    option.textContent = status;
                    statusSelect.appendChild(option);
                }
            );

            statusSelect.value = item.status;
            statusSelect.setAttribute(
                "aria-label",
                "Status for " + title.textContent
            );

            statusSelect.addEventListener("change", function () {
                const complaint = complaints.find(
                    function (entry) {
                        return entry.id === item.id;
                    }
                );

                if (!complaint) return;

                const previousStatus = complaint.status;
                complaint.status = statusSelect.value;

                try {
                    saveComplaints();
                    displayComplaints();
                } catch (error) {
                    complaint.status = previousStatus;
                    alert("Status save nahi ho paya. Storage check karo.");
                    displayComplaints();
                }
            });

            statusLabel.appendChild(statusSelect);
            card.append(title, description, location, date, statusLabel);
            section.appendChild(card);
        });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const category = form.querySelector("select");
        const description = form.querySelector("textarea");
        const inputs = form.querySelectorAll(
            'input:not([type="submit"]):not([type="button"]):not([type="hidden"])'
        );

        const locationInput = Array.from(inputs).find(
            function (input) {
                return /location/i.test(
                    (input.name || "") + " " +
                    (input.id || "") + " " +
                    (input.placeholder || "")
                );
            }
        ) || inputs[0];

        if (!category || !description || !locationInput) {
            alert("Form fields identify nahi ho paaye. index.html check karo.");
            return;
        }

        const type = category.value.trim();
        const details = description.value.trim();
        const place = locationInput.value.trim();

        if (!type || !details || !place) {
            alert("Please fill in all complaint fields.");
            return;
        }

        const complaint = {
            id: Date.now() + Math.random(),
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

    saveComplaints();
    displayComplaints();
}
