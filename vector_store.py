"""
Simple TF-IDF vector store — no external API, no heavy models.
Fast, works offline, zero dependencies beyond scikit-learn.
"""
import json
import os
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

STORE_PATH = os.getenv("CHROMA_PATH", "./chroma_db")
os.makedirs(STORE_PATH, exist_ok=True)

DOCS_FILE = os.path.join(STORE_PATH, "docs.json")
VEC_FILE  = os.path.join(STORE_PATH, "vectorizer.pkl")
MAT_FILE  = os.path.join(STORE_PATH, "matrix.pkl")

# In-memory state
_docs       = []   # list of {"text": str, "page": int}
_vectorizer = None
_matrix     = None


def _load():
    global _docs, _vectorizer, _matrix
    if os.path.exists(DOCS_FILE):
        with open(DOCS_FILE, "r", encoding="utf-8") as f:
            _docs = json.load(f)
    if os.path.exists(VEC_FILE) and os.path.exists(MAT_FILE):
        with open(VEC_FILE, "rb") as f:
            _vectorizer = pickle.load(f)
        with open(MAT_FILE, "rb") as f:
            _matrix = pickle.load(f)


def _save():
    with open(DOCS_FILE, "w", encoding="utf-8") as f:
        json.dump(_docs, f, ensure_ascii=False)
    with open(VEC_FILE, "wb") as f:
        pickle.dump(_vectorizer, f)
    with open(MAT_FILE, "wb") as f:
        pickle.dump(_matrix, f)


def add_documents(docs):
    global _docs, _vectorizer, _matrix

    # Limit to first 50 pages
    _docs = docs[:50]

    texts = [d["text"] for d in _docs]
    _vectorizer = TfidfVectorizer(stop_words="english", max_features=10000)
    _matrix = _vectorizer.fit_transform(texts)
    _save()
    print(f"Indexed {len(_docs)} pages.")


def query_collection(query, n_results=3):
    global _docs, _vectorizer, _matrix

    if _vectorizer is None or _matrix is None:
        _load()

    if not _docs:
        return {"documents": [[]], "metadatas": [[]]}

    q_vec = _vectorizer.transform([query])
    scores = cosine_similarity(q_vec, _matrix).flatten()
    top_idx = np.argsort(scores)[::-1][:n_results]

    documents = [[_docs[i]["text"] for i in top_idx]]
    metadatas = [[{"page": _docs[i]["page"]} for i in top_idx]]

    return {"documents": documents, "metadatas": metadatas}


# Load on import
_load()
