# Munch - Los Angeles

A chatbot designed to help users find food options in the Los Angeles area. This project leverages natural language processing (NLP) to understand user queries and integrates with various APIs to provide real-time information about restaurants, food types, and locations.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Tech-Stack](#tech-stack)

## Installation

### Prerequisites

- [Conda](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html) (for environment management)
- [Python](https://www.python.org/downloads/) (version 3.10)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. Create a new conda environment:

   ```bash
   conda create --name your-env-name python=3.10
   conda activate your-env-name
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Set up API keys in a `.env` file in the base directory with the following content:

   ```bash
   OPENAI_API_KEY=your_openai_api_key
   PYTHONPATH=/path/to/your/project
   ```

5. Load the environment variables by running the following command in each new terminal session:

   ```bash
   source ./load_env.sh
   ```

6. Populate your ChromaDB database by running:

   ```bash
   python langchain_testing/src/generate_db.py
   ```

   This will store the restaurant data in your ChromaDB for querying.

## Usage

To start the backend and frontend (run each step in separate terminals):

1. Launch the backend server:

   ```bash
   python backend/manage.py runserver
   ```

2. Launch the frontend:

   ```bash
   cd frontend
   npm install  # Only needed the first time
   npm run dev
   ```

## Tech-Stack

**Backend:**
- LangChain
- OPENAI GPT-4o mini
- ChromaDB
- OPENAI text-embedding-3-small
- Django
- SQLite3

**Frontend:**
- Next.js
- JavaScript
- Material-UI
- HTML
- CSS