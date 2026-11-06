from flask import Flask, request, jsonify

app = Flask(__name__)

# Temporary storage
complaints = []

# Home Route
@app.route("/")
def home():
    return "CityClean Backend Running Successfully!"

# Add Complaint
@app.route("/api/complaints", methods=["POST"])
def add_complaint():

    data = request.json

    complaint_id = len(complaints) + 1

    location = data.get("location", "").lower()

    if "hospital" in location:
        priority = "High"

    elif "school" in location:
        priority = "High"

    elif "market" in location:
        priority = "Medium"

    else:
        priority = "Low"

    complaint = {
        "id": complaint_id,
        "name": data.get("name"),
        "location": data.get("location"),
        "description": data.get("description"),
        "priority": priority,
        "status": "Pending"
    }

    complaints.append(complaint)

    return jsonify({
        "message": "Complaint Submitted Successfully",
        "complaint": complaint
    })

# View All Complaints
@app.route("/api/complaints", methods=["GET"])
def get_complaints():

    return jsonify(complaints)

# View Single Complaint
@app.route("/api/complaints/<int:id>", methods=["GET"])
def get_complaint(id):

    for complaint in complaints:

        if complaint["id"] == id:
            return jsonify(complaint)

    return jsonify({
        "message": "Complaint Not Found"
    }), 404

# Update Status
@app.route("/api/complaints/<int:id>/status", methods=["PATCH"])
def update_status(id):

    data = request.json

    for complaint in complaints:

        if complaint["id"] == id:

            complaint["status"] = data.get(
                "status",
                complaint["status"]
            )

            return jsonify({
                "message": "Status Updated",
                "complaint": complaint
            })

    return jsonify({
        "message": "Complaint Not Found"
    }), 404

if __name__ == "__main__":
    app.run(debug=True)