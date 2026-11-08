
async function submitComplaint() {

    const name =
        document.getElementById("name").value.trim();

    const location =
        document.getElementById("location").value.trim();

    const description =
        document.getElementById("description").value.trim();

    const imageInput =
        document.getElementById("image");

    const imageFile =
        imageInput.files[0];

    if (
        name === "" ||
        location === "" ||
        description === ""
    ) {
        alert("Please fill all fields");
        return;
    }

    if (!imageFile) {
        alert("Please select an image");
        return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("location", location);
    formData.append("description", description);
    formData.append("image", imageFile);

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/complaints",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Complaint submission failed"
            );
        }

        alert(
            "Complaint Submitted Successfully!\nComplaint ID: "
            + data.complaint.id
        );

        window.location.href = "admin.html";

    } catch (error) {

        console.error(error);

        alert(error.message || "Could not connect to backend");
    }
}

async function trackComplaint() {

    const id =
        document.getElementById(
            "complaintId"
        ).value;

    const result =
        document.getElementById(
            "result"
        );

    try {

        const response = await fetch(
            `http://127.0.0.1:5000/api/complaints/${id}`
        );

        const complaint =
            await response.json();

        if(response.ok){

            result.innerHTML = `

            <h3>Complaint Found</h3>

            <p><strong>ID:</strong>
            ${complaint.id}</p>

            <p><strong>Name:</strong>
            ${complaint.name}</p>

            <p><strong>Location:</strong>
            ${complaint.location}</p>

            <p><strong>Priority:</strong>
            ${complaint.priority}</p>

            <p><strong>Status:</strong>
            ${complaint.status}</p>

            `;
        }

        else{

            result.innerHTML =
            "<h3>Complaint Not Found</h3>";

        }

    }

    catch(error){

        result.innerHTML =
        "<h3>Error Connecting To Server</h3>";

    }
}

async function loadComplaints() {

    const response = await fetch(
        "http://127.0.0.1:5000/api/complaints"
    );

    const complaints = await response.json();

    const totalComplaints =
        document.getElementById(
            "totalComplaints"
        );

    const pendingComplaints =
        document.getElementById(
            "pendingComplaints"
        );

    const resolvedComplaints =
        document.getElementById(
            "resolvedComplaints"
        );

    if(totalComplaints){

        totalComplaints.innerText =
            complaints.length;

        pendingComplaints.innerText =
            complaints.filter(
                c => c.status === "Pending"
            ).length;

        resolvedComplaints.innerText =
            complaints.filter(
                c => c.status === "Resolved"
            ).length;
    }

    const table =
        document.getElementById(
            "complaintTable"
        );

    if(!table) return;

    table.innerHTML = "";

    complaints.forEach(
        complaint => {

            table.innerHTML += `

            <tr>

            <td>${complaint.id}</td>

            <td>${complaint.name}</td>

            <td>${complaint.location}</td>

            <!-- NEW IMAGE COLUMN -->
            <td>
            ${
            complaint.image_url
            ?
            `<img
            src="http://127.0.0.1:5000${complaint.image_url}"
            alt="Complaint Image"
            width="100"
            height="80"
            style="object-fit: cover; border-radius: 8px;"
            >`
            :
            "No Image"
            }
            </td>
            <!-- END NEW IMAGE COLUMN -->

            <td>${complaint.priority}</td>

            <td>${complaint.status}</td>

            <td>

            <select
            onchange="updateStatus(
            ${complaint.id},
            this.value
            )">

            <option
            ${complaint.status ===
            "Pending" ?
            "selected" : ""}>

            Pending

            </option>

            <option
            ${complaint.status ===
            "In Progress" ?
            "selected" : ""}>

            In Progress

            </option>

            <option
            ${complaint.status ===
            "Resolved" ?
            "selected" : ""}>

            Resolved

            </option>

            </select>

            </td>

            </tr>

            `;
        }
    );
}

async function updateStatus(id, status) {

    try {

        await fetch(
            `http://127.0.0.1:5000/api/complaints/${id}/status`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: status
                })
            }
        );

        loadComplaints();

    }

    catch(error){

        console.error(error);

        alert(
            "Could not update status"
        );
    }
}