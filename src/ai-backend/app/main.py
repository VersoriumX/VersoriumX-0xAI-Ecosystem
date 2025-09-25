from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from typing import List, Dict
import os
import uvicorn
import logging

from .search_service import AISearchService # Assuming AISearchService exists
from .data_indexer import DataIndexer # Assuming DataIndexer exists

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- FastAPI App Setup ---
app = FastAPI(
    title="VersoriumX AI Search Backend",
    description="AI-powered search engine for on-chain and IPFS data.",
    version="0.1.0",
)

# --- API Key Authentication ---
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)

# Load AI Backend API Key from environment variable
# In production, use a more secure method like AWS Secrets Manager or Vault
API_KEY = os.getenv("AI_BACKEND_API_KEY", "DEFAULT_DEV_SECRET")
if API_KEY == "DEFAULT_DEV_SECRET":
    logger.warning("AI_BACKEND_API_KEY is not set. Using default secret. DO NOT USE IN PRODUCTION!")

async def verify_api_key(api_key: str = Depends(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API Key")
    return api_key

# --- Search Service Initialization ---
# In a real app, this would load models/vector DBs
search_service = AISearchService()
data_indexer = DataIndexer()

# --- Models ---
class SearchQuery(BaseModel):
    query: str

class SearchResult(BaseModel):
    title: str
    snippet: str
    source: str
    url: str | None = None
    cid: str | None = None
    score: float | None = None

# --- API Endpoints ---
@app.get("/", tags=["Health"])
async def read_root():
    return {"message": "VersoriumX AI Backend is running!"}

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "VersoriumX AI Backend"}

@app.post("/search", response_model=List[SearchResult], tags=["Search"], dependencies=[Depends(verify_api_key)])
async def search_data(query_data: SearchQuery):
    logger.info(f"Received search query: '{query_data.query}'")
    try:
        results = await search_service.perform_search(query_data.query)
        return results
    except Exception as e:
        logger.error(f"Error during search for query '{query_data.query}': {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Search operation failed.")

@app.post("/index-data", tags=["Admin"], dependencies=[Depends(verify_api_key)])
async def index_data(request: Request):
    logger.info("Triggering data indexing...")
    try:
        # This could be more sophisticated, with specific indexing commands
        data_indexer.index_all_sources()
        return {"message": "Indexing triggered successfully. Check logs for progress."}
    except Exception as e:
        logger.error(f"Error triggering indexing: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Data indexing failed to start.")

# --- Run the App (for local development) ---
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
