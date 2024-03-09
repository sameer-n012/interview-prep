// ESM
import { ChromaClient, DefaultEmbeddingFunction } from 'chromadb'

export const ChromadbClient = class {

    constructor() {
        this.client = new ChromaClient({path: "http://localhost:8000"});
        this.collection = undefined;
    }

    async setCollection() {
        try {
            this.collection = await this.client.getCollection({ name: "db_question_collection", embeddingFunction: new DefaultEmbeddingFunction() });
        } catch (e) {
            this.collection = undefined;
        }
    }

    async query(queryText, n) {
        if (!this.collection) {
            return
        }
        
        return await this.collection.query({
        nResults: n, // n_results
        queryTexts: [queryText], // query_text
        include: [ "documents" ]
        })
    }
};
