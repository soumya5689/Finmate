from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from werkzeug.utils import secure_filename
from analytics.expense_categorization import categorize_expense
from database_operations import fetch_filtered_expenses

from database_operations import fetch_all_data_from_mysql
from database_operations import fetch_monthly_trends
from data_processing import process_excel
from database_operations import store_to_mysql, fetch_all_data_from_mysql
from plotting import plot_data
from finaloutput import calculate_statistics
from fastapi.staticfiles import StaticFiles
import pandas as pd
from typing import List, Optional

app = FastAPI()

# -------------------- CORS --------------------
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- FOLDERS --------------------
UPLOAD_FOLDER = "uploads"
PLOTS_FOLDER = "plots"
ALLOWED_EXTENSIONS = {"xlsx", "xls"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PLOTS_FOLDER, exist_ok=True)

# Serve plot images
app.mount("/plots", StaticFiles(directory="plots"), name="plots")

# -------------------- MODELS --------------------
class UploadResponse(BaseModel):
    status: str
    rows: Optional[int] = None
    message: Optional[str] = None
    error: Optional[str] = None
    plot_files: Optional[List[str]] = None


class TransactionResponse(BaseModel):
    id: int
    withdrawals: float
    payment_method: str
    recipient_merchant: str
    remarks: str
    cleaned_remarks: Optional[str]
    transaction_date: str

    class Config:
        orm_mode = True


class ExpenseSummaryResponse(BaseModel):
    total_withdrawals: float
    average_withdrawal: float
    highest_withdrawal: float
    most_used_payment_method: str


class TransactionsResponse(BaseModel):
    transactions: List[TransactionResponse]
    statistics: ExpenseSummaryResponse


# -------------------- ROOT --------------------
@app.get("/")
async def index():
    return {"message": "FastAPI backend is running!"}


# -------------------- UPLOAD --------------------
@app.post("/api/upload", response_model=UploadResponse)

async def upload_file(file: UploadFile = File(...)):

    if not file.filename.endswith(tuple(ALLOWED_EXTENSIONS)):
        return UploadResponse(status="error", error="Invalid file format")

    try:
        file_path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))

        with open(file_path, "wb") as f:
            f.write(await file.read())

        df = process_excel(file_path)

        if "Error" in df.columns:
            return UploadResponse(status="error", error=df["Error"][0])

        store_to_mysql(df)

        # ✅ FORCE DB COMMIT VISIBILITY
        _ = fetch_all_data_from_mysql()

        plot_files = plot_data(df, PLOTS_FOLDER)

        return UploadResponse(
            status="success",
            rows=len(df),
            message="File processed successfully.",
            plot_files=plot_files,
        )

    except Exception as e:
        return UploadResponse(status="error", error=str(e))

# -------------------- FINAL OUTPUT (❗ RESTORED) --------------------
@app.get("/api/final-output", response_model=TransactionsResponse)
async def get_transactions():
    df = fetch_all_data_from_mysql()

    if df is None or df.empty:
        return TransactionsResponse(
            transactions=[],
            statistics=ExpenseSummaryResponse(
                total_withdrawals=0,
                average_withdrawal=0,
                highest_withdrawal=0,
                most_used_payment_method="N/A",
            ),
        )

    transactions = df.to_dict(orient="records")

    for t in transactions:
        if isinstance(t.get("transaction_date"), pd.Timestamp):
            t["transaction_date"] = t["transaction_date"].isoformat()

    stats = calculate_statistics(df)

    statistics = ExpenseSummaryResponse(
        total_withdrawals=stats.get("total_withdrawal", 0),
        average_withdrawal=stats.get("average_withdrawal", 0),
        highest_withdrawal=stats.get("highest_withdrawal", 0),
        most_used_payment_method=stats.get("most_used_payment_method", "N/A"),
    )

    return TransactionsResponse(
        transactions=transactions,
        statistics=statistics,
    )

@app.get("/api/expenses/categorized")
async def get_categorized_expenses():
    df = fetch_all_data_from_mysql()

    if df is None or df.empty:
        return []

    df["category"] = df.apply(categorize_expense, axis=1)

    return df[
        [
            "withdrawals",
            "payment_method",
            "recipient_merchant",
            "category",
            "transaction_date"
        ]
    ].to_dict(orient="records")



@app.get("/api/expenses/filtered")
async def get_filtered_expenses(
    start_date: str | None = None,
    end_date: str | None = None,
    min_amount: float | None = None,
    max_amount: float | None = None,
    payment_method: str | None = None,
    recipient: str | None = None,
):
    data = fetch_filtered_expenses(
        start_date,
        end_date,
        min_amount,
        max_amount,
        payment_method,
        recipient,
    )
    return data



# -------------------- DASHBOARD DATA --------------------
@app.get("/api/dashboard_data")
async def get_dashboard_data():
    df = fetch_all_data_from_mysql()
    if df is None or df.empty:
        return {}

    df["transaction_date"] = pd.to_datetime(df["transaction_date"], errors="coerce")

    # Add synthetic hours to avoid zero time diff
    df["transaction_date"] += pd.to_timedelta(df.index % 24, unit="h")
    df = df.sort_values("transaction_date")

    if len(df) > 1:
        df["time_diff"] = df["transaction_date"].diff().dt.total_seconds() / 3600
        avg_time_between = df["time_diff"].iloc[1:].mean()
    else:
        avg_time_between = None

    return {
        "paymentMethodCounts": df["payment_method"].value_counts().to_dict(),
        "monthlyWithdrawals": df.groupby(
            pd.Grouper(key="transaction_date", freq="M")
        )["withdrawals"]
        .sum()
        .to_dict(),
        "totalWithdrawals": float(df["withdrawals"].sum()),
        "averageWithdrawal": float(df["withdrawals"].mean()),
        "highestWithdrawal": float(df["withdrawals"].max()),
        "mostUsedPaymentMethod": df["payment_method"].mode().iloc[0],
        "averageTimeBetweenTransactions": float(avg_time_between)
        if avg_time_between
        else None,
    }

@app.get("/api/expenses/monthly")
def get_monthly_trends():
    data = fetch_monthly_trends()
    return data

