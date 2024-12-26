from browser_use import Controller
from ai_agent_playground.job_queue import COMMAND_QUEUE
from pydantic import BaseModel

controller = Controller()


class TaskStepTaken(BaseModel):
    task_step: str


@controller.registry.action("Update database", param_model=TaskStepTaken)
async def update_database(params: TaskStepTaken):
    job = COMMAND_QUEUE.get_all({"status": "running"})[0]
    job.data["progressive_output"] = params.task_step
    COMMAND_QUEUE.update(job)
