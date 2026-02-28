import requests
from vector_store import query_collection


def generate_answer(question: str):
    results = query_collection(question)

    context = ""
    citations = []

    for doc, metadata in zip(results["documents"][0], results["metadatas"][0]):
        context += doc + "\n\n"
        citations.append(metadata["page"])

    prompt = f"""
You are a helpful AI assistant.

Answer the question based ONLY on the context below.

Context:
{context}

Question:
{question}

Answer clearly and include only information from the context.
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "mistral",
            "prompt": prompt,
            "stream": False
        }
    )

    answer = response.json()["response"]

    return answer, citations