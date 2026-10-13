
const form = document.querySelector("form");
const STORAGE_KEY = "greenCampusComplaints";

if (form) {
    let complaints = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );

    // Create complaint list section
    let section = document.getElementById("complaint-list");

    if (!section) {
        section = document.createElement("section");
        section.id = "complaint-list";
        form.insertAdjacentElement("afterend", section);
    }

    function displayComplaints() {
        section.innerHTML = "<h2>Reported Issues</h2>";

        if (complaints.length === 0) {
            section.innerHTML += "<p>No complaints reported yet.</p>";
            return;
        }

        complaints.forEach(function (item) {
            const card = document.createElement("div");
            const title = document.createElement("h3");
            const description = document.createElement("p");
            const location = document.createElement("p");
            const date = document.createElement("small");

            title.textContent = item.type;
            description.textContent = item.description;
            location.textContent = "Location: " + item.location;
            date.textContent = "Reported: " + item.date;

            card.append(title, description, location, date);
            card.style.border = "1px solid #ccc";
            card.style.padding = "12px";
            card.style.margin = "10px 0";
            card.style.borderRadius = "8px";

            section.appendChild(card);
        });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const category = form.querySelector("select");
        const description = form.querySelector("textarea");
        const inputs = form.querySelectorAll('input:not([type="submit"]):not([type="button"]):not([type="hidden"])');

        const locationInput = Array.from(inputs).find(function (input) {
            return /location/i.test(
                (input.name || "") + " " +
                (input.id || "") + " " +
                (input.placeholder || "")
            );
        }) || inputs[0];

        if (!category || !description || !locationInput) {
            alert("Form fields could not be identified. Please check index.html.");
            return;
        }

        const type = category.value.trim();
        const details = description.value.trim();
        const place = locationInput.value.trim();

        if (!type || !details || !place) {
            alert("Please fill in all complaint fields.");
            return;
        }

        complaints.unshift({
            type: type,
            description: details,
            location: place,
            date: new Date().toLocaleString()
        });

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(complaints)
            );
        } catch (error) {
            complaints.shift();
            alert("Could not save the complaint in this browser.");
            return;
        }

        displayComplaints();
        form.reset();
        alert("Complaint saved successfully!");
    });

    displayComplaints();
}
