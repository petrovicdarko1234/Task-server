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

let path: string = "tasks.json"
readFromPath(path)

let tasks: Task[] = []
let n = 0

//GET
app.get("/api/task", (req, resp) => {
    resp.send(tasks)
})

//Create
app.use(express.json());

app.post("/api/task", (req, resp) => {


    let newTask: Task = {
        Id: n++,
        Description: req.body.Description,
        Completed: false
    }
    tasks.push(newTask)
    writeToPath(path, JSON.stringify(tasks))
    //always have to send something
    resp.send({})
})
//Update
app.put("/api/task/:id", (req, resp) => {

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].Id == parseInt(req.params.id)) {
            tasks[i].Description = req.body.Description
        }
    }
    writeToPath(path, JSON.stringify(tasks))
    resp.send({})
})

//do/Undo
app.put("/api/doTask/:id", (req, resp) => {
    console.log("PUT: ", req.body)
    console.log("ID: ", parseInt(req.params.id))

    for (let i = 0; i < tasks.length; i++) {
        if (parseInt(req.params.id) == tasks[i].Id) {
            tasks[i].Completed = true
        }
    }
    writeToPath(path, JSON.stringify(tasks))
    //always have to send something
    resp.send({})
})
app.put("/api/undoTask/:id", (req, resp) => {
    console.log("PUT: ", req.body)
    console.log("ID: ", parseInt(req.params.id))

    for (let i = 0; i < tasks.length; i++) {
        if (parseInt(req.params.id) == tasks[i].Id) {
            tasks[i].Completed = false
        }
    }
    writeToPath(path, JSON.stringify(tasks))
    //always have to send something
    resp.send({})
})
//delete one
app.delete("/api/task/:id", (req, resp) => {
    let taskId = parseInt(req.params.id)
    let newTasks = []
    let n = 0
    for (let i = 0; i < tasks.length; i++) {
        if (taskId == tasks[i].Id) {
            continue
        } else {
            newTasks[n++] = tasks[i]
        }
    }
    tasks = newTasks
    writeToPath(path, JSON.stringify(tasks))
    resp.send({})
})
//delete all
app.delete("/api/deleteAllTask", function (req, resp) {
    tasks = []
    writeToPath(path, JSON.stringify(tasks))

    resp.send({})
})

async function readFromPath(path: string) {
    const content = await readFile(path, "utf-8")

    //do something with content...

    //to parse json use
    //Converts a JavaScript Object Notation (JSON) string into an object.
    tasks = JSON.parse(content) as Task[]
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
