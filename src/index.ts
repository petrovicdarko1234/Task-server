import express, { Application } from "express";
import cors from "cors"
import { readFile, writeFile } from "fs/promises"

const app: Application = express();

//serviraju se staticki fajlovi iz ovaj folder
//kada odem na localhost:4000 on mi izbaci index.html
//a mogu da odem i na localhost:4000/index.html
//ako kazem window.location.href = "tasks.html" => localhost:4000/tasks.html
//Server radi 2 posla, jedan je kao github pages servira staticki fajlovi (html + js + css + sta god jos)
//A drugi posao je da ima http request response
app.use(express.static("../Tasks/")) //GITHUB PAGES

app.use(cors())

type Task = {
    Id: number
    Description: string
    Completed: boolean
}

type User = {
    Username: string
    Password: string
    Id: number
}
app.use(express.json());
//create User
app.post("/api/create", async function (req, resp) {
    console.log(req.body)
    let n: number

    let users: User[] = await readUsers("users.json")

    if (users.length == 0) {
        n = 0
    } else {
        n = users[users.length - 1].Id + 1
    }

    let newUser = {
        Username: req.body.Username,
        Password: req.body.Password,
        Id: n
    }

    for (let i = 0; i < users.length; i++) {
        if (newUser.Username == users[i].Username) {
            resp.send({ Id: -1 })
            return
        }
    }

    users.push(newUser)
    await writeToPath("users.json", JSON.stringify(users))
    console.log(users)

    writeToPath(n + ".json", "[]")

    resp.send({ Id: newUser.Id })

})
//User
app.post("/api/login", async function (req, resp) {
    console.log(req.body)
    let users: User[] = await readUsers("users.json")

    for (let i = 0; i < users.length; i++) {
        if (req.body.Username == users[i].Username && req.body.Password == users[i].Password) {
            resp.send({ Id: users[i].Id })
            return
        }
    }
    resp.send({ Id: -1 })
})
// GET username
app.get("/api/username/:userID", async function (req, resp) {
    console.log(req.body)
    let users: User[] = await readUsers("users.json")

    for (let i = 0; i < users.length; i++) {
        if (parseInt(req.params.userID) == users[i].Id) {
            resp.send({ Username: users[i].Username })
            return
        }
    }
})
//GET
app.get("/api/task/:userID", async function (req, resp) {
    let Path: string = ".json"
    try {
        let tasks: Task[] = await readFromPath(req.params.userID + Path)
        resp.send(tasks)
    } catch (e) {
        resp.send({}) //todo wrong user id..
    }
})
//Create

app.post("/api/task/:userID", async function (req, resp) {

    let tasks: Task[] = []

    let path: string = ".json"
    tasks = await readFromPath(req.params.userID + path)

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
    await writeToPath(req.params.userID + path, JSON.stringify(tasks))
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
async function readUsers(path: string): Promise<User[]> {
    const content = await readFile(path, "utf-8")


    let user = JSON.parse(content) as User[]
    return user
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
