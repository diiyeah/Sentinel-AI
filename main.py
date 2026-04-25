import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import shutil

load_dotenv()

from pdf_utils import extract_text_from_pdf
from vector_store import add_documents
from rag_engine import generate_answer

app = FastAPI(title="Sentinel AI API", version="1.0.0")

# CORS — restrict in production by setting ALLOWED_ORIGINS env var
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def read_root():
    return {
        "message": "Sentinel AI API is running.",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        docs = extract_text_from_pdf(file_path)
        add_documents(docs)

        return {
            "message": "PDF uploaded and indexed successfully",
            "filename": file.filename,
            "pages": len(docs)
        }
    except Exception as e:
        return {"error": str(e)}


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


@app.get("/mindmap")
def get_mindmap():
    """Extract entities and relationships from the document for visual mind mapping."""
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        from vector_store import query_collection

        # Get broad context from the document
        results = query_collection("main concepts topics entities relationships", n_results=5)
        context = "\n\n".join(results["documents"][0]) if results["documents"][0] else ""

        if not context:
            return {"error": "No document indexed yet"}

        prompt = f"""Analyze this document and extract a mind map as JSON.

Return ONLY valid JSON in this exact format, no explanation:
{{
  "center": "Document Title (max 4 words)",
  "nodes": [
    {{"id": "1", "label": "Main Topic 1", "type": "topic"}},
    {{"id": "2", "label": "Main Topic 2", "type": "topic"}},
    {{"id": "3", "label": "Subtopic A", "type": "subtopic"}},
    {{"id": "4", "label": "Key Term X", "type": "term"}}
  ],
  "edges": [
    {{"source": "center", "target": "1", "label": "covers"}},
    {{"source": "1", "target": "3", "label": "includes"}},
    {{"source": "center", "target": "2", "label": "covers"}}
  ]
}}

Rules:
- 4-6 main topic nodes (type: "topic")
- 4-8 subtopic/detail nodes (type: "subtopic") 
- 2-4 key term nodes (type: "term")
- All edges must reference valid node ids or "center"
- Labels max 5 words each
- Keep it concise and meaningful

Document context:
{context[:3000]}"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a knowledge graph extractor. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=1500,
        )

        import json
        raw = response.choices[0].message.content.strip()
        # Extract JSON from response
        start = raw.find('{')
        end = raw.rfind('}') + 1
        if start == -1:
            return {"error": "Could not parse mind map"}
        data = json.loads(raw[start:end])
        return data

    except Exception as e:
        return {"error": str(e)}
