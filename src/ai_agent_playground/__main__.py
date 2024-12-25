from .HeadlessAgent import HeadlessAgent
import asyncio


async def main():
    task = "Get the current weather for Christmas day in Brimingham, AL. Next, find what activities are happening in the area."
    agent = HeadlessAgent(task=task)
    result = await agent.run()
    print(result)


asyncio.run(main())
