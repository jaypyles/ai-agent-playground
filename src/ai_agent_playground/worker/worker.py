import asyncio

from pytask import Job, AsyncWorker
from ai_agent_playground.HeadlessAgent import HeadlessAgent
from ai_agent_playground.job_queue import COMMAND_QUEUE
from ai_agent_playground.logging import LOG


async def worker_func(job: Job):
    task = job.data["task"]
    agent = HeadlessAgent(task)
    output = await agent.run()

    print("The job data is ", job.data)

    job.data = {
        "output": output.model_dump(),
        "progressive_output": job.data["progressive_output"],
    }


async def main():
    worker = AsyncWorker(COMMAND_QUEUE, worker_func, logger=LOG)
    await worker.run()


if __name__ == "__main__":
    LOG.info("Starting worker...")
    asyncio.run(main())
