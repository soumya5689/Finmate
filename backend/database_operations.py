import mysql.connector
from datetime import datetime
from config import DB_CONFIG
import pandas as pd


# =========================
# Database Connection
# =========================
def connect_to_db():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as e:
        print(f"Database connection error: {e}")
        raise


# =========================
# Store Uploaded Data
# =========================
def store_to_mysql(df):
    """
    Stores the processed transaction data into the MySQL database, avoiding duplicates.
    """
    try:
        connection = connect_to_db()
        cursor = connection.cursor()

        for _, row in df.iterrows():
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


# =========================
# Fetch All Transactions
# =========================
def fetch_all_data_from_mysql():
    """
    Fetches all transaction data from the MySQL database and returns it as a DataFrame.
    """
    try:
        connection = connect_to_db()
        cursor = connection.cursor()

        query = """
        SELECT id, withdrawals, payment_method, recipient_merchant, 
           category, remarks, cleaned_remarks, transaction_date
        FROM transaction_data
        """

        cursor.execute(query)
        data = cursor.fetchall()
        column_names = [i[0] for i in cursor.description]

        return pd.DataFrame(data, columns=column_names)

    except mysql.connector.Error as err:
        print(f"Error fetching data from MySQL: {err}")
        return None

    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection closed after fetching.")


# =========================
# ✅ FIXED: Fetch Filtered Expenses
# =========================
def fetch_filtered_expenses(
    start_date=None,
    end_date=None,
    min_amount=None,
    max_amount=None,
    payment_method=None,
    recipient=None,
):
    connection = connect_to_db()
    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT withdrawals, payment_method, recipient_merchant, category, transaction_date
        FROM transaction_data
        WHERE 1=1
    """
    params = []

    # ✅ FIX: Include full start day
    if start_date:
        query += " AND transaction_date >= %s"
        params.append(start_date)

    # ✅ FIX: Include full end day (IMPORTANT)
    if end_date:
        query += " AND transaction_date < DATE_ADD(%s, INTERVAL 1 DAY)"
        params.append(end_date)

    if min_amount:
        query += " AND withdrawals >= %s"
        params.append(min_amount)

    if max_amount:
        query += " AND withdrawals <= %s"
        params.append(max_amount)

    if payment_method:
        query += " AND payment_method = %s"
        params.append(payment_method)

    if recipient:
        query += " AND recipient_merchant LIKE %s"
        params.append(f"%{recipient}%")

    cursor.execute(query, params)
    data = cursor.fetchall()

    cursor.close()
    connection.close()
    return data


def fetch_monthly_trends():
    connection = connect_to_db()
    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT 
            DATE_FORMAT(transaction_date, '%Y-%m') AS month,
            SUM(withdrawals) AS total
        FROM transaction_data
        GROUP BY month
        ORDER BY month
    """

    cursor.execute(query)
    data = cursor.fetchall()

    cursor.close()
    connection.close()
    return data
