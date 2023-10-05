import express, { Application } from "express";
import cors from "cors"
import { readFile, writeFile } from "fs/promises"

const app: Application = express();

app.use(cors())

type Task = {
    Id: number
    Description: string
    Completed: boolean
}

//GET
app.get("/api/task/:userID", async function draw(req, resp) {
    let Path: string = ".json"
    let tasks: Task[] = await readFromPath(req.params.userID + Path)
    resp.send(tasks)
})

//Create
app.use(express.json());

app.post("/api/task/:userID", async function (req, resp) {

    let Path: string = ".json"
    let tasks: Task[] = await readFromPath(req.params.userID + Path)
    let n: number
    if (tasks.length == 0) {
        n = 0
    } else {
        n = tasks[tasks.length - 1].Id + 1
    }

    let newTask: Task = {
        Id: n,
        Description: req.body.Description,
        Completed: false
    }
    tasks.push(newTask)
    await writeToPath(req.params.userID + Path, JSON.stringify(tasks))
    //always have to send something
    resp.send({})
})
//Update
app.put("/api/task/:userID/:id", async function (req, resp) {
    let Path: string = ".json"
    let tasks: Task[] = await readFromPath(req.params.userID + Path)

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].Id == parseInt(req.params.id)) {
            tasks[i].Description = req.body.Description
        }
    }
    writeToPath(req.params.userID + Path, JSON.stringify(tasks))
    resp.send({})
})

//do/Undo
app.put("/api/doTask/:userID/:id", async function (req, resp) {
    let Path: string = ".json"
    let tasks: Task[] = await readFromPath(req.params.userID + Path)

    for (let i = 0; i < tasks.length; i++) {
        if (parseInt(req.params.id) == tasks[i].Id) {
            tasks[i].Completed = true
        }
    }
    writeToPath(req.params.userID + Path, JSON.stringify(tasks))
    //always have to send something
    resp.send({})
})
app.put("/api/undoTask/:userID/:id", async function (req, resp) {

    let Path: string = ".json"
    let tasks: Task[] = await readFromPath(req.params.userID + Path)


    for (let i = 0; i < tasks.length; i++) {
        if (parseInt(req.params.id) == tasks[i].Id) {
            tasks[i].Completed = false
        }
    }
    await writeToPath(req.params.userID + Path, JSON.stringify(tasks))
    //always have to send something
    resp.send({})
})
//delete one
app.delete("/api/task/:userID/:id", async function (req, resp) {

    let Path: string = ".json"
    let tasks: Task[] = await readFromPath(req.params.userID + Path)

    let taskId = parseInt(req.params.id)
    console.log(taskId, req.params.userID)
    let newTasks: Task[] = []
    let n = 0
    for (let i = 0; i < tasks.length; i++) {
        if (taskId == tasks[i].Id) {
            continue
        } else {
            newTasks[n++] = tasks[i]
        }
    }
    tasks = newTasks

    console.log(JSON.stringify(tasks))
    await writeToPath(req.params.userID + Path, JSON.stringify(tasks))
    resp.send({})
})
//delete all
app.delete("/api/deleteAllTask/:userID", async function (req, resp) {
    let Path: string = ".json"
    let tasks: Task[] = []
    await writeToPath(req.params.userID + Path, JSON.stringify(tasks))

    resp.send({})
})

async function readFromPath(path: string): Promise<Task[]> {
    const content = await readFile(path, "utf-8")

    //do something with content...

    //to parse json use
    //Converts a JavaScript Object Notation (JSON) string into an object.
    let tasks = JSON.parse(content) as Task[]
    return tasks
}

async function writeToPath(path: string, content: string) {
    await writeFile(path, content, "utf-8")
}
// server
const PORT = 4000

app
    .listen(PORT, function () {
        console.log(`Server is running on port ${PORT}.`);
    })
    .on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
            console.log("Error: address already in use");
        } else {
            console.log(err);
        }
    });
