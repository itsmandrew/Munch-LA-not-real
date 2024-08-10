from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from langchain import LLMChain, PromptTemplate
from langchain.llms import OpenAI  # or any other model you're using
import json

def home(request):
    return render(request, 'munch/index.html')

def langchain_response(request):
    # Example prompt
    user_input = request.GET.get('query', 'What are the best restaurants in LA?')
    with open('/Users/andrewchang/Workspace/HELP-IM-HUNGRY/config.json', 'r') as file:
        config = json.load(file)
        OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']
    # Initialize your LangChain LLM (replace with your model)
    llm = OpenAI(api_key=OPEN_AI_API_KEY)  # Set your API key

    # Define a prompt template
    prompt_template = PromptTemplate(
        input_variables=["user_input"],
        template="Provide a list of top restaurants in LA based on the query: {user_input}"
    )

    # Create the chain with the prompt
    chain = LLMChain(llm=llm, prompt=prompt_template)

    # Generate a response
    response = chain.run(user_input)

    return JsonResponse({'response': response})
