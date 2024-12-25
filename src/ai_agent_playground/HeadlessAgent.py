from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, BrowserConfig
from dotenv import load_dotenv


class HeadlessAgent:
    def __init__(self, task: str):
        _ = load_dotenv()

        self.task: str = task
        self.browser: Browser = Browser(config=BrowserConfig(headless=True))
        self.agent: Agent = Agent(
            task=task,
            llm=ChatOpenAI(model="gpt-4o-mini"),
            browser=self.browser,
        )

    async def run(self):
        return await self.agent.run()
