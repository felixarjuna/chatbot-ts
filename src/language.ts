import { PromptTemplate } from "langchain/prompts";
import { RunnablePassthrough, RunnableSequence } from "langchain/runnables";
import { StringOutputParser } from "langchain/schema/output_parser";
import { llm } from "./utils/common";

type InputType = {
  sentence: string;
  language: string;
};

const punctuationTemplate = `Given a sentence, add punctuation where needed.
  sentence: {sentence}
  sentence with punctuation:`;
const punctuationPrompt = PromptTemplate.fromTemplate(punctuationTemplate);
const punctuationChain = RunnableSequence.from([punctuationPrompt, llm, new StringOutputParser()]);

const grammarTemplate = `Given a sentence, correct the grammar.
  sentence: {punctuated_sentence}
  sentence with correct grammar:`;
const grammarPrompt = PromptTemplate.fromTemplate(grammarTemplate);
const grammarChain = RunnableSequence.from([grammarPrompt, llm, new StringOutputParser()]);

const translateTemplate = `Given a sentence, translate that sentence into {language}
  sentence: {grammatically_correct_sentence}
  translated sentence:`;
const translatePrompt = PromptTemplate.fromTemplate(translateTemplate);
const translateChain = RunnableSequence.from([translatePrompt, llm, new StringOutputParser()]);

export const chain = RunnableSequence.from([
  { punctuated_sentence: punctuationChain, original_input: new RunnablePassthrough() },
  {
    grammatically_correct_sentence: grammarChain,
    language: ({ original_input }: { original_input: InputType }) => original_input.language,
  },
  translateChain,
]);
