
import os
import uuid
import sqlite3

from flask import Flask, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "database.db")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

# Create uploads folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Allowed image formats
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def init_db():

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        location TEXT,
        description TEXT,
        priority TEXT,
        status TEXT,
        image_filename TEXT
    )
    """)

    # Safely add the image column to an existing database
    cursor.execute("PRAGMA table_info(complaints)")
    columns = [column[1] for column in cursor.fetchall()]

    if "image_filename" not in columns:
        cursor.execute("""
        ALTER TABLE complaints
        ADD COLUMN image_filename TEXT
        """)

    conn.commit()
    conn.close()


init_db()


# Home Route
@app.route("/")
def home():
    return "CityClean Backend Running Successfully!"


# Serve uploaded images
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(
        app.config["UPLOAD_FOLDER"],
        filename
    )


# Add Complaint
@app.route("/api/complaints", methods=["POST"])
def add_complaint():

    # Receive text fields from FormData
    name = request.form.get("name", "").strip()
    location = request.form.get("location", "").strip()
    description = request.form.get("description", "").strip()

    # Receive image
    image_file = request.files.get("image")

    if not name or not location or not description:
        return jsonify({
            "message": "Please fill all fields"
        }), 400

    if not image_file or image_file.filename == "":
        return jsonify({
            "message": "Please select an image"
        }), 400

    if not allowed_file(image_file.filename):
        return jsonify({
            "message": "Only PNG, JPG, JPEG, GIF and WEBP images are allowed"
        }), 400

    # Determine priority
    location_lower = location.lower()

    if "hospital" in location_lower:
        priority = "High"

    elif "school" in location_lower:
        priority = "High"

    elif "market" in location_lower:
        priority = "Medium"

    else:
        priority = "Low"

    # Create a unique filename
    original_filename = secure_filename(image_file.filename)
    extension = original_filename.rsplit(".", 1)[1].lower()
    image_filename = f"{uuid.uuid4().hex}.{extension}"

    # Save image
    image_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        image_filename
    )

    image_file.save(image_path)

    # Save complaint details in SQLite
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO complaints
        (name, location, description, priority, status, image_filename)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            name,
            location,
            description,
            priority,
            "Pending",
            image_filename
        )
    )

    conn.commit()

    complaint_id = cursor.lastrowid

    conn.close()

    complaint = {
        "id": complaint_id,
        "name": name,
        "location": location,
        "description": description,
        "priority": priority,
        "status": "Pending",
        "image_filename": image_filename,
        "image_url": url_for(
            "uploaded_file",
            filename=image_filename
        )
    }

    return jsonify({
        "message": "Complaint Submitted Successfully",
        "complaint": complaint
    }), 201


# View All Complaints
@app.route("/api/complaints", methods=["GET"])
def get_complaints():

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("""
    SELECT
        id,
        name,
        location,
        description,
        priority,
        status,
        image_filename
    FROM complaints
    """)

    rows = cursor.fetchall()
    conn.close()

    complaints_data = []

    for row in rows:

        image_url = None

        if row[6]:
            image_url = url_for(
                "uploaded_file",
                filename=row[6]
            )

        complaints_data.append({
            "id": row[0],
            "name": row[1],
            "location": row[2],
            "description": row[3],
            "priority": row[4],
            "status": row[5],
            "image_filename": row[6],
            "image_url": image_url
        })

    return jsonify(complaints_data)


# View Single Complaint
@app.route("/api/complaints/<int:id>", methods=["GET"])
def get_complaint(id):

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            name,
            location,
            description,
            priority,
            status,
            image_filename
        FROM complaints
        WHERE id = ?
        """,
        (id,)
    )

    row = cursor.fetchone()
    conn.close()

    if row:

        image_url = None

        if row[6]:
            image_url = url_for(
                "uploaded_file",
                filename=row[6]
            )

        return jsonify({
            "id": row[0],
            "name": row[1],
            "location": row[2],
            "description": row[3],
            "priority": row[4],
            "status": row[5],
            "image_filename": row[6],
            "image_url": image_url
        })

    return jsonify({
        "message": "Complaint Not Found"
    }), 404


# Update Status
@app.route("/api/complaints/<int:id>/status", methods=["PATCH"])
def update_status(id):

    data = request.json

    conn = sqlite3.connect(DATABASE)
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
