import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.dashboard import router as dashboard_router


load_dotenv()

app = FastAPI(
    title="DeployMind Backend",
    description="Deployment Intelligence backend",
    version="0.1.0",
)


frontend_url = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "deploymind-backend",
    }

app.include_router(dashboard_router)