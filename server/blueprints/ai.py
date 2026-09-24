import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai
import json
from google.genai import types
from blueprints.helpers import analyze_assignment, search, load_content
from blueprints.prompts import (
    ACADEMIC_ASSISTANT_SYSTEM_PROMPT,
    GENERAL_SYSTEM_PROMPT,
    MCQ_SYSTEM_PROMPT,
    REPHRASE_SYSTEM_PROMPT,
)
import spacy
# import ollama

load_dotenv()


class AI:
    MAX_DIRECT_PROMPT_LENGTH = 1500

    def __init__(self):
        self.gemini_client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY")
        )

        self.nlp = spacy.load("en_core_web_sm")

    async def ask_ai(self, user_prompt: str):
        requirements = analyze_assignment(user_prompt)

        print("requirements: ", requirements)
        json_requirements = json.loads(requirements)

        type = json_requirements["type"]
        topic = json_requirements["topic"]

        # Keep the full request for classification and requirement extraction.
        # Every downstream task receives a concise version of long requests.
        task_prompt = user_prompt
        if type != "summary" and len(user_prompt) > self.MAX_DIRECT_PROMPT_LENGTH:
            task_prompt = await self.summarize_text(user_prompt)

        if (type == "assignment" or type == "essay" or type == "discussion" or type == "research"):

            result = await self.write_essay(task_prompt, requirements)

            return {"text" : result, "topic":  topic}

        if (type == "mcq"):
            result = await self.answer_mcq(task_prompt, requirements)
                    
            return {"text" : result, "topic":  topic}

        if (type == "summary"):
            result = task_prompt

            return {"text" : result, "topic":  topic}

        if (type == "rephrase"):
            result = await self.rephrase_text(task_prompt, requirements)

            return {"text" : result, "topic":  topic}

        result = await self.perform_general_task(task_prompt, requirements)

        return {"text" : result, "topic": topic}

    async def write_essay(self, user_prompt: str, requirements):
        urls =  search(user_prompt)

        if urls and len(urls) > 0:
            loaded_contents = load_content(urls)

            prompt = f"""
        #     ============================================================
        #     USER REQUEST
        #     ============================================================

        #     {user_prompt}

         #     ============================================================
        #      REQUIREMENTS
        #     ============================================================
             {json.dumps(requirements, indent=2)}

        #     ============================================================
        #     SOURCES
        #     ============================================================
              {loaded_contents}
       
        #     ============================================================
        #     FINAL TASK
        #     ============================================================

        #     Complete the assignment.

        #     Use the following workflow:

        #     1. Understand the requirements.
        #     2. use provided sources to complete the assignment if provided
        #     3. Read important sources if provided.
        #     4. Compare evidence.
        #     5. Synthesize the information.
        #     6. Write the answer.
        #     7. Apply the requested citation style if provided.
        #     8. Check every question if provided.
        #     9. Check the word count if provided.
        #     10. Check the assignment requirements.

        #     Do not fabricate sources or citations if assignment needs citation.

        #     The final answer should be ready for the user
        #     to review and edit.
        
            """

        chat = self.gemini_client.chats.create(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
            system_instruction=ACADEMIC_ASSISTANT_SYSTEM_PROMPT,
            temperature=0,
        ),
        )


        response = chat.send_message(prompt)

        return response.text

    async def answer_mcq(self, user_prompt: str,  requirements):
        urls = search(user_prompt)

        if urls and len(urls) > 0:
            loaded_contents = load_content(urls)

            prompt = f"""

            #                ============================================================
                        #     USER REQUEST
                        #     ============================================================
            
                        #     {user_prompt}
                
                         #     ============================================================
                        #      REQUIREMENTS
                        #     ============================================================
                             {json.dumps(requirements, indent=2)}
                
                        #     ============================================================
                        #     SOURCES
                        #     ============================================================
                              {loaded_contents}
                       
                        #     ============================================================
                        #     FINAL TASK
                        #     ============================================================
                
                        #     Choose the correct answer from the provided question.
                
                        #     Use the following workflow:
                
                        #     1. Understand the requirements.
                        #     2. use provided sources to complete the assignment if provided
                        #     3. Read important sources if provided.
                        #     4. Compare evidence.
                        #     5. Synthesize the information.
                        #     6. Choose the correct option and provide concise explanation why it is the correct option.
                        #     7. List out used sources provided in loaded_contents under Sources use APA style, and make the links clickable
                        #     The final answer should be ready for the user
                        #     to review and edit.
            
            """ 
            chat = self.gemini_client.chats.create(
                    model="gemini-2.5-flash",
                    config=types.GenerateContentConfig(
                        system_instruction=MCQ_SYSTEM_PROMPT,
                        temperature=0,
                    ),
                    )
            
            
            response = chat.send_message(prompt)
            
            return response.text

    async def summarize_text(self, user_prompt: str):
    
            self.nlp.add_pipe("textrank")
    
            doc = self.nlp(user_prompt)
    
            for sent in doc._.textrank.summary(limit_phrases=2, limit_sentences=2):
                return sent 
    
    async def rephrase_text(self, user_prompt, requirements):
        prompt = f"""
        
                                #     ============================================================
                                #     USER REQUEST
                                #     ============================================================
                        
                                #     {user_prompt}
                        
                
                        
                                 #     ============================================================
                                #      REQUIREMENTS
                                #     ============================================================
                                     {json.dumps(requirements, indent=2)}
                        
                
                                #     ============================================================
                                #     FINAL TASK
                                #     ============================================================
                        
                                #     Rephrase the user prompts to the approximately to the number of words or characters
                        
                                #     1. Understand the requirements.
                    
                    """ 
        chat = self.gemini_client.chats.create(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
            system_instruction=REPHRASE_SYSTEM_PROMPT,
            temperature=0,
        ),
    )
                    
                    
        response = chat.send_message(prompt)
                    
        return response.text
    async def perform_general_task(self, user_prompt, requirements):
        """Complete requests that are not handled by a dedicated workflow."""
        urls = search(user_prompt)
        loaded_content = load_content(urls) if urls else []

        prompt = f"""
============================================================
USER REQUEST
============================================================
{user_prompt}

============================================================
REQUIREMENTS
============================================================
{requirements}

============================================================
RETRIEVED SOURCES
============================================================
{loaded_content}

============================================================
FINAL TASK
============================================================
Complete the user's request. Use the retrieved sources when they are
relevant, but do not treat them as authoritative when they do not answer the
request. Do not mention this workflow unless the user asks how you worked.
Return only the useful final response.
"""

        chat = self.gemini_client.chats.create(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=GENERAL_SYSTEM_PROMPT,
                temperature=0,
            ),
        )

        response = chat.send_message(prompt)
        return response.text


       

   