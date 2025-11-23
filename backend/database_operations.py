import mysql.connector
from datetime import datetime
from config import DB_CONFIG  
import pandas as pd


def connect_to_db():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as e:
        print(f"Database connection error: {e}")
        raise 


def store_to_mysql(df):
    """
    Stores the processed transaction data into the MySQL database, avoiding duplicates.
    """
    try:
        connection = connect_to_db()
        cursor = connection.cursor()

        for index, row in df.iterrows():
            sql = """
                INSERT IGNORE INTO transaction_data 
                (withdrawals, payment_method, recipient_merchant, remarks, cleaned_remarks, transaction_date)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            val = (
                row['Withdrawals'],
                row['Payment_Method'],
                row['Recipient/Merchant'],
                row['Remarks'],
                row['Cleaned Remarks'],
                datetime.now()
            )
            cursor.execute(sql, val)

        connection.commit()
        print(f"{cursor.rowcount} new unique records inserted into MySQL.")
    except mysql.connector.Error as err:
        print(f"Error storing data to MySQL: {err}")
        raise  
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection closed after storage.")


def fetch_all_data_from_mysql():
    """
    Fetches all transaction data from the MySQL database and returns it as a DataFrame.
    """
    try:
        connection = connect_to_db()
        cursor = connection.cursor()
        query = """
            SELECT id, withdrawals, payment_method, recipient_merchant, 
                   remarks, cleaned_remarks, transaction_date 
            FROM transaction_data
        """
        cursor.execute(query)
        data = cursor.fetchall()
        column_names = [i[0] for i in cursor.description]
        df = pd.DataFrame(data, columns=column_names)
        return df
    except mysql.connector.Error as err:
        print(f"Error fetching data from MySQL: {err}")
        return None
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection closed after fetching.")
