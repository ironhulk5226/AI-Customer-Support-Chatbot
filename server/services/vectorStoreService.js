import { ChromaClient } from "chromadb";

const client = new ChromaClient({
    host:"localhost",
    port:8000,
    sse:false
})

const COLLECTION_NAME = "customer_support_knowledge";

let collection = null;

const getCollection = async() =>{
    if(!collection){
        collection = await client.getOrCreateCollection({
            name:COLLECTION_NAME,
            embeddingFunction:null
        })
    }
    return collection;
}

export const addDocumentsToVectorStore = async({
    ids,
    documents,
    embeddings,
    metadatas
}) =>{
    if(!ids || !documents || !embeddings || ids.length === 0){
        throw new Error("Invalid Vector Data.");
    }

    if(ids.length !== documents.length || ids.length !== embeddings.length){
        throw new Error("IDs , Documents and embeddings must have the same length.");
    }

    try {
        const collection = await getCollection();
        await collection.upsert({
            ids,
            documents,
            embeddings,
            metadatas
        });

        return {
            count:ids.length
        }
        
    } catch (error) {
        console.error("Failed To store vectors:",error.message);
        throw new Error("Failed to Store documents in ChromaDB.")
    }

}

export const searchSimilarDocuments = async(queryEmbedding,numberOfResults = 5)=>{
    if(!queryEmbedding || queryEmbedding.length === 0){
        throw new Error("Query Embedding Is Required.");
    }

    try {
        const collection = await getCollection();

        const results = await collection.query({
            queryEmbeddings : [queryEmbedding],
            nResults:numberOfResults
        })
        return results
    } catch (error) {
        console.error("Vector Search Failed.",error.message);
        throw new Error("Failed To Search ChromaDB");
    }
}

export const deleteDocumentsFromVectorStore = async(documentId) =>{
    if(!documentId){
        throw new Error("Document ID is required.");
    }

    try {
        const collection = await getCollection();
        await collection.delete({
            where:{
                documentId:documentId.toString()
            }
        })

        return {
            success:true
        };
    } catch (error) {
        console.error("Failed To Delete Vectors",error.message);
        throw new Error("Failed to Delete Document Vectors from ChromaDB");
        
    }
}

export const getVectorStoreStats = async()=>{
    try {
        const collection = await getCollection();
        const count = await collection.count();

        return {
            collectionName:COLLECTION_NAME,
            vectorCount:count
        }
    } catch (error) {
        console.error("Failed to get vector store stats: ", error.message);
        throw new Error("Failed to get vector store stats")
        
    }
}