# Munch - Los Angeles

A chatbot designed to help users find food options in the Los Angeles area. This project leverages natural language processing (NLP) to understand user queries and integrates with various APIs to provide real-time information about restaurants, food types, and locations.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#features)

## Installation

### Prerequisites

- [Conda](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html) (for environment management)
- [Python3.10] (https://www.python.org/downloads/)

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

4. Setup API keys for the following:

- OpenAI for model use and embeddings
- Google Cloud Platform (enable Places API) only for webscraper

## Usage

Basic use to start the chatbot and run the program.

1. Run the main script:

   ```bash
   python src/chatbot.py
   ```

## Architecture

TBD - Work in Progress
