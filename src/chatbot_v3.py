from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langchain_core.chat_history import BaseChatMessageHistory, InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from utils.helpers import get_openai_key, chromadb_init
from langchain.agents import initialize_agent, Tool
from langchain.agents import AgentType
from langchain.memory import ConversationBufferMemory


def main():
    api_key = get_openai_key('src/config.json')
    langchain_chroma = chromadb_init('src/config.json')

    retriever = langchain_chroma.as_retriever(search_kwargs={"k": 5})

    llm = ChatOpenAI(api_key=api_key, model="gpt-4o-mini")
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)


if __name__ == "__main__":
    main()
