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

    refreshed_job = COMMAND_QUEUE.get(job.task_id)

    if refreshed_job:
        job.data = {
            **refreshed_job.data,
            "output": output.model_dump(),
        }


async def main():
    worker = AsyncWorker(COMMAND_QUEUE, worker_func, logger=LOG)
    await worker.run()


if __name__ == "__main__":
    LOG.info("Starting worker...")
    asyncio.run(main())
