import pyodbc
from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

# ----------------- MSSQL DB CONNECTION -----------------
def get_db_connection():
    conn = pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'SERVER=localhost\\SQLEXPRESS;'
        'DATABASE=SouthernCompanyDB;'
        'Trusted_Connection=yes;'
    )
    return conn

# ----------------- ROUTES: MAIN DASHBOARD -----------------
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/form')
def form():
    return render_template('form.html')

@app.route('/form2')
def form2():
    return render_template('form2.html')

@app.route('/submit_form', methods=['POST'])
def submit_form():
    data = request.form.to_dict()
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO TransportRequest (
                lte_related, capital_project, relay_circuits, site1, site2,
                summary, statement, steps, recovery, impact,
                start_date, end_date, states, product_type, product, action,
                jv_impact, tsr, backup_crq, instructions, incident
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get('lte_related'), data.get('capital_project'), data.get('relay_circuits'),
            data.get('site1'), data.get('site2'), data.get('summary'), data.get('statement'),
            data.get('steps'), data.get('recovery'), data.get('impact'), data.get('start_date'),
            data.get('end_date'), data.get('states'), data.get('product_type'), data.get('product'),
            data.get('action'), data.get('jv_impact'), data.get('tsr'), data.get('backup_crq'),
            data.get('instructions'), data.get('incident')
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return "✅ Form submitted and saved to SQL Server!"
    except Exception as e:
        print("Database error:", e)
        return f"❌ Error: {e}"

@app.route('/submit_form2', methods=['POST'])
def submit_form2():
    data = request.form.to_dict()
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO TransportForm2 (
                ChangeID, Region, State, SubmittedBy, RequestType, CustomerDept, Coordinator,
                OpCat1, OpCat2, ProdCat1, ProdCat2, ProdCat3, WorkGroup, Assignment,
                Implementer, Status, ChangeStatus, Priority, Impact, Urgency, ScheduleType,
                ScheduleCategory, ScheduledStartDateTime, ScheduledEndDateTime, ActualStartDateTime,
                ActualEndDateTime, CompletedDateTime, ImplementationStatus, ImplementationResults,
                RootCause, CreatedDate, CreatedMonth, Notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get('ChangeID'), data.get('Region'), data.get('State'), data.get('SubmittedBy'),
            data.get('RequestType'), data.get('CustomerDept'), data.get('Coordinator'),
            data.get('OpCat1'), data.get('OpCat2'), data.get('ProdCat1'), data.get('ProdCat2'),
            data.get('ProdCat3'), data.get('WorkGroup'), data.get('Assignment'), data.get('Implementer'),
            data.get('Status'), data.get('ChangeStatus'), data.get('Priority'), data.get('Impact'),
            data.get('Urgency'), data.get('ScheduleType'), data.get('ScheduleCategory'),
            data.get('ScheduledStartDateTime'), data.get('ScheduledEndDateTime'),
            data.get('ActualStartDateTime'), data.get('ActualEndDateTime'), data.get('CompletedDateTime'),
            data.get('ImplementationStatus'), data.get('ImplementationResults'), data.get('RootCause'),
            data.get('CreatedDate'), data.get('CreatedMonth'), data.get('Notes')
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return "✅ Form 2 submitted to SQL Server!"
    except Exception as e:
        print("Form 2 error:", e)
        return f"❌ Error: {e}"

# ----------------- API: DROPDOWN DYNAMIC OPTIONS -----------------
@app.route('/dropdown/<field>')
def dropdown_options(field):
    conn = get_db_connection()
    cursor = conn.cursor()
    field_map = {
        'submitter': 'SubmittedBy', 'coordinator': 'Coordinator', 'departments': 'CustomerDept',
        'opcat1': 'OpCat1', 'opcat2': 'OpCat2', 'prodcat2': 'ProdCat2', 'prodcat3': 'ProdCat3'
    }
    if field not in field_map:
        return jsonify([])
    query = f"SELECT DISTINCT {field_map[field]} FROM TransportForm2 WHERE {field_map[field]} IS NOT NULL"
    cursor.execute(query)
    rows = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(sorted(rows))

# ----------------- API: Chart Data Endpoints -----------------
@app.route('/api/top_increases')
def top_increases():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT TOP 10 CONCAT(CustomerDept, ' | ', OpCat1) AS label,
            COUNT(*) * 1.0 / NULLIF((SELECT COUNT(*) FROM TransportForm2), 0) * 100 AS value
        FROM TransportForm2
        GROUP BY CustomerDept, OpCat1
        ORDER BY value DESC
    """)
    data = [{'label': row[0], 'value': row[1]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(data)

@app.route('/api/worktype_changes')
def worktype_changes():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT OpCat1,
            COUNT(*) * 1.0 / NULLIF((SELECT COUNT(*) FROM TransportForm2), 0) * 100 AS YoY_Change
        FROM TransportForm2
        WHERE CreatedMonth IN ('2023', '2024')
        GROUP BY OpCat1
    """)
    data = [{'label': row[0], 'value': row[1]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(data)

@app.route('/api/department_changes')
def department_changes():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT CustomerDept,
            COUNT(*) * 1.0 / NULLIF((SELECT COUNT(*) FROM TransportForm2), 0) * 100 AS YoY_Change
        FROM TransportForm2
        WHERE CreatedMonth IN ('2023', '2024')
        GROUP BY CustomerDept
    """)
    data = [{'label': row[0], 'value': row[1]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(data)

@app.route('/api/early_completion')
def early_completion():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT TOP 10 CustomerDept,
            COUNT(CASE WHEN ActualEndDateTime <= ScheduledEndDateTime THEN 1 END) * 1.0 /
            COUNT(*) * 100 AS Efficiency
        FROM TransportForm2
        WHERE ScheduledEndDateTime IS NOT NULL AND ActualEndDateTime IS NOT NULL
        GROUP BY CustomerDept
        ORDER BY Efficiency DESC
    """)
    data = [{'label': row[0], 'value': row[1]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(data)

@app.route('/api/efficiency_change')
def efficiency_change():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT CustomerDept,
            COUNT(CASE WHEN CreatedMonth = '2024' AND ActualEndDateTime <= ScheduledEndDateTime THEN 1 END)*1.0 /
            NULLIF(COUNT(CASE WHEN CreatedMonth = '2024' THEN 1 END), 0)*100 -
            COUNT(CASE WHEN CreatedMonth = '2023' AND ActualEndDateTime <= ScheduledEndDateTime THEN 1 END)*1.0 /
            NULLIF(COUNT(CASE WHEN CreatedMonth = '2023' THEN 1 END), 0)*100 AS Change
        FROM TransportForm2
        GROUP BY CustomerDept
        HAVING COUNT(*) > 10
        ORDER BY Change DESC
    """)
    data = [{'label': row[0], 'value': row[1]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(data)

@app.route('/api/data')
def api_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM TransportForm2")
    columns = [col[0] for col in cursor.description]
    data = [dict(zip(columns, row)) for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(data)

# ----------------- APP LAUNCH -----------------
if __name__ == '__main__':
    app.run(debug=True)

