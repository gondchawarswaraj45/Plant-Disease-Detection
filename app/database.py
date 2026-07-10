import sqlite3
import os

DATABASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "plant_disease.db")

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. DISEASES TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS diseases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crop TEXT NOT NULL,
        disease_name TEXT NOT NULL,
        overview TEXT,
        causes TEXT,
        symptoms TEXT,
        treatment_chemical TEXT,
        treatment_organic TEXT,
        prevention TEXT,
        UNIQUE(crop, disease_name)
    )
    """)
    
    # 2. SCANS LOG TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        cnn_predicted_crop TEXT NOT NULL,
        gemini_predicted_disease TEXT,
        confidence REAL,
        verification_status TEXT,
        verification_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 3. SOIL REPORTS TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS soil_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crop_type TEXT,
        soil_type TEXT,
        ph_level REAL,
        moisture_level TEXT,
        verdict TEXT,
        recommendations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    conn.commit()
    conn.close()

# ==========================================
# SCANS CRUD HELPERS
# ==========================================

def add_scan(filename, cnn_crop, gemini_disease, confidence, verification_status, verification_message):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO scans (filename, cnn_predicted_crop, gemini_predicted_disease, confidence, verification_status, verification_message)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (filename, cnn_crop, gemini_disease, confidence, verification_status, verification_message))
    conn.commit()
    conn.close()

def get_scans(limit=50):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scans ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return rows

def delete_scan(scan_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM scans WHERE id = ?", (scan_id,))
    conn.commit()
    conn.close()

# ==========================================
# DISEASES SEEDING & QUERYING
# ==========================================

def add_disease(crop, disease_name, overview, causes, symptoms, treatment_chemical, treatment_organic, prevention):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
        INSERT OR REPLACE INTO diseases (crop, disease_name, overview, causes, symptoms, treatment_chemical, treatment_organic, prevention)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (crop, disease_name, overview, causes, symptoms, treatment_chemical, treatment_organic, prevention))
        conn.commit()
    except Exception as e:
        print("Error seeding disease:", e)
    finally:
        conn.close()

def get_disease_info(crop, disease_name):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Try exact match first
    cursor.execute("""
    SELECT * FROM diseases 
    WHERE LOWER(crop) = LOWER(?) AND LOWER(disease_name) = LOWER(?)
    """, (crop, disease_name))
    row = cursor.fetchone()
    
    # Try fuzzy crop match if nothing found
    if not row:
        cursor.execute("""
        SELECT * FROM diseases 
        WHERE LOWER(crop) LIKE LOWER(?) OR LOWER(disease_name) LIKE LOWER(?)
        LIMIT 1
        """, (f"%{crop}%", f"%{disease_name}%"))
        row = cursor.fetchone()
        
    conn.close()
    return row

# ==========================================
# SOIL REPORTS HELPERS
# ==========================================

def add_soil_report(crop_type, soil_type, ph, moisture, verdict, recommendations):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO soil_reports (crop_type, soil_type, ph_level, moisture_level, verdict, recommendations)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (crop_type, soil_type, ph, moisture, verdict, recommendations))
    conn.commit()
    conn.close()

def get_soil_reports(limit=30):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM soil_reports ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return rows
