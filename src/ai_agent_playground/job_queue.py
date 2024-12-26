from pytask import Queue, SQLDataType

COMMAND_QUEUE = Queue(
    [
        ("task", SQLDataType.TEXT, []),
        ("progressive_output", SQLDataType.TEXT, []),
        ("output", SQLDataType.JSON, []),
    ],
    path="./data/jobs.db",
)
