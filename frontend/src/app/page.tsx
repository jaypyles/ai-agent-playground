"use client";

import { useState, useEffect } from "react";
import { JobHistory } from "@/components/job-history/job-history";

export default function Home() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [task, setTask] = useState<string>("");
  const [shownJobId, setShownJobId] = useState<string | null>(null);

  const getJobOutput = (object: any) => {
    const output = object.data.output;
    const history = output?.history;

    if (history) {
      const lastHistory = history.at(-1);
      const lastResult = lastHistory?.result;
      return lastResult?.at(-1)?.extracted_content ?? "No output available";
    }

    if (object.data.progressive_output) {
      return object.data.progressive_output;
    }

    return "No output available";
  };

  const addJob = async () => {
    const response = await fetch("http://localhost:8000/api/agent", {
      method: "POST",
      body: JSON.stringify({ task }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    setTask("");
    setJobs((prevJobs) => [
      ...prevJobs,
      {
        task_id: data.job_id,
        status: "pending",
        data: { task },
        created_at: data.created_at,
      },
    ]);
  };

  const getJobs = async () => {
    const response = await fetch(`http://localhost:8000/api/agent`);
    const data = await response.json();
    const sortedJobs = data.jobs.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
    setJobs(sortedJobs);
  };

  const handleJobClick = (jobId: string) => {
    if (shownJobId === jobId) {
      setShownJobId(null);
    } else {
      setShownJobId(jobId);
    }
  };

  const clearJobs = async () => {
    await fetch("http://localhost:8000/api/agent/delete", {
      method: "GET",
    });

    setJobs([]);
  };

  useEffect(() => {
    getJobs();

    const interval = setInterval(() => {
      getJobs();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setShownJobId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-800 to-purple-800 p-8 flex items-center justify-center">
      <main className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl max-h-[80vh] flex flex-col justify-between">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI Agent Playground
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Enter a task for the AI agent to process and view the results.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-6 mb-6 w-full">
          <div className="flex flex-col gap-4 w-full">
            <input
              className="p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="text"
              placeholder="Enter task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
            <button
              onClick={addJob}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Add Task
            </button>
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[40vh]">
          {jobs.map((job) => (
            <div
              className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col gap-2"
              key={job.task_id}
            >
              <div className="flex flex-row justify-between">
                <span
                  className="font-semibold cursor-pointer"
                  style={{
                    color: shownJobId === job.task_id ? "blue" : "indigo",
                  }}
                  onClick={() => handleJobClick(job.task_id)}
                >
                  {job.task_id}
                </span>
                <span className="text-gray-600">
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>

              <span className="text-gray-800">Task: {job.data.task}</span>
              <div className="text-gray-600">
                <strong>Output:</strong> {getJobOutput(job)}
              </div>

              {job.data.has_csv && (
                <button
                  onClick={async () => {
                    const response = await fetch(
                      `http://localhost:8000/api/agent/csv/${job.task_id}`
                    );
                    const data = await response.json();
                    const blob = new Blob([data.csv], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${job.task_id}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                  }}
                  className="text-blue-500"
                >
                  Download CSV
                </button>
              )}

              <JobHistory
                output={job.data.output}
                jobId={job.task_id}
                open={
                  shownJobId === job.task_id &&
                  getJobOutput(job) !== "No output available"
                }
              />
            </div>
          ))}
        </div>

        {/* Trash button in the top-right corner */}
        <button
          onClick={clearJobs}
          className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-6 h-6"
          >
            <path d="M3 6h18M4 6l1 14h14l1-14H4zm3 0V4a3 3 0 1 1 6 0v2m3 0V4a3 3 0 1 1 6 0v2"></path>
          </svg>
        </button>
      </main>
    </div>
  );
}
