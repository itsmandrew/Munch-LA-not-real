import json
from openai import OpenAI

with open('config.json', 'r') as file:
    config = json.load(file)
    OPEN_AI_ORG_ID = config['OPEN_AI_ORG_ID']
    OPEN_AI_PROJECT_ID = config['OPEN_AI_PROJECT_ID']
    OPEN_AI_API_KEY = config['OPEN_AI_API_KEY']

client = OpenAI(
  organization=OPEN_AI_ORG_ID,
  project=OPEN_AI_PROJECT_ID,
  api_key=OPEN_AI_API_KEY
)

