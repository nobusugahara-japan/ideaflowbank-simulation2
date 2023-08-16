from fastapi import FastAPI
from models import AgentInit, MainParams,AgentsInit
import copy
from fastapi.middleware.cors import CORSMiddleware


class Agent:
    def __init__(self, agent_id, job_values, job_costs, expectation_coefficients):  # この行を変更
        self.id = agent_id
        self.job_values =job_values
        self.job_costs = job_costs
        self.token = 1
        self.expectation_coefficients = expectation_coefficients
        self.jobs_total = {'A': 0, 'B': 0, 'C': 0} 
        self.votes_total = {'A': 0, 'B': 0, 'C': 0} 
        
    @property
    def bet_on_ideas(self):
        return {key: self.jobs_total[key] + self.votes_total [key] for key in self.jobs_total}

    def decide(self, total_bet_on_ideas, ideas):
        expected_values_for_jobs = {
            idea: self.expectation_coefficients[idea] * self.job_values[idea] * 
            (self.bet_on_ideas[idea] / total_bet_on_ideas[idea] if self.bet_on_ideas[idea] != 0 and total_bet_on_ideas[idea] != 0 else 1)
            for idea in ideas
        }
        chosen_idea = max(expected_values_for_jobs, key=expected_values_for_jobs.get)
        if expected_values_for_jobs[chosen_idea] > self.job_costs[chosen_idea]:
            return "job", chosen_idea,  expected_values_for_jobs
        elif self.token > 0:  # As long as agent has tokens left, they can vote
            return "vote", chosen_idea,  expected_values_for_jobs
        else:
            return "none", chosen_idea,  expected_values_for_jobs

    def perform_job(self, jobs_total,total_bet_on_ideas, ideas):
        # 各アイディアに対する期待値を計算
        expected_values_for_jobs = {
            idea: self.expectation_coefficients[idea] * self.job_values[idea] / total_bet_on_ideas[idea] if total_bet_on_ideas[idea] != 0 
                else self.expectation_coefficients[idea] * self.job_values[idea]
                for idea in ideas
            }

        # 最も期待値が高いアイディアを選択
        best_idea = max(expected_values_for_jobs, key=expected_values_for_jobs.get)

        # 選択したアイディアにjob_valueを追加
        job_value = self.job_values[best_idea]
        jobs_total[best_idea] += job_value
        self.jobs_total[best_idea] += job_value
        self.token += job_value
        
        return best_idea, job_value

    def perform_vote(self, jobs_total, votes_total,total_bet_on_ideas, ideas, vote_discount_rate,vote_minimum):
        expected_values = {idea: self.expectation_coefficients[idea] * jobs_total[idea] for idea in ideas}  
        best_idea = max(expected_values, key=expected_values.get)
        if total_bet_on_ideas[best_idea] == 0:
            vote_value = vote_minimum
        else:
            vote_value =expected_values[best_idea] * (self.bet_on_ideas[best_idea] / total_bet_on_ideas[best_idea])
        self.votes_total[best_idea] += vote_value
        self.token -= vote_value
        
        return best_idea, vote_value
            
    def update_expectation_coefficients(self, votes, update_factor):
        # 全体のvotesの構成比を計算
        total_votes = sum(votes.values())
        if total_votes > 0:
            vote_ratios = {idea: count/total_votes for idea, count in votes.items()}
            # 自身のexpectation_coefficientsの構成比を計算
            total_expectation = sum(self.expectation_coefficients.values())
            expectation_ratios = {idea: coef/total_expectation for idea, coef in self.expectation_coefficients.items()}

            # 最も多いタイプの期待値をその差異のupdate_factor%だけ上げる
            max_vote_idea = max(vote_ratios, key=vote_ratios.get)
            diff = vote_ratios[max_vote_idea] - expectation_ratios[max_vote_idea]
            self.expectation_coefficients[max_vote_idea] += diff * update_factor * total_expectation
            
    def update_tokens_based_on_history(self, votes, rate):
        for idea in ['A', 'B', 'C']:
            self.token += self.jobs_total[idea] * votes[idea] * rate


agents = []

app = FastAPI()

origins = [
    "http://localhost:3000",  # ReactアプリのURL
    # 必要に応じて他のオリジンを追加
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/initialize_agents/")
def initialize_agents(data: AgentsInit):
    agents.clear()
    for agent_data in data.agents:
        agent_data.job_values = {k.upper(): v for k, v in agent_data.job_values.items()}
        agent_data.job_costs = {k.upper(): v for k, v in agent_data.job_costs.items()}
        agent_data.expectation_coefficients = {k.upper(): v for k, v in agent_data.expectation_coefficients.items()}
        agent = Agent(
            agent_data.agent_id,
            agent_data.job_values,
            agent_data.job_costs,
            agent_data.expectation_coefficients
        )
        agents.append(agent)
       
    # サンプルとして、各エージェントのIDのリストを返しています。
    return {"agent_ids": [agent.id for agent in agents]}


@app.post("/run_simulation/")
def run_simulation(params: MainParams):
    ideas = ['A', 'B', 'C']
    votes_total = {'A': 0, 'B': 0, 'C': 0}
    jobs_total = {'A': 0, 'B': 0, 'C': 0}
    log_all = []

    iteration_count = 0
    update_factor = params.update_factor
    token_update_rate = params.token_update_rate
    vote_discount_rate = params.vote_discount_rate
    vote_minimum = params.vote_minimum
        
    while max(jobs_total.values()) < 1 and iteration_count < 100:
        jobs_total = {idea: sum(agent.jobs_total[idea] for agent in agents) for idea in ideas}
        votes_total = {idea: sum(agent.votes_total[idea] for agent in agents) for idea in ideas}
        total_bet_on_ideas = {idea: sum(agent.bet_on_ideas[idea] for agent in agents) for idea in ideas}

        for agent in agents:
            action, idea, expected_values_for_jobs = agent.decide(total_bet_on_ideas, ideas)

            if action == "job":
                chosen_idea = agent.perform_job(jobs_total, total_bet_on_ideas, ideas)
            elif action == "vote":
                chosen_idea = agent.perform_vote(jobs_total, votes_total, total_bet_on_ideas, ideas,vote_discount_rate,vote_minimum)
            else:
                chosen_idea = "none"

            agent.update_expectation_coefficients(votes_total, update_factor)
            agent.update_tokens_based_on_history(votes_total,token_update_rate)
            
            # ログデータを更新
            log_data = {
                "iteration":iteration_count,
                "agent": agent.id,
                "action": action,
                "idea": chosen_idea[0],
                "value": chosen_idea[1],
                "jobs_total": copy.deepcopy(jobs_total),
                "votes_total": copy.deepcopy(votes_total), 
                "bet_on_ideas":agent.bet_on_ideas,
                "token": agent.token,
                "expected_values_for_jobs": expected_values_for_jobs,
                "job_costs": agent.job_costs
            }
            log_all.append(log_data)    
        iteration_count += 1
    print("✅logall", log_all[0])
    return {"log": log_all}
