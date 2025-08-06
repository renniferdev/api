import express from "express";

const app = express();
app.use(express.json());

const users = [];

app.post("/usuarios", (req, res) => {
  users.push(req.body); //salvando os usuarios

  res.status(201).json(req.body); //retornando o usuario criado, alem de criar mostra o que foi criado
});

app.get("/usuarios", (req, res) => {
  res.status(200).json(users); //json com todos meus usuarios
});

app.listen(3000);
