# pylint: disable=E0401
# pylint: disable=W0718

"""
This module implements a chatbot using LangChain tools and OpenAI's GPT model.
It initializes a retriever tool and a TavilySearchResults instance, constructs a ReAct agent,
and provides a loop for user interaction.
"""

from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain.tools.retriever import create_retriever_tool
from langchain.agents import AgentExecutor, create_react_agent
from langchain import hub
from utils.helpers import get_openai_key, chromadb_init

def main():
    """
    Main function to run the chatbot application. It initializes necessary tools,
    constructs the ReAct agent, and enters a loop to handle user input.
    """
    api_key = get_openai_key('src/config.json')
    langchain_chroma = chromadb_init('src/config.json')

    retriever = langchain_chroma.as_retriever(search_kwargs={"k": 5})
    search = TavilySearchResults(
        max_results=1,
    )

    retriever_tool = create_retriever_tool(
        retriever,
        "reviews_search",
        "Search for information about Restaurant reviews. "
        "Use this tool for basic restaurant search."
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
        except (ValueError, TypeError) as e:
            print(f"An error occurred with the input or response processing: {str(e)}")
        except RuntimeError as e:
            print(f"An error occurred with the runtime execution: {str(e)}")
        except Exception as e:
            print(f"An unexpected error occurred: {str(e)}")

        print("\n" + "-"*50 + "\n")  # Separator for readability

if __name__ == "__main__":
    main()
