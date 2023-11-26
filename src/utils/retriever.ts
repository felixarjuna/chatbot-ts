import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { client, embeddings } from "./common";

const vectorStore = new SupabaseVectorStore(embeddings, {
  client,
  tableName: "documents",
  queryName: "match_documents",
});

const retriever = vectorStore.asRetriever();

export { retriever };
