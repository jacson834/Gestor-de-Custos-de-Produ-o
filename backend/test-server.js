// backend/test-server.js
// Servidor de teste simples para ingredientes

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./estoque.sqlite');

// Rota de teste simples
app.get('/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});

// Rota de ingredientes
app.get('/api/ingredients', (req, res) => {
  console.log('GET /api/ingredients chamado');
  db.all("SELECT * FROM ingredients ORDER BY name ASC", [], (err, rows) => {
    if (err) {
      console.error('Erro na consulta:', err.message);
      return res.status(400).json({ "error": err.message });
    }
    console.log('Ingredientes encontrados:', rows.length);
    res.json({ data: rows });
  });
});

app.post('/api/ingredients', (req, res) => {
  console.log('POST /api/ingredients chamado com:', req.body);
  const { name, unit, unit_price, supplier_info } = req.body;
  
  if (!name || !unit || !unit_price || unit_price <= 0) {
    return res.status(400).json({ error: "Dados inválidos" });
  }
  
  const sql = `INSERT INTO ingredients (name, unit, unit_price, supplier_info) VALUES (?, ?, ?, ?)`;
  
  db.run(sql, [name, unit, unit_price, supplier_info || null], function(err) {
    if (err) {
      console.error('Erro ao inserir:', err.message);
      return res.status(400).json({ error: err.message });
    }
    console.log('Ingrediente criado com ID:', this.lastID);
    res.status(201).json({ id: this.lastID, message: "Ingrediente criado com sucesso." });
  });
});

app.listen(port, () => {
  console.log(`Servidor de teste rodando em http://localhost:${port}`);
});