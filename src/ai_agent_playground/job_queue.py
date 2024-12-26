from pytask import Queue, SQLDataType

COMMAND_QUEUE = Queue(
    [
        ("task", SQLDataType.TEXT, []),
        ("progressive_output", SQLDataType.TEXT, []),
        ("has_csv", SQLDataType.BOOLEAN, []),
        ("output", SQLDataType.JSON, []),
    ],
    path="./data/jobs.db",
)
