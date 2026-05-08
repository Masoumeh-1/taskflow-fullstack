require('dotenv').config();   
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const { MongoClient, ObjectId } = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri); 
const exphbs = require('express-handlebars');
const express = require('express');
const cors = require('cors'); // Import the CORS middleware -this is for react frontend to access the backend without CORS issues
const app = express();
app.use(cors()); // Enable CORS for all routes 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars'); 
const port = process.env.PORT || 5000; 
let tasks=[]; 
let notes = [];

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/about', (req, res) => {
  res.send('This is the about page');
});

app.get('/tasks', (req, res) => { 
  res.render('tasks', { tasks: tasks });
});

app.get('/api/tasks/:userId', async (req, res) => {
  const userId = req.params.userId;

  const userTasks = await tasksCollection.find({ userId: userId }).toArray();

  res.json(userTasks);
});

app.get('/delete-task/:index', (req, res) => {
  const index = req.params.index;
  tasks.splice(index, 1);
  res.redirect('/tasks');
});

app.delete('/api/tasks/:id', async (req, res) => {
  const id = req.params.id;

  await tasksCollection.deleteOne({ _id: new ObjectId(id) });

  res.json({ message: "Task deleted" });
});

app.get('/done-task/:index', (req, res) => {
  const index = req.params.index;
  tasks[index].done = true;
  console.log(tasks);
  res.redirect('/tasks');
});

app.put('/api/tasks/:id', async (req, res) => {
  const id = req.params.id;

  const task = await tasksCollection.findOne({ _id: new ObjectId(id) });

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const newDoneStatus = !task.done;

  await tasksCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { done: newDoneStatus } }
  );

  const updatedTask = await tasksCollection.findOne({ _id: new ObjectId(id) });

  res.json(updatedTask);
});

app.get('/edit-task/:index', (req, res) => {
  const index = req.params.index;

  if (!tasks[index]) {
    return res.send('Task not found');
  }

  res.render('edit-task', {
    index: index,
    task: tasks[index]
  });
});

app.get('/add-note', (req, res) => {
  res.render('add-note');
});


app.post('/add-task', (req, res) => { // This is for the form submission from the add-task page
  const taskText = req.body.task;

  if (taskText.trim() === "") {
    return res.redirect('/add-task');
  }

  const newTask = {
    text: taskText,
    done: false
  };

  tasks.push(newTask);
  res.redirect('/tasks');
});

app.post('/api/tasks', async (req, res) => {
  const { text, priority, userId } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Task is empty" }); 
  }

  const newTask = {
    text: text,
    done: false,
    priority: priority || "Medium",
    userId: userId
  };

  const result = await tasksCollection.insertOne(newTask);

  res.json({
    _id: result.insertedId,
    ...newTask
  });
});


app.get('/add-task', (req, res) => {
  res.render('add-task');
});

app.post('/edit-task/:index', (req, res) => {
  const index = req.params.index;
  const updatedText = req.body.updatedTask;

  if (updatedText.trim() === "") {
    return res.redirect(`/edit-task/${index}`);
  }

  tasks[index].text = updatedText;

  res.redirect('/tasks');
});


app.patch('/api/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Task text is empty" });
  }

  await tasksCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { text: text } }
  );

  const updatedTask = await tasksCollection.findOne({ _id: new ObjectId(id) });

  res.json(updatedTask);
});


app.post('/add-note', (req, res) => {
  const noteText = req.body.note;

  if (noteText.trim() === "") {
    return res.redirect('/add-note');
  }

  notes.push(noteText);

  res.redirect('/notes');
});

app.get('/notes', (req, res) => {
  res.render('notes', { notes: notes });
});


let db; // main database (taskDB)
let tasksCollection; // collection for storing tasks
let usersCollection; // collection for storing users (login system)

async function connectDB() {
  await client.connect();
  db = client.db("taskDB");
  tasksCollection = db.collection("tasks");
  usersCollection = db.collection("users");
  console.log("Connected to MongoDB");
}

connectDB();


app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const existingUser = await usersCollection.findOne({ username: username });

  if (existingUser) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    username: username,
    password: hashedPassword
  };

  await usersCollection.insertOne(newUser);

  res.json({ message: "User created successfully" });
});


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await usersCollection.findOne({ username: username });

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ error: "Wrong password" });
  }

  res.json({ message: "Login successful", userId: user._id });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}); 