const express = require('express');
const app = express();
const port = 3000;

// Damit Express JSON-Anfragen verarbeiten kann
app.use(express.json());

// Beispielhafte To-Do-Liste im Speicher
let todos = [
  { id: 1, text: 'Einkaufen gehen' },
  { id: 2, text: 'Express.js lernen' }
];

// 📌 GET /todos – alle To-Dos anzeigen
app.get('/todos', (req, res) => {
  res.json(todos);
});

// 📌 POST /todos – neues To-Do hinzufügen
app.post('/todos', (req, res) => {
  const newTodo = {
    id: Date.now(), // einfache ID
    text: req.body.text
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// 📌 DELETE /todos/:id – To-Do löschen
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(todo => todo.id !== id);
  res.status(204).send(); // 204 = No Content
});

// Server starten
app.listen(port, () => {
  console.log(`✅ Server läuft auf http://localhost:${port}`);
});
