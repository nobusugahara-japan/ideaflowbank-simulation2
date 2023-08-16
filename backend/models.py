from pydantic import BaseModel
from typing import Dict, List

class AgentInit(BaseModel):
    agent_id: int
    job_values: Dict[str, float]
    job_costs: Dict[str, float]
    expectation_coefficients: Dict[str, float]

class AgentsInit(BaseModel):
    agents: List[AgentInit]

class MainParams(BaseModel):
    update_factor: float
    token_update_rate: float
    vote_discount_rate: float
    vote_minimum: float
