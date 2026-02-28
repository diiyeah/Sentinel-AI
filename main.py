from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from pdf_utils import extract_text_from_pdf
from vector_store import add_documents
from rag_engine import generate_answer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# ==========================================
# ADD THIS NEW ROUTE HERE
# ==========================================
@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Sentinental Notes API!",
        "hint": "Go to http://127.0.0.1:8000/docs to use the Swagger UI"
    }
# ==========================================

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    docs = extract_text_from_pdf(file_path)
    add_documents(docs)

    return {"message": "PDF uploaded and indexed successfully"}


@app.get("/ask")
def ask_question(question: str):
    try:
        answer, citations = generate_answer(question)

        return {
            "answer": answer,
            "citations": citations
        }

    except Exception as e:
        return {"error": str(e)}