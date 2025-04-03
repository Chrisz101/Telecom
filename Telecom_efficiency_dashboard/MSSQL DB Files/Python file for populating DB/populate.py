import pandas as pd
import pyodbc
import random
from faker import Faker

# Initialize Faker
fake = Faker()

# Step 1: Load Excel and map relevant columns
excel_file = "Southern Company - UA Innovate 2025 - Data File.xlsx"
df = pd.read_excel(excel_file, sheet_name="Data")

# Column Mapping
column_mapping = {
    "Submitter": "SubmittedBy",
    "RequestType": "RequestType",
    "CustomerDept": "CustomerDept",
    "Coordinator": "Coordinator",
    "OpCat1": "OpCat1",
    "OpCat2": "OpCat2",
    "ProdCat1": "ProdCat1",
    "ProdCat2": "ProdCat2",
    "ProdCat3": "ProdCat3",
    "WorkGroup": "WorkGroup",
    "Assignment": "Assignment",
    "Implementer": "Implementer",
    "StatusReason": "Status",
    "ChangeStatus": "ChangeStatus",
    "Priority": "Priority",
    "Impact": "Impact",
    "Urgency": "Urgency",
    "ScheduleType": "ScheduleType",
    "ScheduleCategory": "ScheduleCategory",
    "SchStartDateTime": "ScheduledStartDateTime",
    "SchEndDateTime": "ScheduledEndDateTime",
    "ActualStartDateTime": "ActualStartDateTime",
    "ActualEndDateTime": "ActualEndDateTime",
    "CompletedDateTime": "CompletedDateTime",
    "ChangePlanning": "ImplementationResults",
    "SubmitDateTime": "CreatedDate",
    "CompletedMonth": "CreatedMonth",
    "Summary": "Notes",
    "ChangeID": "ChangeID"
}

# Create DataFrame with mapped columns
sql_data = {sql_col: df[excel_col] for excel_col, sql_col in column_mapping.items() if excel_col in df.columns}
insert_df = pd.DataFrame(sql_data)

# Convert date columns
for col in insert_df.columns:
    if "DateTime" in col or "Date" in col:
        insert_df[col] = pd.to_datetime(insert_df[col], errors="coerce")

# Step 2: Connect to SQL Server
conn = pyodbc.connect(
    'DRIVER={ODBC Driver 17 for SQL Server};'
    'SERVER=localhost\\SQLEXPRESS;'
    'DATABASE=SouthernCompanyDB;'
    'Trusted_Connection=yes;'
)
cursor = conn.cursor()

# Step 3: Insert Excel data into the database
inserted = 0
columns = list(insert_df.columns)
placeholders = ', '.join(['?' for _ in columns])
columns_str = ', '.join(columns)

insert_query = f"""
    INSERT INTO TransportForm2 ({columns_str})
    VALUES ({placeholders})
"""

for row in insert_df.itertuples(index=False):
    try:
        cursor.execute(insert_query, *row)
        inserted += 1
    except Exception as e:
        print(f"⚠️ Skipped row due to error: {e}")

print(f"✅ Inserted {inserted} rows from Excel into TransportForm2.")

# Step 4: Populate missing fields with demo data
demo_fillers = {
    "RequestType": lambda: random.choice(["Standard", "Emergency", "Routine"]),
    "ProdCat1": lambda: random.choice(["Hardware", "Software", "Network"]),
    "WorkGroup": lambda: random.choice(["Alpha Team", "Ops Group", "Dev Squad"]),
    "Assignment": lambda: fake.name(),
    "Implementer": lambda: fake.name(),
    "Urgency": lambda: random.choice(["Low", "Medium", "High"]),
    "ScheduleType": lambda: random.choice(["Planned", "Unplanned"]),
    "ScheduleCategory": lambda: random.choice(["Weekly", "Monthly", "On-Demand"]),
    "ImplementationStatus": lambda: random.choice(["Successful", "Partial", "Failed"]),
    "RootCause": lambda: random.choice(["Configuration Error", "Power Failure", "Unknown"]),
    "CreatedMonth": lambda: fake.month_name(),
    "Notes": lambda: fake.sentence(nb_words=10)
}

# Loop and update NULLs
for col, generator in demo_fillers.items():
    update_query = f"""
        UPDATE TransportForm2
        SET {col} = ?
        WHERE {col} IS NULL
    """
    try:
        for _ in range(10):  # Add 10 fake values per column
            value = generator()
            cursor.execute(update_query, value)
    except Exception as e:
        print(f"⚠️ Error updating column {col}: {e}")

conn.commit()
cursor.close()
conn.close()

print("✅ Missing fields filled with demo data.")

