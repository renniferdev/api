import express from "express";
import cors from "cors";
import { PrismaClient } from "./generated/prisma/index.js";

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors());

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
  let users = [];

  if (req.query) {
    users = await prisma.user.findMany({
      where: {
        name: req.query.name,
        email: req.query.email,
        age: req.query.age,
      },
    });
  } else {
    users = await prisma.user.findMany();
  }

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

app.delete("/usuarios/:id", async (req, res) => {
  await prisma.user.delete({
    where: {
      id: req.params.id, // converte para número
    },
  });

  res.status(200).json({ message: "Usuário deletado com sucesso!" });
});

app.listen(3000);

/*
rennifer
wnGDzNk2zXNefzmK
*/
