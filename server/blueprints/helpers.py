import os
from io import BytesIO
from pathlib import Path
from langchain_ollama import ChatOllama
from pypdf import PdfReader
from docx import Document as DocxDocument
from blueprints.models import AssignmentRequirements
from langchain_core.runnables import Runnable
from typing import Any, cast, List
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from tavily import TavilyClient
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.documents import Document
import traceback
from io import BytesIO
from pathlib import Path
from pypdf import PdfReader
from docx import Document


load_dotenv()


llm = ChatOllama(
    model="llama3.1:8b"
)


api_key = os.getenv("TAVILY_API_KEY")


client = TavilyClient(
            api_key=api_key
        )


def read_file_content(file_buffer: bytes, filename: str ) -> str:
    """
    Read text content from a PDF, DOCX, or TXT file provided as bytes.

    Args:
        file_buffer: File content as bytes.
        filename: Original filename, used to determine the file type.

    Returns:
        Extracted text as a string.

    Raises:
        ValueError: If the file type is unsupported.
    """

    extension = Path(filename).suffix.lower()

    # PDF
    if extension == ".pdf":
        pdf = PdfReader(BytesIO(file_buffer))

        text = []

        for page in pdf.pages:
            page_text = page.extract_text()

            if page_text:
                text.append(page_text)

        return "\n\n".join(text)

    # DOCX
    elif extension == ".docx":
        document = Document(BytesIO(file_buffer))

        text = []

        for paragraph in document.paragraphs:
            if paragraph.text.strip():
                text.append(paragraph.text)

        return "\n".join(text)

    # TXT
    elif extension == ".txt":
        return file_buffer.decode("utf-8")

    else:
        raise ValueError(
            f"Unsupported file type: {extension}. "
            "Supported types are PDF, DOCX, and TXT."
        )


def analyze_assignment(user_prompt: str, courseMaterials: str = ""):
    """Analyze a request and classify the response format it requires."""
    llm_structured: Runnable[Any, AssignmentRequirements] = cast(
    Runnable[Any, AssignmentRequirements],
    cast(Any, llm).with_structured_output(AssignmentRequirements)
    )


    prompt = ChatPromptTemplate.from_messages([
    (
        "system",
      """
        You classify the user's request for a downstream academic assistant.
        Analyze the user request and course materials, but do not answer or
        rewrite the request.

        Classify `type` using these rules, in this order:

        1. `mcq`: the user provides multiple-choice options or asks to create,
           solve, explain, or answer multiple-choice questions.
        2. `summary`: the user asks to shorten, condense, summarize, or give
           the main points of supplied text, notes, or a source.
        3. `rephrase`: the user asks to paraphrase, reword, simplify, improve
           wording, or change the tone of supplied text without requesting a
           new argument or full answer.
        4. `question`: a direct question or short factual/conceptual request
           that should receive a direct answer. Use this by default when the
           request does not explicitly require academic composition.
        5. `discussion`: a discussion-board response or an instructed
           position supported by explanation and, where requested, citations.
        6. `essay`: an essay with an introduction, developed body, and
           conclusion, or an explicit request to write an essay.
        7. `report`: a report with sections, findings, analysis, or
           recommendations, or an explicit request to write a report.
        8. `research`: a research paper/project that explicitly requires
           research, sources, literature review, or evidence synthesis.
        9. `assignment`: a multi-part academic task that clearly requires a
           substantial written deliverable but does not fit discussion, essay,
           report, or research.
        10. `unknown`: only when the request is too incomplete to classify.

        Important classification safeguards:
        - Do not classify a request as essay, report, research, or assignment
          merely because it mentions a school subject or asks an academic
          question.
        - A request asking "What is...", "Explain...", "Why...", or "How..."
          is `question` unless it also explicitly requires an essay, report,
          research, citations, a word count, or a structured submission.
        - If the user asks for both a summary/rephrase and an explanation,
          choose `summary` or `rephrase` when transforming supplied text is
          the primary task.
        - Treat explicit instructions in course materials as authoritative,
          but do not infer requirements that are not stated.

        Extract:
        - the main topic
        - every question and sub-question that must be answered
        - explicitly stated word count or range
        - explicitly requested citation style
        - academic level
        - formatting requirements
        - required sources
        - other explicit requirements
        - whether external research is necessary

        For `question`, `summary`, and `mcq`, leave academic writing-only
        fields empty or unset unless the user explicitly provides them.
        Only record word count, citation style, formatting, and source
        requirements when they are explicitly stated or clearly required by
        the selected task type. Never invent details.

        USER REQUEST:
        {user_prompt}

        COURSE MATERIALS:
        {courseMaterials}
        """
        )
    ])

    chain = prompt | llm_structured

    result = chain.invoke({"user_prompt": user_prompt, "courseMaterials": courseMaterials})
    
    return result.model_dump_json(indent=2)

def search(user_prompt: str) -> List[str]:

        """Search online for reliable and valid source"""
        response = client.search(
            query=user_prompt,
            search_depth="advanced",
            max_results=5
        )

        urls = [
            result["url"]
            for result in response["results"]
        ]

        print("\nFound URLs:")

        return urls


def load_content(urls: List[str]) -> List[Document]:
    try:
        loader = WebBaseLoader(urls)
        documents = loader.load()

        print(
            f"Successfully loaded content from "
            f"{len(documents)} documents"
        )

       
        return documents

    except Exception as e:
        print(f"Error loading content: {e}")
        traceback.print_exc()
        return []
