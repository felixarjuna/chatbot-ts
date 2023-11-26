import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { client, embeddings } from "./common";

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;
const SEPARATORS = ["\n\n", "\n", " ", ""];

export async function uploadData() {
  try {
    const result = await fetch("scrimba-info.txt");
    const text = await result.text();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
      separators: SEPARATORS,
    });
    const output = await splitter.createDocuments([text]);
    await SupabaseVectorStore.fromDocuments(output, embeddings, { client, tableName: "documents" });
  } catch (err) {
    console.log(err);
  }
}
