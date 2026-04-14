import os
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
model = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-large")

print(f"Testing embeddings with model: {model}")
embeddings = OpenAIEmbeddings(model=model)
try:
    res = embeddings.embed_query("testing")
    print(f"Success! Embedding size: {len(res)}")
except Exception as e:
    print(f"Error: {e}")
