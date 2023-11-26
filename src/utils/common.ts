import { createClient } from "@supabase/supabase-js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const openAIApiKey = import.meta.env.VITE_OPENAI_API_KEY;
const sbApiKey = import.meta.env.VITE_SUPABASE_API_KEY;
const sbUrl = import.meta.env.VITE_SUPABASE_URL_LC_CHATBOT;

export const embeddings = new OpenAIEmbeddings({ openAIApiKey });
export const client = createClient(sbUrl, sbApiKey);
export const llm = new ChatOpenAI({ openAIApiKey });
