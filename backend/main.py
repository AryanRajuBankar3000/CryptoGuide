import os
import json
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Import your teammates' ENTIRE modules
# ---------------------------------------------------------------------------
import ml_engine.nlp_parser
import ml_engine.rule_engine

# Optionally run tests on startup (non-critical, will not crash the server)
try:
    import tests.test_rule_engine
except Exception:
    pass  # Tests are meant to be run explicitly, not at server boot

app = FastAPI(
    title="CryptoGuide API",
    description="Context-Aware Cryptographic Algorithm Recommendation Engine",
    version="1.0.0"
)

# Enable CORS so the frontend can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the database globally when the server starts
possible_db_paths = [
    os.path.join(os.path.dirname(__file__), "data", "knowledge_base.json"),
    os.path.join(os.path.dirname(__file__), "data", "knowledge-base.json"),
    os.path.join(os.path.dirname(__file__), "..", "data", "knowledge_base.json"),
    os.path.join(os.path.dirname(__file__), "..", "data", "knowledge-base.json"),
]

CRYPTO_DB = None
for path in possible_db_paths:
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            CRYPTO_DB = json.load(f)
        break

if CRYPTO_DB is None:
    CRYPTO_DB = []
    print("WARNING: No knowledge_base.json found in backend/data/ or ../data/")

# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------
class RecommendationRequest(BaseModel):
    queries: Optional[List[Dict[str, Any]]] = []
    natural_query: Optional[str] = None

# ---------------------------------------------------------------------------
# Core API Endpoints
# ---------------------------------------------------------------------------
@app.get("/")
def health_check():
    return {"status": "online", "message": "CryptoGuide API is running!"}

@app.post("/api/recommend")
async def get_recommendation(payload: RecommendationRequest):
    try:
        combined_queries = payload.queries.copy()

        # 1. Process Natural Language Query
        # Notice we now call it via the full module path
        if payload.natural_query and payload.natural_query.strip():
            extracted_params = ml_engine.nlp_parser.parse_natural_query(payload.natural_query)
            combined_queries.append(extracted_params)

        # 2. Evaluate all use cases
        individual_results = []
        for query_params in combined_queries:
            # Notice we now call it via the full module path
            result = ml_engine.rule_engine.evaluate_use_case(query_params, CRYPTO_DB)
            
            if "extraction_notes" in query_params:
                result["nlp_extraction_notes"] = query_params["extraction_notes"]
                
            individual_results.append(result)

        if not individual_results:
            return {"status": "success", "message": "No queries provided."}

        # 3. Generate the overarching summary
        # Notice we now call it via the full module path
        batch_summary = ml_engine.rule_engine.generate_batch_summary(individual_results)

        return {
            "status": "success",
            "individual_recommendations": individual_results,
            "combined_summary": batch_summary
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))