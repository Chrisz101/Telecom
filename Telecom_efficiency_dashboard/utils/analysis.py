<<<<<<< HEAD
import pandas as pd
import os
import json
from datetime import datetime

def process_data(filepath='data/Southern Company - UA Innovate 2025 - Data File.xlsx', output_json='data/processed_data.json'):
    # Load Excel
    df = pd.read_excel(filepath, sheet_name='Data')

    # Ensure datetime columns
    df['ActualEndDateTime'] = pd.to_datetime(df['ActualEndDateTime'], errors='coerce')
    df['SchEndDateTime'] = pd.to_datetime(df['SchEndDateTime'], errors='coerce')

    # Filter complete rows
    df = df.dropna(subset=['ActualEndDateTime', 'SchEndDateTime', 'CustomerDept', 'OpCat1'])

    # Add completion year
    df['Year'] = df['ActualEndDateTime'].dt.year

    # Add early finish flag
    df['EarlyFinish'] = df['ActualEndDateTime'] < df['SchEndDateTime']

    # Grouping function
    def group_efficiency(col):
        group = df.groupby([col, 'Year'])['EarlyFinish'].agg(['sum', 'count']).reset_index()
        pivot = group.pivot(index=col, columns='Year', values='sum')
        total = group.pivot(index=col, columns='Year', values='count')
        for year in [2023, 2024]:
            if year not in pivot.columns:
                pivot[year] = 0
            if year not in total.columns:
                total[year] = 1  # prevent divide by zero
        result = ((pivot[2024] / total[2024]) - (pivot[2023] / total[2023])) * 100
        result = result.fillna(0).round(2).reset_index()
        result.columns = ['label', 'change']
        return result

    dept_df = group_efficiency('CustomerDept')
    dept_df['type'] = 'department'

    worktype_df = group_efficiency('OpCat1')
    worktype_df['type'] = 'worktype'

    # Combine
    final_df = pd.concat([dept_df, worktype_df], ignore_index=True)

    # Export to JSON (main file)
    with open(output_json, 'w') as f:
        json.dump(final_df.to_dict(orient='records'), f, indent=2)

    # --- Additional Data: Ticket Percentage (2023 vs 2024) ---
    def compute_ticket_share(group_col):
        count_df = df.groupby([group_col, 'Year']).size().reset_index(name='count')
        pivot = count_df.pivot(index=group_col, columns='Year', values='count').fillna(0)
        pivot['total'] = pivot.sum(axis=1)
        for year in [2023, 2024]:
            if year not in pivot.columns:
                pivot[year] = 0
        pivot['2023_pct'] = (pivot[2023] / pivot['total'] * 100).round(2)
        pivot['2024_pct'] = (pivot[2024] / pivot['total'] * 100).round(2)
        pivot = pivot.reset_index()[[group_col, '2023_pct', '2024_pct']]
        pivot.columns = ['label', '2023', '2024']
        return pivot

    dept_share = compute_ticket_share('CustomerDept')
    dept_share['type'] = 'department'

    worktype_share = compute_ticket_share('OpCat1')
    worktype_share['type'] = 'worktype'

    ticket_share_df = pd.concat([dept_share, worktype_share], ignore_index=True)

    with open('data/ticket_counts.json', 'w') as f:
        json.dump(ticket_share_df.to_dict(orient='records'), f, indent=2)

    # --- Monthly Trends ---
    df['Month'] = df['ActualEndDateTime'].dt.to_period('M').astype(str)
    monthly_trend = df.groupby(['Month', 'Year']).size().reset_index(name='ticket_count')
    monthly_trend_pivot = monthly_trend.pivot(index='Month', columns='Year', values='ticket_count').fillna(0).reset_index()

    with open('data/monthly_trends.json', 'w') as f:
        json.dump(monthly_trend_pivot.to_dict(orient='records'), f, indent=2)

    print("✅ All processed data exported:")
    print("- processed_data.json")
    print("- ticket_counts.json")
    print("- monthly_trends.json")

