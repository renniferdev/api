import express from "express";
import { PrismaClient } from "./generated/prisma/index.js";

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

app.post("/usuarios", async (req, res) => {
  await prisma.user.create({
    data: {
      email: req.body.email,
      name: req.body.name,
      age: req.body.age,
    },
  });

  res.status(201).json(req.body); //retornando o usuario criado, alem de criar mostra o que foi criado
});

app.get("/usuarios", async (req, res) => {
  const users = await prisma.user.findMany();

  res.status(200).json(users); //json com todos meus usuarios
});

app.put("/usuarios/:id", async (req, res) => {
  console.log(req);
  await prisma.user.update({
    where: {
      id: req.params.id, //pega o id do usuario que quero atualizar
    },
    data: {
      email: req.body.email,
      name: req.body.name,
      age: req.body.age,
    },
  });

  res.status(201).json(req.body); //retornando o usuario criado, alem de criar mostra o que foi criado
});

app.listen(3000);

/*
rennifer
wnGDzNk2zXNefzmK
*/
