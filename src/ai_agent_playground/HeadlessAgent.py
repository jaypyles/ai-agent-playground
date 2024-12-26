from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, BrowserConfig, SystemPrompt
from dotenv import load_dotenv
from ai_agent_playground.HeadlessAgentController import controller
from typing_extensions import override


class HeadlessAgentSystemPrompt(SystemPrompt):
    @override
    def important_rules(self) -> str:
        existing_rules = super().important_rules()
        new_rules = "Remember the most important rule: ALWAYS attempt to update the database in between steps before completing the task!!!! Your final response should be about the task, not updating the database."
        return f"{existing_rules}\n{new_rules}"


class HeadlessAgent:
    def __init__(self, task: str):
        _ = load_dotenv()
        self.system_prompt: str = (
            "Update the internal database to show progress after each step. This means after visiting url, after collecting content, etc, your next action will always be to update the database, except for after completing the task."
        )
        self.task: str = f"{task}. {self.system_prompt}"
        self.browser: Browser = Browser(config=BrowserConfig(headless=True))
        self.agent: Agent = Agent(
            task=self.task,
            llm=ChatOpenAI(model="gpt-4o-mini"),
            browser=self.browser,
            controller=controller,
            system_prompt_class=HeadlessAgentSystemPrompt,
        )

    async def run(self):
        return await self.agent.run()
