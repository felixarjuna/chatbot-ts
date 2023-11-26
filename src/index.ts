import { Document } from "langchain/document";
import { PromptTemplate } from "langchain/prompts";
import { RunnablePassthrough, RunnableSequence } from "langchain/runnables";
import { StringOutputParser } from "langchain/schema/output_parser";
import { llm } from "./utils/common";
import { formatHistory } from "./utils/history";
import { retriever } from "./utils/retriever";

document.addEventListener("submit", (e) => {
  e.preventDefault();
  progressConversation();
});

/** Create retriever chain
 * 1. Create a stand alone prompt
 * 2. Chain it with the large language model and parser
 * 3. Chain it with the retriever to retrieve data from the vector store
 * 4. Invoke the chain to get response
 */
const standaloneChain = generateStandaloneChain();
const retrieverChain = generateRetrieverChain();
const answerChain = generateUserQuestionChain();

const chain = RunnableSequence.from([
  { standaloneQuestion: standaloneChain, original_input: new RunnablePassthrough() },
  {
    context: retrieverChain,
    question: ({ original_input }) => original_input.question,
    history: ({ original_input }) => original_input.history,
  },
  answerChain,
]);

function generateStandaloneChain() {
  const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question.
    conversation history: {history}
    question: {question}
    standalone question:`;
  const prompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate);
  return prompt.pipe(llm).pipe(new StringOutputParser());
}

function combineDocuments(documents: Document<Record<string, any>>[]) {
  return documents.map((doc) => doc.pageContent).join("\n\n");
}

function generateRetrieverChain() {
  return RunnableSequence.from([
    (result) => result.standaloneQuestion,
    retriever,
    combineDocuments,
  ]);
}

function generateUserQuestionChain() {
  const userQuestionTemplate = `You are a helpful and enthusiastic support bot who can answer a given
    question about Scrimba based on the context provided and a conversation history. Try to find the
    answer in the context. If the answer is not given in the context, find the answer in the conversation
    history if possible. If you really don't know the answer, say "I'm sorry, I don't know the answer to
    that." and direct the questioner to email help@felixarjuna.com. Don't try to make up an answer.
    Always speak as if you were chatting to friend.
    context: {context}
    conversation history: {history}
    question: {question}
    answer:`;
  const prompt = PromptTemplate.fromTemplate(userQuestionTemplate);
  return prompt.pipe(llm).pipe(new StringOutputParser());
}

const history: string[] = [];
async function progressConversation() {
  const userInput = document.getElementById("user-input") as HTMLInputElement;
  const chatbotConversation = document.getElementById("chatbot-conversation-container");
  const question = userInput?.value;
  userInput.value = "";

  // add human message
  const newHumanSpeechBubble = document.createElement("div") as HTMLDivElement;
  newHumanSpeechBubble.classList.add("speech", "speech-human");
  chatbotConversation?.appendChild(newHumanSpeechBubble);
  newHumanSpeechBubble.textContent = question;
  if (chatbotConversation) chatbotConversation.scrollTop = chatbotConversation?.scrollHeight;

  // add AI message
  const response = await chain.invoke({
    question: question,
    history: formatHistory(history),
  });
  history.push(question, response);

  const newAiSpeechBubble = document.createElement("div") as HTMLDivElement;
  newAiSpeechBubble.classList.add("speech", "speech-ai");
  chatbotConversation?.appendChild(newAiSpeechBubble);
  newAiSpeechBubble.textContent = response;
  if (chatbotConversation) chatbotConversation.scrollTop = chatbotConversation?.scrollHeight;
}
