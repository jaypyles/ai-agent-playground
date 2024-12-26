import json
from fastapi import FastAPI
from .job_queue import COMMAND_QUEUE
from pytask import Job
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .logging import LOG

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TaskRequest(BaseModel):
    task: str


@app.post("/api/agent")
def add_job(task: TaskRequest):
    job = Job()
    job.data = {
        "task": task.task,
        "progressive_output": "",
        "output": {},
        "has_csv": False,
    }

    print("Job ", job)

    COMMAND_QUEUE.insert(job)
    return {"job_id": job.task_id}


@app.get("/api/agent")
def get_all_jobs():
    return {"jobs": COMMAND_QUEUE.get_all()}


@app.get("/api/agent/delete")
def delete_job():
    jobs = COMMAND_QUEUE.get_all()

    for job in jobs:
        LOG.info(f"Deleting job {job.task_id}")
        _ = COMMAND_QUEUE.delete(job.task_id)

    return {"message": "Jobs deleted"}


@app.get("/api/agent/{job_id}")
def get_job(job_id: str):
    job = COMMAND_QUEUE.get(job_id)

    if job is None:
        return {"error": "Job not found"}

    output = json.loads(job.data["output"])
    return {"job_id": job.task_id, "output": output}


@app.get("/api/agent/status")
def get_status():
    return {"status": "ok"}


@app.get("/api/agent/csv/{job_id}")
def get_csv(job_id: str):
    return {"csv": open(f"outputs/{job_id}.csv", "r").read()}
