# backend/api/index.py
from fastapi import FastAPI
from mangum import Mangum
from backend.app import app   # correct import for your structure

handler = Mangum(app)
