import matplotlib.pyplot as plt
import pandas as pd
import os
from datetime import date


def plot_data(df, output_dir):
    
    os.makedirs(output_dir, exist_ok=True)
    plot_files = []

    # Payment Method Distribution (Bar Chart)
    try:
        plt.figure(figsize=(10, 6))
        df['payment_method'].value_counts().plot(kind='bar')
        plt.title('Payment Method Distribution')
        plt.xlabel('Payment Method')
        plt.ylabel('Frequency')
        payment_method_plot_path = os.path.join(output_dir, 'payment_method_distribution.png')
        plt.savefig(payment_method_plot_path)
        plt.close()
        plot_files.append(payment_method_plot_path)
    except KeyError as e:
        print(f"Error: Column not found: {e}")

    # Amount Distribution (Histogram)
    try:
        plt.figure(figsize=(10, 6))
        df['withdrawals'].hist()
        plt.title('Withdrawal Amount Distribution')
        plt.xlabel('Withdrawal Amount')
        plt.ylabel('Frequency')
        withdrawal_amount_plot_path = os.path.join(output_dir, 'withdrawal_amount_distribution.png')
        plt.savefig(withdrawal_amount_plot_path)
        plt.close()
        plot_files.append(withdrawal_amount_plot_path)
    except KeyError as e:
        print(f"Error: Column not found: {e}")

    # Top Recipients (Pie Chart)
    try:
        plt.figure(figsize=(10, 6))
        top_recipients = df['Recipient/Merchant'].value_counts().head(10)
        plt.pie(top_recipients, labels=top_recipients.index, autopct='%1.1f%%', startangle=140)
        plt.title('Top 10 Recipients')
        top_recipients_plot_path = os.path.join(output_dir, 'top_recipients_distribution.png')
        plt.savefig(top_recipients_plot_path)
        plt.close()
        plot_files.append(top_recipients_plot_path)
    except KeyError as e:
        print(f"Error: Column not found: {e}")

    return plot_files
