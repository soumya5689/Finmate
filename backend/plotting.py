import matplotlib.pyplot as plt
import pandas as pd
import os

def plot_data(df, output_dir):
    os.makedirs(output_dir, exist_ok=True)

    # 🔥 Normalize column names ONCE
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
        .str.replace("/", "_")
    )

    print("AVAILABLE COLUMNS:", df.columns.tolist())

    # ==============================
    # PAYMENT METHOD (BAR)
    # ==============================
    if "payment_method" in df.columns and not df["payment_method"].empty:
        plt.figure(figsize=(10, 6))
        df["payment_method"].value_counts().plot(kind="bar")
        plt.title("Payment Method Distribution")
        plt.xlabel("Payment Method")
        plt.ylabel("Count")
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, "payment_method_distribution.png"))
        plt.close()
        print("✅ payment_method_distribution.png created")

    # ==============================
    # WITHDRAWAL AMOUNT (HIST)
    # ==============================
    if "withdrawals" in df.columns:
        df["withdrawals"] = pd.to_numeric(df["withdrawals"], errors="coerce")
        valid = df["withdrawals"].dropna()

        if not valid.empty:
            plt.figure(figsize=(10, 6))
            valid.hist(bins=20)
            plt.title("Withdrawal Amount Distribution")
            plt.xlabel("Amount")
            plt.ylabel("Frequency")
            plt.tight_layout()
            plt.savefig(os.path.join(output_dir, "withdrawal_amount_distribution.png"))
            plt.close()
            print("✅ withdrawal_amount_distribution.png created")

    # ==============================
    # TOP RECIPIENTS (PIE)
    # ==============================
    if "recipient_merchant" in df.columns:
        top = df["recipient_merchant"].value_counts().head(10)
        if not top.empty:
            plt.figure(figsize=(10, 6))
            plt.pie(top, labels=top.index, autopct="%1.1f%%", startangle=140)
            plt.title("Top 10 Recipients")
            plt.tight_layout()
            plt.savefig(os.path.join(output_dir, "top_recipients_distribution.png"))
            plt.close()
            print("✅ top_recipients_distribution.png created")
