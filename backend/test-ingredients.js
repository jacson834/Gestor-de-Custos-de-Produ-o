// backend/test-ingredients.js
// Script para testar a criação da tabela ingredients

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./estoque.sqlite', (err) => {
  if (err) {
    console.error("Erro ao abrir o banco de dados:", err.message);
    return;
  }
  console.log("Conectado ao banco de dados SQLite.");
  
  // Verificar se a tabela ingredients existe
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='ingredients'", (err, row) => {
    if (err) {
      console.error("Erro ao verificar tabela:", err.message);
      return;
    }
    
    if (row) {
      console.log("✅ Tabela 'ingredients' existe!");
      
      // Testar inserção
      const testData = {
        name: 'Teste Ingrediente',
        unit: 'kg',
        unit_price: 5.50,
        supplier_info: 'Fornecedor Teste'
      };
      
      const sql = `INSERT INTO ingredients (name, unit, unit_price, supplier_info) VALUES (?, ?, ?, ?)`;
      
      db.run(sql, [testData.name, testData.unit, testData.unit_price, testData.supplier_info], function(err) {
        if (err) {
          console.error("❌ Erro ao inserir ingrediente:", err.message);
        } else {
          console.log("✅ Ingrediente inserido com sucesso! ID:", this.lastID);
          
          // Buscar ingredientes
          db.all("SELECT * FROM ingredients", (err, rows) => {
            if (err) {
              console.error("❌ Erro ao buscar ingredientes:", err.message);
            } else {
              console.log("✅ Ingredientes encontrados:", rows.length);
              console.log(rows);
            }
            db.close();
          });
        }
      });
    } else {
      console.log("❌ Tabela 'ingredients' NÃO existe!");
      
      // Criar a tabela
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ingredients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          unit TEXT NOT NULL,
          unit_price REAL NOT NULL,
          supplier_info TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      db.run(createTableSQL, (err) => {
        if (err) {
          console.error("❌ Erro ao criar tabela:", err.message);
        } else {
          console.log("✅ Tabela 'ingredients' criada com sucesso!");
        }
        db.close();
      });
    }
  });
});