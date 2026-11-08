from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
app = Flask(__name__)
CORS(app)
def init_db():

    conn = sqlite3.connect("backend/database.db")

    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        location TEXT,
        description TEXT,
        priority TEXT,
        status TEXT
    )
    """)

    conn.commit()
    conn.close()

init_db()




# Home Route
@app.route("/")
def home():
    return "CityClean Backend Running Successfully!"

# Add Complaint
@app.route("/api/complaints", methods=["POST"])
def add_complaint():

    data = request.json

    

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
        "name": data.get("name"),
        "location": data.get("location"),
        "description": data.get("description"),
        "priority": priority,
        "status": "Pending"
    }
    conn = sqlite3.connect("backend/database.db")

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO complaints
        (name, location, description, priority, status)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
        complaint["name"],
        complaint["location"],
        complaint["description"],
        complaint["priority"],
        complaint["status"]
        )
    )

    conn.commit()

    complaint["id"] = cursor.lastrowid

    conn.close()

    return jsonify({
    "message": "Complaint Submitted Successfully",
    "complaint": complaint
    })

    

# View All Complaints
@app.route("/api/complaints", methods=["GET"])
def get_complaints():

    conn = sqlite3.connect(
        "backend/database.db"
    )

    cursor = conn.cursor()

    cursor.execute("""
    SELECT
        id,
        name,
        location,
        description,
        priority,
        status
    FROM complaints
    """)

    rows = cursor.fetchall()

    conn.close()

    complaints_data = []

    for row in rows:

        complaints_data.append({
            "id": row[0],
            "name": row[1],
            "location": row[2],
            "description": row[3],
            "priority": row[4],
            "status": row[5]
        })

    return jsonify(complaints_data)



# View Single Complaint
@app.route("/api/complaints/<int:id>", methods=["GET"])
def get_complaint(id):

    conn = sqlite3.connect(
        "backend/database.db"
    )

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
        id,
        name,
        location,
        description,
        priority,
        status
        FROM complaints
        WHERE id = ?
        """,
        (id,)
    )

    row = cursor.fetchone()

    conn.close()

    if row:

        return jsonify({
            "id": row[0],
            "name": row[1],
            "location": row[2],
            "description": row[3],
            "priority": row[4],
            "status": row[5]
        })

    return jsonify({
        "message": "Complaint Not Found"
    }), 404

# Update Status
# Update Status
@app.route("/api/complaints/<int:id>/status", methods=["PATCH"])
def update_status(id):

    data = request.json

    conn = sqlite3.connect(
        "backend/database.db"
    )

    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE complaints
        SET status = ?
        WHERE id = ?
        """,
        (
            data.get("status"),
            id
        )
    )

    conn.commit()

    conn.close()

    return jsonify({
        "message": "Status Updated"
    })

if __name__ == "__main__":
    app.run(debug=True)