if __name__ == '__main__':
    process_data()
=======
import pandas as pd
import os
import json
from datetime import datetime

def process_data(filepath='data/Southern Company - UA Innovate 2025 - Data File.xlsx', output_json='data/processed_data.json'):
    # Load Excel
    df = pd.read_excel(filepath, sheet_name='Data')

    # Ensure datetime columns
    df['ActualEndDateTime'] = pd.to_datetime(df['ActualEndDateTime'], errors='coerce')
    df['SchEndDateTime'] = pd.to_datetime(df['SchEndDateTime'], errors='coerce')

    # Filter complete rows
    df = df.dropna(subset=['ActualEndDateTime', 'SchEndDateTime', 'CustomerDept', 'OpCat1'])

    # Add completion year
    df['Year'] = df['ActualEndDateTime'].dt.year

    # Add early finish flag
    df['EarlyFinish'] = df['ActualEndDateTime'] < df['SchEndDateTime']

    # Grouping function
    def group_efficiency(col):
        group = df.groupby([col, 'Year'])['EarlyFinish'].agg(['sum', 'count']).reset_index()
        pivot = group.pivot(index=col, columns='Year', values='sum')
        total = group.pivot(index=col, columns='Year', values='count')
        for year in [2023, 2024]:
            if year not in pivot.columns:
                pivot[year] = 0
            if year not in total.columns:
                total[year] = 1  # prevent divide by zero
        result = ((pivot[2024] / total[2024]) - (pivot[2023] / total[2023])) * 100
        result = result.fillna(0).round(2).reset_index()
        result.columns = ['label', 'change']
        return result

    dept_df = group_efficiency('CustomerDept')
    dept_df['type'] = 'department'

    worktype_df = group_efficiency('OpCat1')
    worktype_df['type'] = 'worktype'

    # Combine
    final_df = pd.concat([dept_df, worktype_df], ignore_index=True)

    # Export to JSON (main file)
    with open(output_json, 'w') as f:
        json.dump(final_df.to_dict(orient='records'), f, indent=2)

    # --- Additional Data: Ticket Percentage (2023 vs 2024) ---
    def compute_ticket_share(group_col):
        count_df = df.groupby([group_col, 'Year']).size().reset_index(name='count')
        pivot = count_df.pivot(index=group_col, columns='Year', values='count').fillna(0)
        pivot['total'] = pivot.sum(axis=1)
        for year in [2023, 2024]:
            if year not in pivot.columns:
                pivot[year] = 0
        pivot['2023_pct'] = (pivot[2023] / pivot['total'] * 100).round(2)
        pivot['2024_pct'] = (pivot[2024] / pivot['total'] * 100).round(2)
        pivot = pivot.reset_index()[[group_col, '2023_pct', '2024_pct']]
        pivot.columns = ['label', '2023', '2024']
        return pivot

    dept_share = compute_ticket_share('CustomerDept')
    dept_share['type'] = 'department'

    worktype_share = compute_ticket_share('OpCat1')
    worktype_share['type'] = 'worktype'

    ticket_share_df = pd.concat([dept_share, worktype_share], ignore_index=True)

    with open('data/ticket_counts.json', 'w') as f:
        json.dump(ticket_share_df.to_dict(orient='records'), f, indent=2)

    # --- Monthly Trends ---
    df['Month'] = df['ActualEndDateTime'].dt.to_period('M').astype(str)
    monthly_trend = df.groupby(['Month', 'Year']).size().reset_index(name='ticket_count')
    monthly_trend_pivot = monthly_trend.pivot(index='Month', columns='Year', values='ticket_count').fillna(0).reset_index()

    with open('data/monthly_trends.json', 'w') as f:
        json.dump(monthly_trend_pivot.to_dict(orient='records'), f, indent=2)

    print("✅ All processed data exported:")
    print("- processed_data.json")
    print("- ticket_counts.json")
    print("- monthly_trends.json")

if __name__ == '__main__':
    process_data()
>>>>>>> a095f20 (Added all local project folders to GitHub repo)
