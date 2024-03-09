import chromadb
import pandas as pd
import os
import dotenv
import chromadb.utils.embedding_functions as embedding_functions
from pylatexenc.latex2text import LatexNodes2Text

dotenv.load_dotenv()

# embedding_function = embedding_functions.GoogleGenerativeAIEmbeddingFunction(api_key=os.getenv("API_KEY"))
embedding_function = embedding_functions.DefaultEmbeddingFunction()


# # use directly
# google_ef  = embedding_functions.GoogleGenerativeAiEmbeddingFunction(api_key=os.getenv("API_KEY"))
# google_ef(["document1","document2"])

# # pass documents to query for .add and .query
# collection = client.create_collection(name="name", embedding_function=google_ef)
# collection = client.get_collection(name="name", embedding_function=google_ef)

# chroma_client = chromadb.Client()
# collection = chroma_client.create_collection(name="db_question_collection")
# collection.add(
#     documents=["This is a document", "This is another document"],
#     metadatas=[{"source": "my_source"}, {"source": "my_source"}],
#     ids=["id1", "id2"]
# )

# collection.add(
#     embeddings=[[1.2, 2.3, 4.5], [6.7, 8.2, 9.2]],
#     documents=["This is a document", "This is another document"],
#     metadatas=[{"source": "my_source"}, {"source": "my_source"}],
#     ids=["id1", "id2"]
# )

# results = collection.query(
#     query_texts=["This is a query document"],
#     n_results=2
# )

# def parse(collections):
#     # Grabbing data from CSV
#     df = pd.read_csv(os.path.join("data", "datascience_questions.csv"))
#     prompts = df["Questions"]


def seed_db(collection):
    global embedding_function
    counter = 0

    # Grabbing data from test CSV
    df = pd.read_csv(os.path.join("data", "test.csv"))
    l2t = LatexNodes2Text()
    df["question"] = df["question"].apply(l2t.latex_to_text)
    prompts = df["question"].to_list()
    collection.add(
        documents=prompts,
        ids=[f"id{i}" for i in range(counter, len(prompts) + counter)],
    )
    counter += len(prompts)

    df = pd.read_csv(os.path.join("data", "train.csv"))
    l2t = LatexNodes2Text()
    df["question"] = df["question"].apply(l2t.latex_to_text)
    prompts = df["question"].to_list()
    collection.add(
        documents=prompts,
        ids=[f"id{i}" for i in range(counter, len(prompts) + counter)],
    )
    counter += len(prompts)


    # Grabbing data from datascience_questions CSV
    df = pd.read_csv(os.path.join("data", "datascience_questions.csv"))
    prompts = df["Questions"].to_list()
    collection.add(
        documents=prompts,
        # embeddings=[embedding_function(prompts)],
        # metadatas=[{"source": "my_source"}],
        ids=[f"id{i}" for i in range(counter, len(prompts) + counter)],
    )
    counter += len(prompts)

    # Grabbing data from deeplearning_questions CSV
    df = pd.read_csv(os.path.join("data", "deeplearning_questions.csv"))
    prompts = df["DESCRIPTION"].to_list()
    collection.add(
        documents=prompts,
        ids=[f"id{i}" for i in range(counter, len(prompts) + counter)],
    )

    return None


def query_db(collection, query):
    results = collection.query(query_texts=[query], n_results=2)
    return results


if __name__ == "__main__":
    chroma_client = chromadb.PersistentClient(path="chroma")

    # if client exists
    try:
        collection = chroma_client.get_collection(
            name="db_question_collection", embedding_function=embedding_function
        )
        if collection.count() == 0:
            seed_db(collection)
        print("Collection exists")
    except ValueError as e:
        collection = chroma_client.create_collection(
            name="db_question_collection",
            embedding_function=embedding_function,
            metadata={"hnsw:space": "cosine"},  # l2 is the default
        )
        seed_db(collection)
        print("Collection created")

    # Printing db contents
    print(collection.peek())
    print(collection.count())
    # results = collection.query(
    #     query_texts=["This is a query document"],
    #     n_results=2
    # )
    # print(results)
