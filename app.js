import express from "express";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "your_secret_key"; // Replace with your own secret key

// Dummy user data (for demonstration purposes)
const users = [
  { id: 1, username: "user1", password: "password1" },
  { id: 2, username: "user2", password: "password2" },
];

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Dummy task and subtask data (for demonstration purposes)
let tasks = [];
let subtasks = [];

// Routes

// Create task
app.post("/task", authenticateToken, (req, res) => {
  const { title, description, due_date } = req.body;
  // Validation
  if (!title || !description || !due_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  // Create task
  const newTask = {
    id: tasks.length + 1,
    title,
    description,
    due_date,
    status: "TODO",
    user_id: req.user.id,
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Create subtask
app.post("/subtask", authenticateToken, (req, res) => {
  const { task_id } = req.body;
  // Validation
  if (!task_id || !tasks.find((task) => task.id === task_id)) {
    return res.status(400).json({ error: "Invalid task_id" });
  }
  // Create subtask
  const newSubtask = { id: subtasks.length + 1, task_id, status: 0 };
  subtasks.push(newSubtask);
  res.status(201).json(newSubtask);
});

// Get all user tasks
app.get("/tasks", authenticateToken, (req, res) => {
  const userTasks = tasks.filter((task) => task.user_id === req.user.id);
  // Apply filters if provided
  // Pagination logic here
  res.json(userTasks);
});

// Get all user subtasks
app.get("/subtasks", authenticateToken, (req, res) => {
  const { task_id } = req.query;
  if (!task_id || !tasks.find((task) => task.id === task_id)) {
    return res.status(400).json({ error: "Invalid task_id" });
  }
  const taskSubtasks = subtasks.filter(
    (subtask) => subtask.task_id === task_id
  );
  res.json(taskSubtasks);
});

// Update task
app.put("/task/:id", authenticateToken, (req, res) => {
  const taskId = parseInt(req.params.id);
  const { due_date, status } = req.body;
  // Validation
  if (!due_date && !status) {
    return res.status(400).json({ error: "No update fields provided" });
  }
  let task = tasks.find((task) => task.id === taskId);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  if (due_date) {
    task.due_date = due_date;
  }
  if (status) {
    task.status = status;
  }
  // Update corresponding subtasks
  // Logic to update task status
  res.json(task);
});

// Update subtask
app.put("/subtask/:id", authenticateToken, (req, res) => {
  const subtaskId = parseInt(req.params.id);
  const { status } = req.body;
  // Validation
  if (status === undefined) {
    return res.status(400).json({ error: "No update fields provided" });
  }
  let subtask = subtasks.find((subtask) => subtask.id === subtaskId);
  if (!subtask) {
    return res.status(404).json({ error: "Subtask not found" });
  }
  subtask.status = status;
  res.json(subtask);
});

// Delete task (soft deletion)
app.delete("/task/:id", authenticateToken, (req, res) => {
  const taskId = parseInt(req.params.id);
  let task = tasks.find((task) => task.id === taskId);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  // Soft delete logic
  res.sendStatus(204);
});

// Delete subtask (soft deletion)
app.delete("/subtask/:id", authenticateToken, (req, res) => {
  const subtaskId = parseInt(req.params.id);
  let subtask = subtasks.find((subtask) => subtask.id === subtaskId);
  if (!subtask) {
    return res.status(404).json({ error: "Subtask not found" });
  }
  // Soft delete logic
  res.sendStatus(204);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
