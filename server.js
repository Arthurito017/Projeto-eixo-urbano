const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
const port = 3000;

// Configuração do banco de dados
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Substitua pelo seu usuário do MySQL
  password: "", // Substitua pela sua senha do MySQL
  database: "user_management",
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    return;
  }
  console.log("Conectado ao banco de dados MySQL!");
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('cors')());
app.use(cors());

// Endpoint para cadastro
app.post("/register", async (req, res) => {
  const { full_name, email, password, telefone, cpf, user_type } = req.body;

  // Validação básica dos campos
  if (!full_name || !email || !password || !telefone || !cpf || !user_type) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios!" });
  }

  // Validação do tipo de usuário
  if (!["locador", "locatario"].includes(user_type)) {
    return res.status(400).json({ message: "Tipo de usuário inválido!" });
  }

  try {
    // Criptografar a senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Inserir no banco de dados
    const query = `
      INSERT INTO users (full_name, email, password_hash, telefone, cpf, user_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [full_name, email, passwordHash, telefone, cpf, user_type], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "O CPF ou email informado já está cadastrado." });
        }
        console.error("Erro ao inserir dados:", err);
        return res.status(500).json({ message: "Erro ao cadastrar usuário." });
      }
      res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao processar a solicitação." });
  }
});


// Endpoint para login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios!" });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Erro ao buscar usuário:", err);
      return res.status(500).json({ message: "Erro ao realizar login." });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    const user = results[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    res.status(200).json({
      message: "Login realizado com sucesso!",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        telefone: user.telefone,
        cpf: user.cpf,
        user_type: user.user_type,
        created_at: user.created_at,
      },
    });
  });
});




// Endpoint  para vizualizar Usuários

app.get("/users", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  if (isNaN(page) || isNaN(limit)) {
    return res.status(400).json({ message: "Page e limit devem ser números válidos." });
  }

  if (page && limit) {
    // Caso exista paginação
    const offset = (page - 1) * limit;

    console.log(`Recebida requisição para página: ${page}, limite: ${limit}`); // Log para depuração

    const query = "SELECT id, full_name, email, telefone, cpf, user_type, created_at FROM users LIMIT ? OFFSET ?";
    const countQuery = "SELECT COUNT(*) AS total FROM users";

    db.query(query, [limit, offset], (err, results) => {
      if (err) {
        console.error("Erro ao buscar usuários:", err);
        return res.status(500).json({ message: "Erro ao buscar usuários." });
      }

      db.query(countQuery, (err, countResult) => {
        if (err) {
          console.error("Erro ao contar usuários:", err);
          return res.status(500).json({ message: "Erro ao contar usuários." });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        console.log(`Resultados da página ${page}:`, results); // Log de resultados
        res.status(200).json({ users: results, totalPages });
      });
    });
  } else {
    // Caso não exista paginação, retorna todos os usuários
    const query = "SELECT id, full_name, email, telefone, cpf, created_at FROM users";

    db.query(query, (err, results) => {
      if (err) {
        console.error("Erro ao buscar usuários:", err);
        return res.status(500).json({ message: "Erro ao buscar usuários." });
      }

      console.log("Retornando todos os usuários:", results); // Log para depuração
      res.status(200).json(results);
    });
  }
});


// Endpoint para excluir um usuário
app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;
  const query = "DELETE FROM users WHERE id = ?";

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Erro ao excluir usuário:", err);
      return res.status(500).json({ message: "Erro ao excluir usuário." });
    }

    res.status(200).json({ message: "Usuário excluído com sucesso!" });
  });
});




// Endpoint para editar dados do usuário
app.put("/users/:id", (req, res) => {
  const userId = req.params.id;
  const { full_name, email, telefone, cpf, user_type } = req.body;

  // Log 1: ID do usuário e dados recebidos
  console.log("ID do usuário recebido:", userId);
  console.log("Dados recebidos para atualização:", { full_name, email, telefone, cpf, user_type });

  // Validação dos campos obrigatórios
  if (!full_name || !email || !telefone || !cpf) {
    console.error("Dados incompletos para atualização."); // Log de erro de validação
    return res.status(400).json({ message: "Todos os campos são obrigatórios!" });
  }

  // Validação opcional do user_type
  if (user_type && !["locador", "locatario"].includes(user_type)) {
    console.error("Tipo de usuário inválido:", user_type); // Log de erro de validação
    return res.status(400).json({ message: "Tipo de usuário inválido! Deve ser 'locador' ou 'locatario'." });
  }

  // Montar query dinâmica para incluir user_type apenas se enviado
  let query = `
      UPDATE users 
      SET full_name = ?, email = ?, telefone = ?, cpf = ?
  `;
  const queryParams = [full_name, email, telefone, cpf];

  if (user_type) {
    query += ", user_type = ?";
    queryParams.push(user_type);
  }

  query += " WHERE id = ?"; // Finaliza a query
  queryParams.push(userId);

  // Executa a query de atualização
  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error("Erro ao atualizar usuário:", err); // Log de erro no banco de dados
      return res.status(500).json({ message: "Erro ao atualizar usuário." });
    }

    // Log 2: Resultado da operação no banco
    console.log("Resultado da query:", result);

    // Verifica se o usuário foi realmente atualizado
    if (result.affectedRows === 0) {
      console.warn("Nenhum usuário encontrado para o ID:", userId); // Log de ID inexistente
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    console.log("Usuário atualizado com sucesso para o ID:", userId); // Log de sucesso
    res.status(200).json({ message: "Usuário atualizado com sucesso!" });
  });
});

// Endpoint Buscar dados do usuário
app.get("/users/:id", (req, res) => {
  const { id } = req.params;

  const query = "SELECT id, full_name, email, telefone, cpf, user_type, created_at FROM users WHERE id = ?";
  db.query(query, [id], (err, results) => {
      if (err) {
          console.error("Erro ao buscar usuário:", err);
          return res.status(500).json({ message: "Erro ao buscar usuário." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "Usuário não encontrado." });
      }

      res.status(200).json(results[0]);
  });
});


// Endpoint para filtrar imóveis
app.post("/api/imoveis/filtrar", (req, res) => {
  const { tipo, localidade, quartos, banheiros, areaMin, areaMax, precoMin, precoMax } = req.body;

  // Log de filtros recebidos
  console.log("Filtros recebidos:", req.body);

  // Construção dinâmica da query
  let query = "SELECT * FROM imoveis WHERE 1=1";
  const params = [];

  if (tipo) {
    query += " AND tipo = ?";
    params.push(tipo);
  }
  if (localidade) {
    query += " AND localidade = ?";
    params.push(localidade);
  }
  if (quartos) {
    query += " AND quartos >= ?";
    params.push(quartos);
  }
  if (banheiros) {
    query += " AND banheiros >= ?";
    params.push(banheiros);
  }
  if (areaMin) {
    query += " AND area >= ?";
    params.push(parseFloat(areaMin.replace(",", ".")));
  }
  if (areaMax) {
    query += " AND area <= ?";
    params.push(parseFloat(areaMax.replace(",", ".")));
  }
  if (precoMin) {
    query += " AND preco >= ?";
    params.push(parseFloat(precoMin.replace(",", ".")));
  }
  if (precoMax) {
    query += " AND preco <= ?";
    params.push(parseFloat(precoMax.replace(",", ".")));
  }

  // Executar a query no banco de dados
  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Erro ao buscar imóveis:", err);
      return res.status(500).json({ message: "Erro ao buscar imóveis." });
    }

    // Log de resultados encontrados
    console.log("Imóveis encontrados:", results);

    // Retorna os resultados encontrados
    res.status(200).json(results);
  });
});


// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
