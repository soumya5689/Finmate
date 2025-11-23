from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from werkzeug.utils import secure_filename
from data_processing import process_excel
from database_operations import store_to_mysql, fetch_all_data_from_mysql
from plotting import plot_data
from finaloutput import calculate_statistics
from fastapi.responses import FileResponse
import pandas as pd
from typing import List, Optional
from datetime import datetime
from fastapi.staticfiles import StaticFiles 
from typing import Dict, Any

app = FastAPI()

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

UPLOAD_FOLDER = 'uploads'
PLOTS_FOLDER = 'plots'
ALLOWED_EXTENSIONS = {'xlsx', 'xls'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PLOTS_FOLDER, exist_ok=True)

app.mount("/plots", StaticFiles(directory="plots"), name="plots")


class UploadResponse(BaseModel):
    status: str
    rows: int = None
    message: str = None
    error: str = None
    plot_files: Optional[List[str]] = None  # Add this line


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



@app.get("/")
async def index():
    return {"message": "FastAPI backend is running!"}



@app.post("/api/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    if file and file.filename.endswith(tuple(ALLOWED_EXTENSIONS)):
        try:
            file_path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))
            with open(file_path, "wb") as f:
                while contents := await file.read(1024):
                    f.write(contents)

            df = process_excel(file_path)

            if 'Error' in df.columns:
                return UploadResponse(status="error", error=df['Error'][0])

            store_to_mysql(df)
            plot_files = plot_data(df, PLOTS_FOLDER)
            return UploadResponse(status="success", rows=len(df), message="File processed successfully.", plot_files=plot_files)

        except Exception as e:
            return UploadResponse(status="error", error=f"An unexpected error occurred: {str(e)}")
    else:
        return UploadResponse(status="error", error="Invalid file format")




@app.get("/api/final-output", response_model=TransactionsResponse)
async def get_transactions():
    df = fetch_all_data_from_mysql()
    if df is not None and not df.empty:
        transactions = df.to_dict(orient='records')

        # Convert dates to ISO format string
        for transaction in transactions:
            if isinstance(transaction.get('transaction_date'), pd.Timestamp):
                transaction['transaction_date'] = transaction['transaction_date'].isoformat()

        # Calculate statistics using your existing function
        statistics_dict = calculate_statistics(df)

        # Convert statistics dict to ExpenseSummaryResponse model instance
        statistics = ExpenseSummaryResponse(
            total_withdrawals=statistics_dict.get("total_withdrawal", 0),
            average_withdrawal=statistics_dict.get("average_withdrawal", 0),
            highest_withdrawal=statistics_dict.get("highest_withdrawal", 0),
            most_used_payment_method=statistics_dict.get("most_used_payment_method", "N/A")
        )

        return TransactionsResponse(transactions=transactions, statistics=statistics)

    else:
        # Return empty list and default stats if no data
        return TransactionsResponse(
            transactions=[],
            statistics=ExpenseSummaryResponse(
                total_withdrawals=0,
                average_withdrawal=0,
                highest_withdrawal=0,
                most_used_payment_method="N/A"
            )
        )




@app.get("/api/dashboard_data")
async def get_dashboard_data():
 
    df = fetch_all_data_from_mysql()
    if df is not None:

        payment_method_counts = df['payment_method'].value_counts().to_dict()
        df['transaction_date'] = pd.to_datetime(df['transaction_date'])
        monthly_withdrawals = df.groupby(pd.Grouper(key='transaction_date', freq='M'))['withdrawals'].sum().to_dict()
        total_withdrawals = df['withdrawals'].sum()
        average_withdrawal = df['withdrawals'].mean()
        highest_withdrawal = df['withdrawals'].max()
        most_used_payment_method = df['payment_method'].mode().iloc[0] if not df['payment_method'].empty else "No Data"
        
        return {
            "payment_method_counts": payment_method_counts,
            "monthly_withdrawals": monthly_withdrawals,
            "total_withdrawals": total_withdrawals,
            "average_withdrawal": average_withdrawal,
            "highest_withdrawal": highest_withdrawal,
            "mostUsedPaymentMethod": most_used_payment_method
        }
    else:
        return {}

    
