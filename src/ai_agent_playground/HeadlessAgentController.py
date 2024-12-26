from browser_use import Controller
from ai_agent_playground.job_queue import COMMAND_QUEUE
from pydantic import BaseModel
import csv
import json
import os

controller = Controller()


class TaskStepTaken(BaseModel):
    task_step: str


class SaveCsvParams(BaseModel):
    rows_as_json: list[str]


@controller.registry.action("Update database", param_model=TaskStepTaken)
async def update_database(params: TaskStepTaken):
    job = COMMAND_QUEUE.get_all({"status": "running"})[0]
    job.data["progressive_output"] = params.task_step
    COMMAND_QUEUE.update(job)


@controller.registry.action("Save csv", param_model=SaveCsvParams)
async def save_csv(params: SaveCsvParams):
    job = COMMAND_QUEUE.get_all({"status": "running"})[0]
    rows: list[list[str]] = []

    for row in params.rows_as_json:
        rows.append(list(json.loads(row).values()))

    os.makedirs("outputs", exist_ok=True)

    with open(f"outputs/{job.task_id}.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(list(json.loads(params.rows_as_json[0]).keys()))

        for row in rows:
            writer.writerow(row)

    job.data["has_csv"] = True
    COMMAND_QUEUE.update(job)

    return "Saved job to file"
