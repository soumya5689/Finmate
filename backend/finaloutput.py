from collections import Counter
import pandas as pd

def calculate_statistics(df: pd.DataFrame):
    
    if 'Withdrawals' not in df.columns or 'Payment_Method' not in df.columns:
        print("Returning default statistics:")
        return {
            "average_withdrawal": 0,
            "total_withdrawal": 0,
            "highest_withdrawal": 0,
            "most_used_payment_method": "N/A"
        }

    df['Withdrawals'] = pd.to_numeric(df['Withdrawals'], errors='coerce')
    df = df.dropna(subset=['Withdrawals'])

    if df.empty:
        print("Returning default statistics:")
        return {
            "average_withdrawal": 0,
            "total_withdrawal": 0,
            "highest_withdrawal": 0,
            "most_used_payment_method": "N/A"
        }

    average_withdrawal = df['Withdrawals'].mean()
    total_withdrawal = df['Withdrawals'].sum()
    highest_withdrawal = df['Withdrawals'].max()

    payment_counts = Counter(df['Payment_Method'].dropna())
    most_used_payment_method = payment_counts.most_common(1)[0][0] if payment_counts else "N/A"

    statistics = {
        "average_withdrawal": round(average_withdrawal, 2),
        "total_withdrawal": round(total_withdrawal, 2),
        "highest_withdrawal": round(highest_withdrawal, 2),
        "most_used_payment_method": most_used_payment_method
    }
    return statistics
