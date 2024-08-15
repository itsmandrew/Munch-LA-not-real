from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langchain_core.chat_history import BaseChatMessageHistory, InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from utils.helpers import get_openai_key, chromadb_init, get_tavily_key
from langchain.memory import ConversationBufferMemory
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain.tools.retriever import create_retriever_tool
from langchain.agents import AgentExecutor, create_react_agent
from langchain import hub
from langchain_core.messages import AIMessage, HumanMessage

def main():
    api_key = get_openai_key('src/config.json')
    langchain_chroma = chromadb_init('src/config.json')

    retriever = langchain_chroma.as_retriever(search_kwargs={"k": 5})
    search = TavilySearchResults(
        max_results=1,
    )

    retriever_tool = create_retriever_tool(
    retriever,
        "reviews_search",
        "Search for information about Restaurant reviews. Use this tool for basic restaurant search.",
    )

    tools = [search, retriever_tool]

    llm = ChatOpenAI(api_key=api_key, model="gpt-4o-mini")

    # Get the prompt to use - you can modify this!
    prompt = hub.pull("hwchase17/react")

    # Construct the ReAct agent
    agent = create_react_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    # Main loop for user interaction
    while True:
        user_input = input("Enter your question (or 'exit' to quit): ")
        
        if user_input.lower() == 'exit':
            print("Goodbye!")
            break
        
        try:
            response = agent_executor.invoke({"input": user_input})
            print("\nAgent's response:")
            print(response['output'])
        except Exception as e:
            print(f"An error occurred: {str(e)}")
        
        print("\n" + "-"*50 + "\n")  # Separator for readability

if __name__ == "__main__":
    main()
