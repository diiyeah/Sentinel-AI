import chromadb
from chromadb.utils import embedding_functions

# Use Ollama embedding model
ollama_ef = embedding_functions.OllamaEmbeddingFunction(
    model_name="nomic-embed-text",
    url="http://localhost:11434"
)

# Create Chroma client
chroma_client = chromadb.Client()

collection = chroma_client.get_or_create_collection(
    name="sentinel_collection",
    embedding_function=ollama_ef
)


def add_documents(docs):
    for i, doc in enumerate(docs):
        collection.add(
            documents=[doc["text"]],
            metadatas=[{"page": doc["page"]}],
            ids=[f"id_{i}_{doc['page']}"]
        )


def query_collection(query, n_results=3):
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    return results