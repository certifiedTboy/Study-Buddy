from typing import List, Literal
from pydantic import BaseModel, ConfigDict, Field


class WordCount(BaseModel):
    min: float | None = Field(default=None, description="Minimum word count.")
    max: float | None = Field(default=None, description="Maximum word count.")
    exact: float | None = Field(default=None, description="Exact word count.")


AssignmentType = Literal[
    "assignment",
    "discussion",
    "essay",
    "report",
    "research",
    "question",
    "summary",
    "mcq",
    "rephrase",
    "unknown",
]


class AssignmentRequirements(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    type: AssignmentType = Field(
        description="The response format required by the user's request."
    )

    topic: str = Field(
        default="",
        description="The main topic, or an empty string if none is stated.",
    )

    questions: List[str] = Field(
        default_factory=list,
        description="Questions and sub-questions that must be answered.",
    )

    word_count: WordCount | None = Field(
        default=None,
        alias="wordCount",
        description="Only include when explicitly stated or required.",
    )

    citation_style: Literal[
        "APA",
        "MLA",
        "Chicago",
        "Harvard",
        "IEEE",
        "none",
    ] = Field(
        default="none",
        alias="citationStyle",
        description="The explicitly requested citation style, otherwise none.",
    )

    academic_level: str | None = Field(
        default=None,
        alias="academicLevel",
        description="The requested academic level, when stated.",
    )

    requirements: List[str] = Field(
        default_factory=list,
        description="Explicit instructions and constraints from the request.",
    )

    formatting: List[str] = Field(
        default_factory=list,
        description="Explicit formatting requirements, if any.",
    )

    required_sources: List[str] = Field(
        default_factory=list,
        alias="requiredSources",
        description="Sources explicitly required by the user or assignment.",
    )

    requires_research: bool = Field(
        default=False,
        description="Whether external research is necessary.",
    )


class SourceUrls(BaseModel):
    urls: List[str] = Field(
        default_factory=list,
        description="URLs relevant to the user's request.",
    )



class AssignmentEvaluation(BaseModel):
    passed: bool
    missing_requirements: list[str]
    citation_problems: list[str]
    structural_problems: list[str]
    word_count_problem: bool
    corrected_answer: str