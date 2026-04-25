import os
from groq import Groq
from vector_store import query_collection

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_answer(question: str):
    results = query_collection(question)

    context = ""
    citations = []

    for doc, metadata in zip(results["documents"][0], results["metadatas"][0]):
        context += doc + "\n\n"
        citations.append(metadata["page"])

    prompt = f"""You are a helpful AI study assistant.

Answer the question based ONLY on the context below. Be clear and concise.
If the answer is not in the context, say "I couldn't find that in the document."

Context:
{context}

Question:
{question}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a helpful AI study assistant that answers questions based on provided document context."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=1024,
    )

    answer = response.choices[0].message.content
    return answer, citations
