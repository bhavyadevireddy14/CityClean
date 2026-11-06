function submitComplaint() {

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

    let priority = "Low";

    if(location.toLowerCase().includes("hospital")){
        priority = "High";
    }
    else if(location.toLowerCase().includes("school")){
        priority = "High";
    }
    else if(location.toLowerCase().includes("market")){
        priority = "Medium";
    }

    const complaints =
        JSON.parse(
            localStorage.getItem("complaints")
        ) || [];

    const complaint = {

        id: complaints.length + 1,

        name: name,

        location: location,

        description: description,

        priority: priority,

        status: "Pending"
    };

    complaints.push(complaint);

    localStorage.setItem(
        "complaints",
        JSON.stringify(complaints)
    );

    alert(
        "Complaint Submitted Successfully!\nComplaint ID: "
        + complaint.id
    );

    window.location.href =
        "admin.html";
}

function trackComplaint() {

    const id =
    document.getElementById(
    "complaintId"
    ).value;

    const complaints =
    JSON.parse(
    localStorage.getItem(
    "complaints"
    )
    ) || [];

    const complaint =
    complaints.find(
    c => c.id == id
    );

    const result =
    document.getElementById(
    "result"
    );

    if(complaint){

        result.innerHTML = `

        <h3>
        Complaint Found
        </h3>

        <p>
        <strong>ID:</strong>
        ${complaint.id}
        </p>

        <p>
        <strong>Name:</strong>
        ${complaint.name}
        </p>

        <p>
        <strong>Location:</strong>
        ${complaint.location}
        </p>

        <p>
        <strong>Priority:</strong>
        ${complaint.priority}
        </p>

        <p>
        <strong>Status:</strong>
        ${complaint.status}
        </p>

        `;
    }

    else{

        result.innerHTML =

        "<h3>Complaint Not Found</h3>";

    }
}

function loadComplaints() {

    const complaints =
    JSON.parse(
    localStorage.getItem("complaints")
    ) || [];

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
    ${complaint.status === "Pending" ?
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

    });

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