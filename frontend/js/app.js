async function submitComplaint() {

    const name =
        document.getElementById("name").value;

    const location =
        document.getElementById("location").value;

    const description =
        document.getElementById("description").value;

    if (
        name === "" ||
        location === "" ||
        description === ""
    ) {
        alert("Please fill all fields");
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/complaints",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    location: location,
                    description: description
                })
            }
        );

        const data = await response.json();

        alert(
            "Complaint Submitted Successfully!\nComplaint ID: "
            + data.complaint.id
        );

        window.location.href =
            "admin.html";

    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to backend"
        );
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

function updateStatus(id,status){

    const complaints =
    JSON.parse(
    localStorage.getItem(
    "complaints"
    )
    ) || [];

    const complaint =
    complaints.find(
    c => c.id === id
    );

    if(complaint){

        complaint.status =
        status;

        localStorage.setItem(
        "complaints",
        JSON.stringify(
        complaints
        )
        );

        loadComplaints();
    }

}