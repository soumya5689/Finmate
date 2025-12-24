import pandas as pd
from data_processing import process_excel 

def test_process_excel_with_file_path():
    print("Please enter the path:") 
    file_path = "C:\\Users\\rinku\\Downloads\\account_statement.xls"

    try:
        result_df = process_excel(file_path)
    except Exception as e:
        print(f"Error: {e}")
        return

    print("\nOutput DataFrame:")
    print(result_df)