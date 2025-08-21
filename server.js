import express from "express";
import cors from "cors";
import { PrismaClient } from "./generated/prisma/index.js";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

// ========== [POST] Criar novo usuário ==========
app.post("/usuarios", async (req, res, next) => {
  const { email, name, age, password } = req.body;

  if (!email || !name || !password)
    return res
      .status(400)
      .json({ error: "Email, nome e senha são obrigatórios" });

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser)
    return res.status(400).json({ error: "Email já cadastrado" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      age: age ? String(age) : null, // Salva como string
      password: hashedPassword,
    },
  });

  res
    .status(201)
    .json({ id: user.id, email: user.email, name: user.name, age: user.age });
});

// ========== [POST] Login de usuário ==========
app.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email e senha são obrigatórios" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: "Email ou senha inválidos" });

  res.status(200).json({
    message: "Login realizado com sucesso",
    user: { id: user.id, email: user.email, name: user.name, age: user.age },
  });
});

// ========== [GET] Listar usuários (com paginação e filtro) ==========
app.get("/usuarios", async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
    // Filtra apenas usuários com age string ou null
    const validUsers = users.filter(
      (u) => typeof u.age === "string" || u.age === null
    );
    res.json(validUsers);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// ========== [GET] Buscar usuário por ID ==========
app.get("/usuarios/:id", async (req, res, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  res.json(user);
});

// ========== [PUT] Atualizar usuário por ID ==========
app.put("/usuarios/:id", async (req, res, next) => {
  const { email, name, age, password } = req.body;
  const existingUser = await prisma.user.findUnique({
    where: { id: req.params.id },
  });
  if (!existingUser)
    return res.status(404).json({ error: "Usuário não encontrado" });

  if (email && email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) return res.status(400).json({ error: "Email já em uso" });
  }

  const data = { email, name, age: age ? String(age) : undefined };
  if (password) data.password = await bcrypt.hash(password, 10);

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data,
  });
  res.json(updated);
});

// ========== [DELETE] Deletar usuário por ID ==========
app.delete("/usuarios/:id", async (req, res, next) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: req.params.id },
  });
  if (!existingUser)
    return res.status(404).json({ error: "Usuário não encontrado" });

  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({
    message: "Usuário deletado com sucesso!",
    deletedUser: existingUser,
  });
});

// ========== [GET] Health check ==========
app.get("/health", async (req, res, next) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ========== [MIDDLEWARES] ==========
app.use((err, req, res, next) => {
  console.error("Erro:", err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

app.use((req, res) => res.status(404).json({ error: "Rota não encontrada" }));

// ---------------- Start ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
