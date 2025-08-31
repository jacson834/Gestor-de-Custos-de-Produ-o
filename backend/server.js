// server.js (VERSÃO FINAL E COMPLETA - COM TODAS AS TABELAS E ROTAS, INCLUINDO EMPLOYEES)

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const CostCalculator = require('./utils/costCalculator');

const app = express();
const port = 3001;

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./estoque.sqlite', (err) => {
  if (err) { return console.error("Erro ao abrir o banco de dados:", err.message); }
  console.log("Conectado ao banco de dados SQLite.");
  db.serialize(() => {
    // Criação de todas as tabelas (garantindo que existam)
    db.run(`CREATE TABLE IF NOT EXISTS produtos (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, costPrice REAL, salePrice REAL, stock INTEGER, minStock INTEGER, category TEXT, barcode TEXT UNIQUE, variations TEXT, priceHistory TEXT, imageUrl TEXT, status TEXT NOT NULL DEFAULT 'active', expirationDate TEXT, localizacao TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS categorias (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE)`, (err) => { 
        if (!err) { 
            db.get("SELECT COUNT(id) as count FROM categorias", (err, row) => { 
                if (row && row.count === 0) { 
                    db.run(`INSERT INTO categorias (name) VALUES ('Padrão')`); 
                } 
            }); 
        } 
    });
    db.run(`CREATE TABLE IF NOT EXISTS clientes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, cpf_cnpj TEXT UNIQUE, email TEXT, phone TEXT, address TEXT, city TEXT, state TEXT, zipCode TEXT, birthDate TEXT)`, (err) => { 
        if (!err) { 
            db.get("SELECT COUNT(id) as count FROM clientes", (err, row) => { 
                if (row && row.count === 0) { 
                    db.run(`INSERT INTO clientes (name) VALUES ('Consumidor Final')`); 
                } 
            }); 
        } 
    });
    db.run(`CREATE TABLE IF NOT EXISTS fornecedores (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, cnpj TEXT UNIQUE, email TEXT, phone TEXT, address TEXT, city TEXT, state TEXT, zipCode TEXT, contactPerson TEXT)`, (err) => { 
        if (!err) { 
            db.get("SELECT COUNT(id) as count FROM fornecedores", (err, row) => { 
                if (row && row.count === 0) { 
                    db.run(`INSERT INTO fornecedores (name, contactPerson, phone, email) VALUES ('Fornecedor Padrão', 'Sr. Silva', '(11) 99999-8888', 'contato@fornecedor.com')`); 
                } 
            }); 
        } 
    });
    
    db.run(`CREATE TABLE IF NOT EXISTS vendas (id INTEGER PRIMARY KEY AUTOINCREMENT, data_venda DATETIME DEFAULT CURRENT_TIMESTAMP, id_cliente INTEGER, nome_cliente TEXT, deliveryDate TEXT, itens_vendidos TEXT, subtotal REAL, desconto_percentual REAL, desconto_valor REAL, total_final REAL, metodo_pagamento TEXT, observacoes TEXT, status TEXT)`);
    
    db.run(`CREATE TABLE IF NOT EXISTS materias_primas (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, unitOfPurchase TEXT, purchasePrice REAL, baseUnit TEXT NOT NULL, totalQuantityInBaseUnit REAL NOT NULL DEFAULT 0, costPerBaseUnit REAL, supplierId INTEGER, FOREIGN KEY (supplierId) REFERENCES fornecedores (id))`);
    db.run(`CREATE TABLE IF NOT EXISTS fichas_tecnicas (id INTEGER PRIMARY KEY AUTOINCREMENT, id_produto_venda INTEGER NOT NULL UNIQUE, nome TEXT, rendimento REAL NOT NULL, unidade_rendimento TEXT NOT NULL, FOREIGN KEY (id_produto_venda) REFERENCES produtos (id) ON DELETE CASCADE)`);
    db.run(`CREATE TABLE IF NOT EXISTS ingredientes_ficha_tecnica (id INTEGER PRIMARY KEY AUTOINCREMENT, id_ficha_tecnica INTEGER NOT NULL, id_materia_prima INTEGER NOT NULL, quantidade REAL NOT NULL, FOREIGN KEY (id_ficha_tecnica) REFERENCES fichas_tecnicas (id) ON DELETE CASCADE, FOREIGN KEY (id_materia_prima) REFERENCES materias_primas (id))`);
    db.run(`CREATE TABLE IF NOT EXISTS producoes (id INTEGER PRIMARY KEY AUTOINCREMENT, data_producao DATETIME DEFAULT CURRENT_TIMESTAMP, id_produto_venda INTEGER NOT NULL, id_ficha_tecnica INTEGER NOT NULL, quantidade_produzida REAL NOT NULL, unidade_produzida TEXT NOT NULL, custo_total_producao REAL, id_usuario INTEGER, FOREIGN KEY (id_produto_venda) REFERENCES produtos (id), FOREIGN KEY (id_ficha_tecnica) REFERENCES fichas_tecnicas (id))`);
    db.run(`CREATE TABLE IF NOT EXISTS movimentacoes_de_estoque (id INTEGER PRIMARY KEY AUTOINCREMENT, data DATETIME DEFAULT CURRENT_TIMESTAMP, id_produto INTEGER NOT NULL, nome_produto TEXT, tipo TEXT NOT NULL, quantidade REAL NOT NULL, custo_unitario REAL, valor_total REAL, status TEXT NOT NULL DEFAULT 'ativa', observacao TEXT, id_usuario INTEGER, FOREIGN KEY (id_produto) REFERENCES produtos (id))`);

    // NOVAS TABELAS PARA CONTROLE DE DELIVERY
    db.run(`
      CREATE TABLE IF NOT EXISTS delivery_zones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        districts TEXT, -- Armazenar como JSON string (ex: "[\"Centro\",\"Vila Nova\"]")
        deliveryFee REAL NOT NULL,
        estimatedTime TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT 1
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS delivery_drivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        vehicle TEXT,
        vehiclePlate TEXT,
        status TEXT NOT NULL DEFAULT 'available', -- 'available', 'busy', 'offline'
        currentDeliveries INTEGER NOT NULL DEFAULT 0,
        totalDeliveries INTEGER NOT NULL DEFAULT 0,
        rating REAL NOT NULL DEFAULT 5.0
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER NOT NULL,
        customerName TEXT NOT NULL,
        customerPhone TEXT,
        address TEXT NOT NULL,
        district TEXT,
        zoneId INTEGER,
        driverId INTEGER,
        driverName TEXT,
        status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'
        orderTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        estimatedDeliveryTime DATETIME,
        actualDeliveryTime DATETIME,
        deliveryFee REAL,
        notes TEXT,
        priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
        FOREIGN KEY (zoneId) REFERENCES delivery_zones (id),
        FOREIGN KEY (driverId) REFERENCES delivery_drivers (id)
      )
    `);

    // --- INÍCIO: NOVA TABELA PARA FUNCIONÁRIOS (JÁ INCLUÍDA ANTES) ---
    db.run(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        position TEXT,
        department TEXT,
        salary REAL,
        hireDate TEXT, -- Armazenar como ISO string (YYYY-MM-DD)
        status TEXT NOT NULL DEFAULT 'active' -- 'active', 'inactive'
      )
    `);
    // --- FIM: NOVA TABELA PARA FUNCIONÁRIOS ---

    // --- INÍCIO: NOVAS TABELAS PARA MÓDULO DE PRODUÇÃO UNIFICADO ---
    db.run(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        yield_quantity REAL NOT NULL,
        yield_unit TEXT NOT NULL,
        total_cost REAL DEFAULT 0,
        cost_per_unit REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        unit TEXT NOT NULL,
        unit_price REAL NOT NULL,
        supplier_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        cost REAL NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS production_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        batch_size REAL NOT NULL,
        total_cost REAL NOT NULL,
        cost_per_unit REAL NOT NULL,
        production_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id)
      )
    `);
    // --- FIM: NOVAS TABELAS PARA MÓDULO DE PRODUÇÃO UNIFICADO ---

    // Bloco para adicionar novas colunas a tabelas existentes (para compatibilidade)
    const columns_to_add_mov = [
        { name: 'custo_unitario', type: 'REAL' }, { name: 'valor_total', type: 'REAL' },
        { name: 'status', type: 'TEXT NOT NULL DEFAULT \'ativa\'' }, { name: 'id_usuario', type: 'INTEGER' }
    ];
    db.all("PRAGMA table_info(movimentacoes_de_estoque)", (err, columns) => {
        if (err) { console.error("Erro ao ler informações da tabela de movimentações:", err.message); return; }
        columns_to_add_mov.forEach(col_to_add => {
            if (!columns.some(c => c.name === col_to_add.name)) {
                console.log(`Adicionando coluna '${col_to_add.name}' à movimentacoes_de_estoque...`);
                db.run(`ALTER TABLE movimentacoes_de_estoque ADD COLUMN ${col_to_add.name} ${col_to_add.type}`);
            }
        });
    });

    const columns_to_add_vendas = [
        { name: 'status', type: 'TEXT' },
        { name: 'deliveryDate', type: 'TEXT' }
    ];
    db.all("PRAGMA table_info(vendas)", (err, columns) => {
        if (err) { console.error("Erro ao ler informações da tabela de vendas:", err.message); return; }
        columns_to_add_vendas.forEach(col_to_add => {
            if (!columns.some(c => c.name === col_to_add.name)) {
                console.log(`Adicionando coluna '${col_to_add.name}' à vendas...`);
                db.run(`ALTER TABLE vendas ADD COLUMN ${col_to_add.name} ${col_to_add.type}`);
            }
        });
    });
    db.all("PRAGMA table_info(produtos)", (err, columns) => { 
        if (err) { console.error("Erro ao ler informações da tabela de produtos:", err.message); return; } 
        const columnExists = columns.some(col => col.name === 'localizacao'); 
        if (!columnExists) { 
            console.log("Coluna 'localizacao' não encontrada. Adicionando à tabela 'produtos'..."); 
            db.run("ALTER TABLE produtos ADD COLUMN localizacao TEXT", (alterErr) => { 
                if (alterErr) { console.error("Erro ao adicionar a coluna 'localizacao':", alterErr.message); }  
                else { console.log("Coluna 'localizacao' adicionada com sucesso."); } 
            }); 
        } 
    });

    // Lógica de inicialização de configurações padrão mais robusta (mantida)
    db.get("SELECT COUNT(id) AS count FROM configuracoes WHERE id = 1", (err, row) => {
        if (err) { console.error("Erro ao verificar se configurações padrão existem:", err.message); return; }
        if (!row || row.count === 0) {
            console.log("Inserindo configurações padrão...");
            db.run(`INSERT INTO configuracoes (id, defaultMinStock, validityThreshold, barcodeLabelSize, barcodeIncludePrice, barcodeIncludeQR, barcodeFontSize, barcodeLayout, barcodePrefix, barcodeFormat, barcodeAutoGenerate) VALUES (1, 10, 30, '50x30', 1, 0, 8, 'grid', '789', 'EAN-13', 0)`, (insertErr) => {
                if (insertErr) { console.error("Erro ao inserir configurações padrão:", insertErr.message); }
            });
        }
    });

    // --- ÍNDICES PARA OTIMIZAÇÃO DE PERFORMANCE ---
    db.run(`CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(name)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_production_date ON production_batches(production_date)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id)`);

  }); // Fechamento de db.serialize()
}); // Fechamento de db.Database()

const storage = multer.diskStorage({ destination: (req, file, cb) => { const uploadPath = path.join(__dirname, '../frontend/public/images/produtos'); if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true }); cb(null, uploadPath); }, filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); } });
const upload = multer({ storage: storage });

// Rotas de Produtos
app.get('/api/produtos', (req, res) => { db.all("SELECT * FROM produtos ORDER BY name ASC", [], (err, rows) => { if (err) { return res.status(400).json({ "error": err.message }); } res.json({ data: rows }); }); });
app.post('/api/produtos', upload.array('images', 5), (req, res) => { const imageUrl = req.files && req.files.length > 0 ? `/images/produtos/${req.files[0].filename}` : null; const { name, description, costPrice, salePrice, stock, minStock, category, barcode, variations, priceHistory, expirationDate, localizacao } = req.body; const sql = `INSERT INTO produtos (name, description, costPrice, salePrice, stock, minStock, category, barcode, variations, priceHistory, imageUrl, expirationDate, localizacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`; const params = [name, description, costPrice, salePrice, stock, minStock, category, barcode || null, variations, priceHistory, imageUrl, expirationDate || null, localizacao || null]; db.run(sql, params, function(err) { if (err) { return res.status(400).json({ "error": err.message }); } res.status(201).json({ productId: this.lastID }); }); });
app.put('/api/produtos/:id', upload.array('images', 5), (req, res) => { const { id } = req.params; const imageUrl = req.files && req.files.length > 0 ? `/images/produtos/${req.files[0].filename}` : req.body.currentImageUrl; const { name, description, costPrice, salePrice, stock, minStock, category, barcode, variations, priceHistory, expirationDate, localizacao } = req.body; const sql = `UPDATE produtos SET name = ?, description = ?, costPrice = ?, salePrice = ?, stock = ?, minStock = ?, category = ?, barcode = ?, variations = ?, priceHistory = ?, imageUrl = ?, expirationDate = ?, localizacao = ? WHERE id = ?`; const params = [name, description, costPrice, salePrice, stock, minStock, category, barcode || null, variations, priceHistory, imageUrl, expirationDate || null, localizacao || null, id]; db.run(sql, params, function(err) { if (err) { return res.status(400).json({ "error": err.message }); } res.status(200).json({ changes: this.changes }); }); });
app.delete('/api/produtos/:id', (req, res) => { db.run(`DELETE FROM produtos WHERE id = ?`, req.params.id, function(err) { if (err) { return res.status(400).json({ "error": err.message }); } res.status(200).json({ deleted: this.changes }); }); });
app.patch('/api/produtos/:id/status', (req, res) => { const { id } = req.params; const { status } = req.body; if (!status || (status !== 'active' && status !== 'inactive')) { return res.status(400).json({ "error": "Status inválido." }); } db.run(`UPDATE produtos SET status = ? WHERE id = ?`, [status, id], function(err) { if (err) { return res.status(400).json({ "error": err.message }); } res.status(200).json({ message: `Status do produto atualizado para ${status}` }); }); });
app.patch('/api/produtos/:id/reabastecer', (req, res) => { const { id } = req.params; const { quantity } = req.body; const quantityToAdd = parseInt(quantity, 10); if (!quantityToAdd || quantityToAdd <= 0) { return res.status(400).json({ error: 'A quantidade a ser adicionada deve ser um número positivo.' }); } const sql = 'UPDATE produtos SET stock = stock + ? WHERE id = ?'; db.run(sql, [quantityToAdd, id], function(err) { if (err) { console.error("Erro no banco de dados ao reabastecer:", err.message); return res.status(500).json({ error: 'Erro ao atualizar o estoque no banco de dados.' }); } if (this.changes === 0) { return res.status(404).json({ error: 'Produto não encontrado com o ID fornecido.' }); } res.status(200).json({ message: 'Estoque atualizado com sucesso.' }); }); });

// Rotas de Categorias
app.get('/api/categorias', (req, res) => { db.all("SELECT * FROM categorias ORDER BY name ASC", [], (err, rows) => { if (err) { return res.status(400).json({ "error": err.message }); } res.json({ data: rows }); }); });
app.post('/api/categorias', (req, res) => { const { name } = req.body; db.run(`INSERT INTO categorias (name) VALUES (?)`, [name], function(err) { if (err) { return res.status(400).json({ "error": err.message }); } res.status(201).json({ id: this.lastID }); }); });
app.delete('/api/categorias/:id', (req, res) => { db.run(`DELETE FROM categorias WHERE id = ?`, req.params.id, function(err) { if (err) { return res.status(400).json({ "error": err.message }); } res.status(200).json({ deleted: this.changes }); }); });

// Rotas de Configurações (Ajuste para tratar o caso de row vazia mais cedo)
app.get('/api/configuracoes', (req, res) => { 
    db.get("SELECT * FROM configuracoes WHERE id = 1", [], (err, row) => { 
        if (err) { 
            console.error("Erro no GET /api/configuracoes DB:", err.message); 
            return res.status(500).json({ "error": `Erro ao buscar configurações: ${err.message}` }); 
        } 
        if (!row) { 
            console.warn("Configurações não encontradas no DB. Retornando padrão em memória.");
            const defaultConfigs = {
                id: 1, 
                defaultMinStock: 10,
                validityThreshold: 30,
                barcodeLabelSize: '50x30',
                barcodeIncludePrice: 1,
                barcodeIncludeQR: 0,
                barcodeFontSize: 8,
                barcodeLayout: 'grid',
                barcodePrefix: '789',
                barcodeFormat: 'EAN-13',
                barcodeAutoGenerate: 0
            };
            return res.json({ data: defaultConfigs }); 
        }
        res.json({ data: row }); 
    }); 
});
app.put('/api/configuracoes', (req, res) => { const { defaultMinStock, validityThreshold, barcodeLabelSize, barcodeIncludePrice, barcodeIncludeQR, barcodeFontSize, barcodeLayout, barcodePrefix, barcodeFormat, barcodeAutoGenerate } = req.body; const sql = `UPDATE configuracoes SET defaultMinStock = ?, validityThreshold = ?, barcodeLabelSize = ?, barcodeIncludePrice = ?, barcodeIncludeQR = ?, barcodeFontSize = ?, barcodeLayout = ?, barcodePrefix = ?, barcodeFormat = ?, barcodeAutoGenerate = ? WHERE id = 1`; const params = [defaultMinStock, validityThreshold, barcodeLabelSize, barcodeIncludePrice, barcodeIncludeQR, barcodeFontSize, barcodeLayout, barcodePrefix, barcodeFormat, barcodeAutoGenerate]; db.run(sql, params, function(err) { if (err) { return res.status(400).json({ "error": `Erro de Banco de Dados: ${err.message}` }); } if (this.changes === 0) { return res.status(404).json({ "error": "Registro de configurações não foi encontrado." }); } res.status(200).json({ message: "Configurações atualizadas com sucesso!" }); }); });

// Rotas de Clientes
app.get('/api/clientes', (req, res) => { db.all("SELECT * FROM clientes ORDER BY name ASC", [], (err, rows) => { if (err) { return res.status(400).json({ "error": err.message }); } res.json({ data: rows }); }); });
app.post('/api/clientes', (req, res) => {
    const { name, cpf_cnpj, email, phone, address, city, state, zipCode, birthDate } = req.body;
    
    const sql = `INSERT INTO clientes (name, cpf_cnpj, email, phone, address, city, state, zipCode, birthDate) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const params = [name, cpf_cnpj || null, email, phone, address, city, state, zipCode, birthDate];
    
    db.run(sql, params, function(err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(400).json({ 
                    "error": "Erro: O CPF/CNPJ informado já está cadastrado." 
                });
            }
            return res.status(500).json({ 
                "error": "Erro interno do servidor" 
            });
        }
        return res.status(201).json({ 
            id: this.lastID,
            message: "Cliente cadastrado com sucesso" 
        });
    }); 
});
app.put('/api/clientes/:id', (req, res) => { const { id } = req.params; const { name, cpf_cnpj, email, phone, address, city, state, zipCode, birthDate } = req.body; const sql = `UPDATE clientes SET name = ?, cpf_cnpj = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zipCode = ?, birthDate = ? WHERE id = ?`; const params = [name, cpf_cnpj || null, email, phone, address, city, state, zipCode, birthDate, id]; db.run(sql, params, function(err) { if (err) { if (err.message.includes("UNIQUE constraint failed")) { return res.status(400).json({ "error": "Erro: O CPF/CNPJ informado já pertence a outro cliente." }); } return res.status(400).json({ "error": err.message }); } if (this.changes === 0) { return res.status(404).json({ "error": "Cliente não encontrado para atualizar." }); } res.status(200).json({ updated: this.changes }); }); });
app.delete('/api/clientes/:id', (req, res) => { db.run(`DELETE FROM clientes WHERE id = ?`, req.params.id, function(err) { if (err) { return res.status(400).json({ "error": err.message }); } res.status(200).json({ deleted: this.changes }); }); });

// Rotas de Matérias-Primas
app.get('/api/materias-primas', (req, res) => { db.all("SELECT * FROM materias_primas ORDER BY name ASC", [], (err, rows) => { if (err) { return res.status(400).json({ "error": err.message }); } res.json({ data: rows }); }); });
app.post('/api/materias-primas', (req, res) => { const { name, unitOfPurchase, purchasePrice, baseUnit, totalQuantityInBaseUnit, supplierId } = req.body; let costPerBaseUnit = 0; if (purchasePrice > 0 && totalQuantityInBaseUnit > 0) { costPerBaseUnit = purchasePrice / totalQuantityInBaseUnit; } const sql = `INSERT INTO materias_primas (name, unitOfPurchase, purchasePrice, baseUnit, totalQuantityInBaseUnit, costPerBaseUnit, supplierId) VALUES (?, ?, ?, ?, ?, ?, ?)`; const params = [name, unitOfPurchase, purchasePrice, baseUnit, totalQuantityInBaseUnit, costPerBaseUnit, supplierId || null]; db.run(sql, params, function(err) { if (err) { return res.status(400).json({ "error": err.message }); } res.status(201).json({ id: this.lastID }); }); });
app.put('/api/materias-primas/:id', (req, res) => { const { id } = req.params; const { name, unitOfPurchase, purchasePrice, baseUnit, totalQuantityInBaseUnit, supplierId } = req.body; let costPerBaseUnit = 0; if (purchasePrice > 0 && totalQuantityInBaseUnit > 0) { costPerBaseUnit = purchasePrice / totalQuantityInBaseUnit; } const sql = `UPDATE materias_primas SET name = ?, unitOfPurchase = ?, purchasePrice = ?, baseUnit = ?, totalQuantityInBaseUnit = ?, costPerBaseUnit = ?, supplierId = ? WHERE id = ?`; const params = [name, unitOfPurchase, purchasePrice, baseUnit, totalQuantityInBaseUnit, costPerBaseUnit, supplierId || null, id]; db.run(sql, params, function(err) { if (err) { return res.status(400).json({ "error": err.message }); } res.status(200).json({ changes: this.changes }); }); });
app.delete('/api/materias-primas/:id', (req, res) => { db.run(`DELETE FROM materias_primas WHERE id = ?`, req.params.id, function(err) { if (err) { return res.status(400).json({ "error": err.message }); } res.status(200).json({ deleted: this.changes }); }); });

// Rotas de Fornecedores
app.get('/api/fornecedores', (req, res) => { db.all("SELECT * FROM fornecedores ORDER BY name ASC", [], (err, rows) => { if (err) { return res.status(400).json({ "error": err.message }); } res.json({ data: rows }); }); });
app.post('/api/fornecedores', (req, res) => { 
    const { name, cnpj, email, phone, address, city, state, zipCode, contactPerson } = req.body; 
    const sql = `INSERT INTO fornecedores (name, cnpj, email, phone, address, city, state, zipCode, contactPerson) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`; 
    const params = [name, cnpj || null, email, phone, address, city, state, zipCode, contactPerson]; 
    db.run(sql, params, function(err) { 
        if (err) { 
            if (err.message.includes("UNIQUE constraint failed")) { 
                return res.status(400).json({ "error": "Erro: O CNPJ informado já está cadastrado." }); 
            } 
            return res.status(400).json({ "error": err.message }); 
        } 
        res.status(201).json({ id: this.lastID }); 
    }); 
});
app.put('/api/fornecedores/:id', (req, res) => { const { id } = req.params; const { name, cnpj, email, phone, address, city, state, zipCode, contactPerson } = req.body; const sql = `UPDATE fornecedores SET name = ?, cnpj = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zipCode = ?, contactPerson = ? WHERE id = ?`; const params = [name, cnpj, email, phone, address, city, state, zipCode, contactPerson, id]; db.run(sql, params, function(err) { if (err) { console.error("Erro ao atualizar fornecedor no DB:", err.message); if (err.message.includes("UNIQUE constraint failed")) { return res.status(400).json({ "error": "Erro: O CNPJ informado já pertence a outro fornecedor." }); } return res.status(400).json({ "error": err.message }); } if (this.changes === 0) { return res.status(404).json({ "error": "Fornecedor não encontrado para atualizar." }); } res.status(200).json({ message: "Fornecedor atualizado com sucesso." }); }); });
app.delete('/api/fornecedores/:id', (req, res) => { db.run(`DELETE FROM fornecedores WHERE id = ?`, req.params.id, function(err) { if (err) { return res.status(400).json({ "error": err.message }); } res.status(200).json({ deleted: this.changes }); }); });

// Rotas de Fichas Técnicas
app.get('/api/fichas-tecnicas/:id_produto_venda', (req, res) => { const { id_produto_venda } = req.params; const fichaSql = "SELECT * FROM fichas_tecnicas WHERE id_produto_venda = ?"; db.get(fichaSql, [id_produto_venda], (err, ficha) => { if (err) { return res.status(400).json({ error: err.message }); } if (!ficha) { return res.json({ data: null }); } const ingredientesSql = `SELECT i.id, i.id_materia_prima, i.quantidade, m.name as nome_materia_prima, m.baseUnit FROM ingredientes_ficha_tecnica i JOIN materias_primas m ON i.id_materia_prima = m.id WHERE i.id_ficha_tecnica = ?`; db.all(ingredientesSql, [ficha.id], (err, ingredientes) => { if (err) { return res.status(400).json({ error: err.message }); } res.json({ data: { ...ficha, ingredientes: ingredientes || [] } }); }); }); });
app.post('/api/fichas-tecnicas/:id_produto_venda', (req, res) => { const { id_produto_venda } = req.params; const { nome, rendimento, unidade_rendimento, ingredientes } = req.body; if (!rendimento || !unidade_rendimento || !ingredientes || !Array.isArray(ingredientes)) { return res.status(400).json({ error: "Dados da ficha técnica estão incompletos ou em formato inválido." }); } db.serialize(() => { db.run("BEGIN TRANSACTION"); const deleteIngredientesSql = "DELETE FROM ingredientes_ficha_tecnica WHERE id_ficha_tecnica IN (SELECT id FROM fichas_tecnicas WHERE id_produto_venda = ?)"; db.run(deleteIngredientesSql, [id_produto_venda]); const deleteFichaSql = "DELETE FROM fichas_tecnicas WHERE id_produto_venda = ?"; db.run(deleteFichaSql, [id_produto_venda]); const insertFichaSql = "INSERT INTO fichas_tecnicas (id_produto_venda, nome, rendimento, unidade_rendimento) VALUES (?, ?, ?, ?)"; db.run(insertFichaSql, [id_produto_venda, nome, rendimento, unidade_rendimento], function(err) { if (err) { db.run("ROLLBACK"); return res.status(400).json({ error: `Erro ao salvar a ficha técnica: ${err.message}` }); } const fichaId = this.lastID; const insertIngredienteSql = "INSERT INTO ingredientes_ficha_tecnica (id_ficha_tecnica, id_materia_prima, quantidade) VALUES (?, ?, ?)"; for (const ing of ingredientes) { db.run(insertIngredienteSql, [fichaId, ing.id_materia_prima, ing.quantidade]); } db.run("COMMIT", (commitErr) => { if (commitErr) { return res.status(400).json({ error: `Erro ao confirmar a transação: ${commitErr.message}` }); } res.status(201).json({ message: "Ficha técnica salva com sucesso." }); }); } ); }); });

// Rotas de Produção
app.post('/api/producao', (req, res) => { const { id_ficha_tecnica, lotes_produzidos } = req.body; if (!id_ficha_tecnica || !lotes_produzidos || lotes_produzidos <= 0) { return res.status(400).json({ error: "Dados para produção inválidos." }); } const fichaSql = "SELECT * FROM fichas_tecnicas WHERE id = ?"; db.get(fichaSql, [id_ficha_tecnica], (err, ficha) => { if (err) { return res.status(500).json({ error: err.message }); } if (!ficha) { return res.status(404).json({ error: "Ficha técnica não encontrada." }); } const ingredientesSql = "SELECT * FROM ingredientes_ficha_tecnica WHERE id_ficha_tecnica = ?"; db.all(ingredientesSql, [id_ficha_tecnica], async (err, ingredientes) => { if (err) { return res.status(500).json({ error: err.message }); } if (ingredientes.length === 0) { return res.status(400).json({ error: "Ficha técnica não possui ingredientes." }); } try { db.run("BEGIN TRANSACTION"); let custoTotal = 0; for (const ing of ingredientes) { const materiaPrimaSql = "SELECT * FROM materias_primas WHERE id = ?"; const materiaPrima = await new Promise((resolve, reject) => { db.get(materiaPrimaSql, [ing.id_materia_prima], (err, row) => { if (err) reject(err); resolve(row); }); }); if (!materiaPrima) throw new Error(`Matéria-prima com ID ${ing.id_materia_prima} não encontrada.`); const quantidadeNecessaria = ing.quantidade * lotes_produzidos; if (materiaPrima.totalQuantityInBaseUnit < quantidadeNecessaria) { throw new Error(`Estoque insuficiente de ${materiaPrima.name}. Necessário: ${quantidadeNecessaria}, Disponível: ${materiaPrima.totalQuantityInBaseUnit}`); } custoTotal += (materiaPrima.costPerBaseUnit || 0) * quantidadeNecessaria; const updateMateriaPrimaSql = "UPDATE materias_primas SET totalQuantityInBaseUnit = totalQuantityInBaseUnit - ? WHERE id = ?"; db.run(updateMateriaPrimaSql, [quantidadeNecessaria, ing.id_materia_prima]); } const quantidadeProduzida = ficha.rendimento * lotes_produzidos; if (quantidadeProduzida > 0) { const novoCustoPorUnidade = custoTotal / quantidadeProduzida; const updateCustoSql = "UPDATE produtos SET costPrice = ?, stock = stock + ? WHERE id = ?"; db.run(updateCustoSql, [novoCustoPorUnidade, quantidadeProduzida, ficha.id_produto_venda]); } else { const updateProdutoFinalSql = "UPDATE produtos SET stock = stock + ? WHERE id = ?"; db.run(updateProdutoFinalSql, [quantidadeProduzida, ficha.id_produto_venda]); } const insertProducaoSql = "INSERT INTO producoes (id_produto_venda, id_ficha_tecnica, quantidade_produzida, unidade_produzida, custo_total_producao) VALUES (?, ?, ?, ?, ?)"; db.run(insertProducaoSql, [ficha.id_produto_venda, id_ficha_tecnica, quantidadeProduzida, ficha.unidade_rendimento, custoTotal]); db.run("COMMIT", (commitErr) => { if (commitErr) { throw new Error(`Erro ao confirmar a produção: ${commitErr.message}`); } res.status(200).json({ message: "Produção registrada e estoque atualizado." }); }); } catch (error) { db.run("ROLLBACK"); res.status(400).json({ error: error.message }); } }); }); });

// Rotas de Movimentações de Estoque
app.get('/api/movimentacoes-de-estoque', (req, res) => { db.all("SELECT * FROM movimentacoes_de_estoque mov JOIN produtos prod ON mov.id_produto = prod.id ORDER BY mov.data DESC", [], (err, rows) => { if (err) { return res.status(400).json({ "error": err.message }); } res.json({ data: rows }); }); });
app.post('/api/movimentacoes/ajuste', (req, res) => {
    const { id_produto, quantidade, observacao, tipo, custo_unitario, id_usuario } = req.body; 
    if (!id_produto || !quantidade || !tipo || !['ajuste_entrada', 'ajuste_saida'].includes(tipo) || !observacao || !id_usuario) {
        return res.status(400).json({ error: "Dados para ajuste de estoque inválidos ou incompletos." });
    }
    const quantidadeParaProduto = tipo === 'ajuste_entrada' ? Math.abs(quantidade) : -Math.abs(quantidade);
    const quantidadeParaCalculoValor = Math.abs(quantidade);

    db.get("SELECT name, costPrice, salePrice FROM produtos WHERE id = ?", [id_produto], (err, product) => {
        if (err) { return res.status(500).json({ error: `Erro ao buscar produto: ${err.message}` }); }
        if (!product) { return res.status(404).json({ error: "Produto não encontrado." }); }

        const custoUnitarioParaSalvar = Number(custo_unitario) || 
                                       (tipo === 'ajuste_entrada' ? product.costPrice : product.salePrice) || 0;
        const valorTotalParaSalvar = custoUnitarioParaSalvar * quantidadeParaCalculoValor;

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            const updateSql = "UPDATE produtos SET stock = stock + ? WHERE id = ?";
            db.run(updateSql, [quantidadeParaProduto, id_produto], function(err) {
                if (err) { db.run("ROLLBACK"); return res.status(500).json({ error: `Erro ao atualizar estoque: ${err.message}` }); }
                
                const insertSql = `INSERT INTO movimentacoes_de_estoque (data, id_produto, nome_produto, tipo, quantidade, custo_unitario, valor_total, observacao, status, id_usuario) VALUES (CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, 'ativa', ?)`;
                db.run(insertSql, [id_produto, product.name, tipo, quantidadeParaProduto, custoUnitarioParaSalvar, valorTotalParaSalvar, observacao, id_usuario], (err) => {
                    if (err) { db.run("ROLLBACK"); return res.status(500).json({ error: `Erro ao registrar movimentação: ${err.message}` }); }
                    db.run("COMMIT", (commitErr) => {
                        if (commitErr) { return res.status(500).json({ error: `Erro ao confirmar a transação: ${commitErr.message}` }); }
                        res.status(200).json({ message: "Ajuste de estoque realizado com sucesso." });
                    });
                });
            });
        });
    });
});
app.patch('/api/movimentacoes/:id/arquivar', (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE movimentacoes_de_estoque SET status = 'arquivada' WHERE id = ?";
    db.run(sql, [id], function(err) {
        if (err) { return res.status(400).json({ error: err.message }); }
        if (this.changes === 0) { return res.status(404).json({ error: "Movimentação não encontrada." }); }
        res.status(200).json({ message: "Movimentação arquivada com sucesso." });
    });
});

// Rotas de Relatórios
app.get('/api/reports/sales-over-time', (req, res) => { const sql = `SELECT strftime('%Y-%m-%d', data_venda) as date, SUM(total_final) as total FROM vendas WHERE data_venda >= date('now', '-30 days') GROUP BY date ORDER BY date ASC`; db.all(sql, [], (err, rows) => { if (err) { return res.status(400).json({ "error": err.message }); } res.json({ data: rows }); }); });
app.get('/api/reports/dashboard-stats', (req, res) => { const queries = { totalProducts: "SELECT COUNT(id) as count FROM produtos WHERE status = 'active'", monthlyRevenue: `SELECT SUM(total_final) as total FROM vendas WHERE strftime('%Y-%m', data_venda) = strftime('%Y-%m', 'now')`, lowStockItems: "SELECT COUNT(id) as count FROM produtos WHERE stock <= minStock AND status = 'active'"}; Promise.all([ new Promise((resolve, reject) => db.get(queries.totalProducts, (err, row) => err ? reject(err) : resolve(row.count))), new Promise((resolve, reject) => db.get(queries.monthlyRevenue, (err, row) => err ? reject(err) : resolve(row.total || 0))), new Promise((resolve, reject) => db.get(queries.lowStockItems, (err, row) => err ? reject(err) : resolve(row.count))), ]).then(([totalProducts, monthlyRevenue, lowStockItems]) => { res.json({ data: { totalProducts, monthlyRevenue, lowStockItems } }); }).catch(err => { res.status(400).json({ "error": err.message }); }); });
app.get('/api/reports/performance-by-category', (req, res) => { const sql = `SELECT p.category, SUM(v.total_final) as totalVendas FROM vendas v JOIN json_each(v.itens_vendidos) je ON 1=1 JOIN produtos p ON p.id = json_extract(je.value, '$.id') GROUP BY p.category ORDER BY totalVendas DESC`; db.all(sql, [], (err, rows) => { if (err) { return res.status(400).json({ "error": err.message }); } const formattedData = rows.map(row => ({ name: row.category, value: row.totalVendas, })); res.json({ data: formattedData }); }); });

// Rotas de Vendas/Pedidos (CRUD)
app.get('/api/vendas', (req, res) => {
  db.all("SELECT * FROM vendas ORDER BY date(data_venda) DESC", [], (err, rows) => {
    if (err) { return res.status(400).json({ "error": err.message }); }
    const orders = rows.map(row => ({
      ...row,
      items: JSON.parse(row.itens_vendidos || '[]')
    }));
    res.json({ data: orders });
  });
});
app.post('/api/vendas', (req, res) => {
    const { id_cliente, nome_cliente, deliveryDate, itens_vendidos, subtotal, desconto_valor, total_final, observacoes, status } = req.body; 

    console.log("-----------------------------------------");
    console.log("Recebendo nova venda do frontend:");
    console.log("id_cliente:", id_cliente);
    console.log("nome_cliente:", nome_cliente);
    console.log("deliveryDate:", deliveryDate);
    console.log("itens_vendidos (JSON string):", itens_vendidos);
    console.log("subtotal:", subtotal);
    console.log("desconto_valor:", desconto_valor);
    console.log("total_final:", total_final);
    console.log("observacoes:", observacoes);
    console.log("status:", status);
    console.log("-----------------------------------------");

    if (!id_cliente || !nome_cliente || !itens_vendidos || !Array.isArray(JSON.parse(itens_vendidos)) || JSON.parse(itens_vendidos).length === 0 || total_final === undefined || status === undefined || deliveryDate === undefined) {
        console.error("Validação falhou. Dados incompletos ou inválidos:", { id_cliente, nome_cliente, itens_vendidos, total_final, status, deliveryDate });
        return res.status(400).json({ error: "Dados da venda incompletos ou inválidos. Verifique id_cliente, nome_cliente, itens_vendidos, total_final, status e deliveryDate." });
    }

    const sql = `INSERT INTO vendas (id_cliente, nome_cliente, data_venda, deliveryDate, itens_vendidos, subtotal, desconto_valor, total_final, observacoes, status) VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [id_cliente, nome_cliente, deliveryDate, itens_vendidos, subtotal, desconto_valor, total_final, observacoes, status];
    
    db.run(sql, params, function(err) {
        if (err) { 
            console.error("Erro ao inserir venda no DB:", err.message);
            if (err.message.includes("NOT NULL constraint failed")) {
                return res.status(400).json({ "error": "Erro: Campo obrigatório faltando no banco de dados." });
            }
            return res.status(400).json({ "error": err.message }); 
        }
        res.status(201).json({ id: this.lastID });
    });
});
app.put('/api/vendas/:id', (req, res) => {
    const { id } = req.params;
    const { id_cliente, nome_cliente, deliveryDate, itens_vendidos, subtotal, desconto_valor, total_final, observacoes, status } = req.body;
    const sql = `UPDATE vendas SET id_cliente = ?, nome_cliente = ?, deliveryDate = ?, itens_vendidos = ?, subtotal = ?, desconto_valor = ?, total_final = ?, observacoes = ?, status = ? WHERE id = ?`;
    const params = [id_cliente, nome_cliente, deliveryDate, itens_vendidos, subtotal, desconto_valor, total_final, observacoes, status, id];

    db.run(sql, params, function(err) {
        if (err) { 
            console.error("Erro ao atualizar venda no DB:", err.message);
            return res.status(400).json({ "error": err.message }); 
        }
        res.status(200).json({ changes: this.changes });
    });
});
app.delete('/api/vendas/:id', (req, res) => {
    db.run(`DELETE FROM vendas WHERE id = ?`, req.params.id, function(err) {
        if (err) { return res.status(400).json({ "error": err.message }); }
        res.status(200).json({ deleted: this.changes });
    });
});
app.post('/api/sales/finalize', (req, res) => { const { items, customerId, customerName, subtotal, discountPercentage, discountAmount, total, paymentMethod, notes } = req.body; if (!items || !Array.isArray(items) || items.length === 0) { return res.status(400).json({ error: "Nenhum item de venda fornecido." }); } const itemsJson = JSON.stringify(items); db.serialize(() => { db.run("BEGIN TRANSACTION"); const insertSaleSql = `INSERT INTO vendas (id_cliente, nome_cliente, itens_vendidos, subtotal, desconto_percentual, desconto_valor, total_final, metodo_pagamento, observacoes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'delivered')`; db.run(insertSaleSql, [customerId, customerName, itemsJson, subtotal, discountPercentage, discountAmount, total, paymentMethod, notes]); const updateStockSql = `UPDATE produtos SET stock = stock - ? WHERE id = ? AND stock >= ?`; let updateError = null; items.forEach(item => { db.run(updateStockSql, [item.quantity, item.id, item.quantity], function(err) { if (err) { updateError = err; } if (this.changes === 0 && !updateError) { updateError = new Error(`Estoque insuficiente para o produto ID ${item.id}`); } }); }); db.run("COMMIT", (err) => { if (err || updateError) { db.run("ROLLBACK"); return res.status(400).json({ error: (err || updateError).message }); } res.status(200).json({ message: "Venda finalizada e estoque atualizado com sucesso." }); }); }); });

// --- ROTAS PARA CONTROLE DE DELIVERY ---
// Rotas para Zonas de Entrega
app.get('/api/delivery-zones', (req, res) => {
    db.all("SELECT * FROM delivery_zones ORDER BY name ASC", [], (err, rows) => {
        if (err) { 
            console.error("Erro no GET /api/delivery-zones DB:", err.message); 
            return res.status(500).json({ "error": `Erro ao buscar zonas de entrega: ${err.message}` }); 
        } 
        try {
            const parsedRows = rows.map(row => ({
                ...row,
                districts: JSON.parse(row.districts || '[]'),
                active: Boolean(row.active)
            }));
            res.json({ data: parsedRows });
        } catch (parseError) {
            console.error("Erro ao parsear districts em GET /api/delivery-zones:", parseError);
            return res.status(500).json({ "error": `Erro ao processar dados de zonas de entrega: ${parseError.message}` });
        }
    });
});
app.post('/api/delivery-zones', (req, res) => {
    const { name, districts, deliveryFee, estimatedTime, active } = req.body; 

    console.log("-----------------------------------------");
    console.log("Recebendo nova zona de entrega do frontend:");
    console.log("name:", name);
    console.log("districts (esperado Array, ou string JSON):", districts);
    console.log("Type of districts:", typeof districts, Array.isArray(districts) ? ' (is Array)' : ' (not Array)');
    console.log("deliveryFee:", deliveryFee);
    console.log("Type of deliveryFee:", typeof deliveryFee);
    console.log("estimatedTime:", estimatedTime);
    console.log("active:", active);
    console.log("-----------------------------------------");

    if (!name || name.trim() === '' || !districts || !Array.isArray(districts) || districts.length === 0 || typeof deliveryFee !== 'number' || isNaN(deliveryFee) || deliveryFee < 0 || !estimatedTime || estimatedTime.trim() === '') {
        console.error("Validação de zona falhou. Dados incompletos ou inválidos:", { name, districts, deliveryFee, estimatedTime });
        return res.status(400).json({ error: "Dados da zona de entrega incompletos ou inválidos. Verifique nome, bairros (como array de strings), taxa de entrega (número >= 0) e tempo estimado (não vazio)." });
    }

    const districtsJson = JSON.stringify(districts); 
    const sql = `INSERT INTO delivery_zones (name, districts, deliveryFee, estimatedTime, active) VALUES (?, ?, ?, ?, ?)`;
    const params = [name, districtsJson, deliveryFee, estimatedTime, active || true];
    db.run(sql, params, function(err) {
        if (err) { 
            console.error("Erro ao inserir zona no DB:", err.message);
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(400).json({ "error": "Erro: Já existe uma zona com este nome." });
            }
            return res.status(400).json({ "error": err.message }); 
        }
        res.status(201).json({ id: this.lastID });
    });
});
app.put('/api/delivery-zones/:id', (req, res) => {
    const { id } = req.params;
    const { name, districts, deliveryFee, estimatedTime, active } = req.body;
    const districtsJson = JSON.stringify(districts);
    const sql = `UPDATE delivery_zones SET name = ?, districts = ?, deliveryFee = ?, estimatedTime = ?, active = ? WHERE id = ?`;
    const params = [name, districtsJson, deliveryFee, estimatedTime, active, id];
    db.run(sql, params, function(err) {
        if (err) { return res.status(400).json({ "error": err.message }); }
        if (this.changes === 0) { return res.status(404).json({ "error": "Zona não encontrada." }); }
        res.status(200).json({ changes: this.changes });
    });
});
app.delete('/api/delivery-zones/:id', (req, res) => {
    db.run(`DELETE FROM delivery_zones WHERE id = ?`, req.params.id, function(err) {
        if (err) { return res.status(400).json({ "error": err.message }); }
        res.status(200).json({ deleted: this.changes });
    });
});

// Rotas para Entregadores
app.get('/api/delivery-drivers', (req, res) => {
    db.all("SELECT * FROM delivery_drivers ORDER BY name ASC", [], (err, rows) => {
        if (err) { 
            console.error("Erro no GET /api/delivery-drivers DB:", err.message);
            return res.status(500).json({ "error": `Erro ao buscar entregadores: ${err.message}` });
        }
        try {
            const parsedRows = rows.map(row => ({
                ...row,
                currentDeliveries: Number(row.currentDeliveries),
                totalDeliveries: Number(row.totalDeliveries),
                rating: Number(row.rating)
            }));
            res.json({ data: parsedRows });
        } catch (parseError) {
            console.error("Erro ao parsear dados de entregadores em GET /api/delivery-drivers:", parseError);
            return res.status(500).json({ "error": `Erro ao processar dados de entregadores: ${parseError.message}` });
        }
    });
});
app.post('/api/delivery-drivers', (req, res) => {
    const { name, phone, vehicle, vehiclePlate, status, currentDeliveries, totalDeliveries, rating } = req.body;
    const sql = `INSERT INTO delivery_drivers (name, phone, vehicle, vehiclePlate, status, currentDeliveries, totalDeliveries, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [name, phone, vehicle, vehiclePlate, status || 'available', currentDeliveries || 0, totalDeliveries || 0, rating || 5.0];
    db.run(sql, params, function(err) {
        if (err) { return res.status(400).json({ "error": err.message }); }
        res.status(201).json({ id: this.lastID });
    });
});
app.put('/api/delivery-drivers/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone, vehicle, vehiclePlate, status, currentDeliveries, totalDeliveries, rating } = req.body;
    const sql = `UPDATE delivery_drivers SET name = ?, phone = ?, vehicle = ?, vehiclePlate = ?, status = ?, currentDeliveries = ?, totalDeliveries = ?, rating = ? WHERE id = ?`;
    const params = [name, phone, vehicle, vehiclePlate, status, currentDeliveries, totalDeliveries, rating, id];
    db.run(sql, params, function(err) {
        if (err) { return res.status(400).json({ "error": err.message }); }
        if (this.changes === 0) { return res.status(404).json({ "error": "Entregador não encontrado." }); }
        res.status(200).json({ changes: this.changes });
    });
});
app.delete('/api/delivery-drivers/:id', (req, res) => {
    db.run(`DELETE FROM delivery_drivers WHERE id = ?`, req.params.id, function(err) {
        if (err) { return res.status(400).json({ "error": err.message }); }
        res.status(200).json({ deleted: this.changes });
    });
});

// Rotas para Entregas
app.get('/api/deliveries', (req, res) => {
    db.all("SELECT * FROM deliveries ORDER BY orderTime DESC", [], (err, rows) => {
        if (err) { 
            console.error("Erro no GET /api/deliveries DB:", err.message);
            return res.status(500).json({ "error": `Erro ao buscar entregas: ${err.message}` });
        }
        try {
            const parsedRows = rows.map(row => ({
                ...row,
                orderId: Number(row.orderId),
                zoneId: Number(row.zoneId),
                driverId: Number(row.driverId),
                deliveryFee: Number(row.deliveryFee)
            }));
            res.json({ data: parsedRows });
        } catch (parseError) {
            console.error("Erro ao parsear dados de entregas em GET /api/deliveries:", parseError);
            return res.status(500).json({ "error": `Erro ao processar dados de entregas: ${parseError.message}` });
        }
    });
});
app.post('/api/deliveries', (req, res) => {
    const { orderId, customerName, customerPhone, address, district, zoneId, driverId, driverName, status, estimatedDeliveryTime, deliveryFee, notes, priority } = req.body;
    const sql = `INSERT INTO deliveries (orderId, customerName, customerPhone, address, district, zoneId, driverId, driverName, status, orderTime, estimatedDeliveryTime, deliveryFee, notes, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)`;
    const params = [orderId, customerName, customerPhone, address, district, zoneId, driverId || null, driverName || null, status || 'pending', estimatedDeliveryTime, deliveryFee, notes, priority || 'normal'];
    db.run(sql, params, function(err) {
        if (err) { return res.status(400).json({ "error": err.message }); }
        res.status(201).json({ id: this.lastID });
    });
});
app.put('/api/deliveries/:id', (req, res) => {
    const { id } = req.params;
    const { orderId, customerName, customerPhone, address, district, zoneId, driverId, driverName, status, orderTime, estimatedDeliveryTime, actualDeliveryTime, deliveryFee, notes, priority } = req.body;
    const sql = `UPDATE deliveries SET orderId = ?, customerName = ?, customerPhone = ?, address = ?, district = ?, zoneId = ?, driverId = ?, driverName = ?, status = ?, orderTime = ?, estimatedDeliveryTime = ?, actualDeliveryTime = ?, deliveryFee = ?, notes = ?, priority = ? WHERE id = ?`;
    const params = [orderId, customerName, customerPhone, address, district, zoneId, driverId || null, driverName || null, status, orderTime, estimatedDeliveryTime, actualDeliveryTime || null, deliveryFee, notes, priority, id];
    db.run(sql, params, function(err) {
        if (err) { return res.status(400).json({ "error": err.message }); }
        if (this.changes === 0) { return res.status(404).json({ "error": "Entrega não encontrada." }); }
        res.status(200).json({ changes: this.changes });
    });
});
app.patch('/api/deliveries/:id/assign-driver', (req, res) => {
    const { id } = req.params;
    const { driverId, driverName, status } = req.body;
    if (!driverId || !status) { return res.status(400).json({ error: "ID do entregador e status são obrigatórios." }); }

    db.run(`UPDATE deliveries SET driverId = ?, driverName = ?, status = ? WHERE id = ?`, [driverId, driverName, status, id], function(err) {
        if (err) { return res.status(500).json({ error: err.message }); }
        if (this.changes === 0) { return res.status(404).json({ error: "Entrega não encontrada." }); }

        db.run(`UPDATE delivery_drivers SET currentDeliveries = currentDeliveries + 1, status = ? WHERE id = ?`, [driverName && status === 'assigned' ? 'busy' : 'available', driverId], function(err) {
            if (err) { console.error("Erro ao atualizar entregador:", err.message); return res.status(500).json({ error: err.message }); }
            res.status(200).json({ message: "Entregador atribuído e status da entrega atualizado." });
        });
    });
});
app.patch('/api/deliveries/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, driverId } = req.body;
    let actualDeliveryTime = null;

    if (!status) { return res.status(400).json({ error: "Status é obrigatório." }); }

    if (status === 'delivered' || status === 'cancelled') {
        actualDeliveryTime = new Date().toISOString();
    }

    db.run(`UPDATE deliveries SET status = ?, actualDeliveryTime = ? WHERE id = ?`, [status, actualDeliveryTime, id], function(err) {
        if (err) { return res.status(500).json({ error: err.message }); }
        if (this.changes === 0) { return res.status(404).json({ error: "Entrega não encontrada." }); }

        if ((status === 'delivered' || status === 'cancelled') && driverId) {
            db.get(`SELECT currentDeliveries FROM delivery_drivers WHERE id = ?`, [driverId], (err, driverRow) => {
                if (err) { console.error("Erro ao buscar entregador para liberar:", err.message); return; }
                if (driverRow) {
                    const newCurrentDeliveries = Math.max(0, driverRow.currentDeliveries - 1);
                    const newStatus = newCurrentDeliveries === 0 ? 'available' : 'busy';
                    const updateTotalDeliveries = status === 'delivered' ? 'totalDeliveries + 1' : 'totalDeliveries';
                    db.run(`UPDATE delivery_drivers SET currentDeliveries = ?, totalDeliveries = ${updateTotalDeliveries}, status = ? WHERE id = ?`, [newCurrentDeliveries, newStatus, driverId], (updateErr) => {
                        if (updateErr) console.error("Erro ao liberar entregador:", updateErr.message);
                    });
                }
            });
        }
        res.status(200).json({ message: "Status da entrega atualizado." });
    });
});
app.delete('/api/deliveries/:id', (req, res) => {
    db.run(`DELETE FROM deliveries WHERE id = ?`, req.params.id, function(err) {
        if (err) { return res.status(400).json({ "error": err.message }); }
        res.status(200).json({ deleted: this.changes });
    });
});

// Rotas de Funcionários (movidas para antes do app.listen)
app.get('/api/employees', (req, res) => {
  db.all('SELECT * FROM employees', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao buscar funcionários' });
    } else {
      res.json(rows);
    }
  });
});
app.post('/api/employees', (req, res) => {
  const { name, position, phone, email } = req.body;
  db.run(
    'INSERT INTO employees (name, position, phone, email) VALUES (?, ?, ?, ?)',
    [name, position, phone, email],
    function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao cadastrar funcionário' });
      } else {
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

// --- ROTAS DO MÓDULO DE PRODUÇÃO UNIFICADO ---

// Rotas de Receitas
app.get('/api/recipes', (req, res) => {
  const sql = `
    SELECT r.*, 
           COUNT(ri.id) as ingredient_count,
           GROUP_CONCAT(
             json_object(
               'id', ri.id,
               'ingredient_id', ri.ingredient_id,
               'ingredient_name', i.name,
               'quantity', ri.quantity,
               'unit', i.unit,
               'unit_price', i.unit_price,
               'cost', ri.cost
             )
           ) as ingredients
    FROM recipes r
    LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
    LEFT JOIN ingredients i ON ri.ingredient_id = i.id
    GROUP BY r.id
    ORDER BY r.name ASC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ "error": err.message });
    }
    
    // Parse ingredients JSON for each recipe
    const recipes = rows.map(row => ({
      ...row,
      ingredients: row.ingredients ? row.ingredients.split(',').map(ing => JSON.parse(ing)) : []
    }));
    
    res.json({ data: recipes });
  });
});

app.post('/api/recipes', (req, res) => {
  const { name, description, yield_quantity, yield_unit, ingredients } = req.body;
  
  // Validate recipe data using CostCalculator
  const validation = CostCalculator.validateRecipeData({ name, yield_quantity, yield_unit, ingredients });
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.errors.join('; ') });
  }
  
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    
    // Calculate costs using CostCalculator
    const total_cost = CostCalculator.calculateRecipeCost(ingredients);
    const cost_per_unit = CostCalculator.calculateCostPerUnit(total_cost, yield_quantity);
    
    const insertRecipeSql = `
      INSERT INTO recipes (name, description, yield_quantity, yield_unit, total_cost, cost_per_unit)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(insertRecipeSql, [name, description, yield_quantity, yield_unit, total_cost, cost_per_unit], function(err) {
      if (err) {
        db.run("ROLLBACK");
        return res.status(400).json({ error: `Erro ao salvar receita: ${err.message}` });
      }
      
      const recipeId = this.lastID;
      
      // Insert recipe ingredients
      const insertIngredientSql = `
        INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, cost)
        VALUES (?, ?, ?, ?)
      `;
      
      let completed = 0;
      const total = ingredients.length;
      
      if (total === 0) {
        db.run("COMMIT");
        return res.status(201).json({ id: recipeId, message: "Receita criada com sucesso." });
      }
      
      ingredients.forEach(ing => {
        const ingredientCost = CostCalculator.calculateIngredientCost(ing.quantity, ing.unit_price);
        db.run(insertIngredientSql, [recipeId, ing.ingredient_id, ing.quantity, ingredientCost], (err) => {
          if (err) {
            db.run("ROLLBACK");
            return res.status(400).json({ error: `Erro ao adicionar ingrediente: ${err.message}` });
          }
          
          completed++;
          if (completed === total) {
            db.run("COMMIT", (commitErr) => {
              if (commitErr) {
                return res.status(400).json({ error: `Erro ao confirmar transação: ${commitErr.message}` });
              }
              res.status(201).json({ id: recipeId, message: "Receita criada com sucesso." });
            });
          }
        });
      });
    });
  });
});

app.get('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  
  const recipeSql = "SELECT * FROM recipes WHERE id = ?";
  db.get(recipeSql, [id], (err, recipe) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!recipe) {
      return res.status(404).json({ error: "Receita não encontrada." });
    }
    
    const ingredientsSql = `
      SELECT ri.*, i.name as ingredient_name, i.unit, i.unit_price
      FROM recipe_ingredients ri
      JOIN ingredients i ON ri.ingredient_id = i.id
      WHERE ri.recipe_id = ?
    `;
    
    db.all(ingredientsSql, [id], (err, ingredients) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      res.json({ data: { ...recipe, ingredients: ingredients || [] } });
    });
  });
});

app.put('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, yield_quantity, yield_unit, ingredients } = req.body;
  
  // Validate recipe data using CostCalculator
  const validation = CostCalculator.validateRecipeData({ name, yield_quantity, yield_unit, ingredients });
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.errors.join('; ') });
  }
  
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    
    // Calculate costs using CostCalculator
    const total_cost = CostCalculator.calculateRecipeCost(ingredients);
    const cost_per_unit = CostCalculator.calculateCostPerUnit(total_cost, yield_quantity);
    
    // Update recipe
    const updateRecipeSql = `
      UPDATE recipes 
      SET name = ?, description = ?, yield_quantity = ?, yield_unit = ?, 
          total_cost = ?, cost_per_unit = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    db.run(updateRecipeSql, [name, description, yield_quantity, yield_unit, total_cost, cost_per_unit, id], function(err) {
      if (err) {
        db.run("ROLLBACK");
        return res.status(400).json({ error: `Erro ao atualizar receita: ${err.message}` });
      }
      
      // Delete existing ingredients
      db.run("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [id], (err) => {
        if (err) {
          db.run("ROLLBACK");
          return res.status(400).json({ error: `Erro ao remover ingredientes: ${err.message}` });
        }
        
        // Insert new ingredients
        const insertIngredientSql = `
          INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, cost)
          VALUES (?, ?, ?, ?)
        `;
        
        let completed = 0;
        const total = ingredients.length;
        
        if (total === 0) {
          db.run("COMMIT");
          return res.status(200).json({ message: "Receita atualizada com sucesso." });
        }
        
        ingredients.forEach(ing => {
          const ingredientCost = CostCalculator.calculateIngredientCost(ing.quantity, ing.unit_price);
          db.run(insertIngredientSql, [id, ing.ingredient_id, ing.quantity, ingredientCost], (err) => {
            if (err) {
              db.run("ROLLBACK");
              return res.status(400).json({ error: `Erro ao adicionar ingrediente: ${err.message}` });
            }
            
            completed++;
            if (completed === total) {
              db.run("COMMIT", (commitErr) => {
                if (commitErr) {
                  return res.status(400).json({ error: `Erro ao confirmar transação: ${commitErr.message}` });
                }
                res.status(200).json({ message: "Receita atualizada com sucesso." });
              });
            }
          });
        });
      });
    });
  });
});

app.delete('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM recipes WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(200).json({ deleted: this.changes });
  });
});

// Rotas de Ingredientes
app.get('/api/ingredients', (req, res) => {
  console.log('GET /api/ingredients chamado');
  db.all("SELECT * FROM ingredients ORDER BY name ASC", [], (err, rows) => {
    if (err) {
      console.error('Erro na consulta ingredients:', err.message);
      return res.status(400).json({ "error": err.message });
    }
    console.log('Ingredientes encontrados:', rows.length);
    res.json({ data: rows });
  });
});

app.post('/api/ingredients', (req, res) => {
  console.log('POST /api/ingredients chamado com:', req.body);
  const { name, unit, unit_price, supplier_info } = req.body;
  
  // Validação básica primeiro
  if (!name || !unit || !unit_price || unit_price <= 0) {
    console.log('Dados inválidos:', { name, unit, unit_price });
    return res.status(400).json({ error: "Nome, unidade e preço unitário são obrigatórios. Preço deve ser maior que zero." });
  }
  
  // Validate ingredient data using CostCalculator
  try {
    const validation = CostCalculator.validateIngredientData({ name, unit, unit_price });
    if (!validation.isValid) {
      console.log('Validação falhou:', validation.errors);
      return res.status(400).json({ error: validation.errors.join('; ') });
    }
  } catch (validationError) {
    console.error('Erro na validação:', validationError.message);
    // Continuar sem validação se houver erro
  }
  
  const sql = `INSERT INTO ingredients (name, unit, unit_price, supplier_info) VALUES (?, ?, ?, ?)`;
  
  db.run(sql, [name, unit, unit_price, supplier_info || null], function(err) {
    if (err) {
      console.error('Erro ao inserir ingrediente:', err.message);
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Já existe um ingrediente com este nome." });
      }
      return res.status(400).json({ error: err.message });
    }
    console.log('Ingrediente criado com sucesso! ID:', this.lastID);
    res.status(201).json({ id: this.lastID, message: "Ingrediente criado com sucesso." });
  });
});

app.put('/api/ingredients/:id', (req, res) => {
  const { id } = req.params;
  const { name, unit, unit_price, supplier_info } = req.body;
  
  // Validate ingredient data using CostCalculator
  const validation = CostCalculator.validateIngredientData({ name, unit, unit_price });
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.errors.join('; ') });
  }
  
  const sql = `
    UPDATE ingredients 
    SET name = ?, unit = ?, unit_price = ?, supplier_info = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.run(sql, [name, unit, unit_price, supplier_info || null, id], function(err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Já existe um ingrediente com este nome." });
      }
      return res.status(400).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: "Ingrediente não encontrado." });
    }
    
    res.status(200).json({ message: "Ingrediente atualizado com sucesso." });
  });
});

app.delete('/api/ingredients/:id', (req, res) => {
  const { id } = req.params;
  
  // Check if ingredient is used in any recipe
  db.get("SELECT COUNT(*) as count FROM recipe_ingredients WHERE ingredient_id = ?", [id], (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (row.count > 0) {
      return res.status(400).json({ error: "Não é possível excluir este ingrediente pois ele está sendo usado em receitas." });
    }
    
    db.run("DELETE FROM ingredients WHERE id = ?", [id], function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.status(200).json({ deleted: this.changes });
    });
  });
});

// Rotas de Lotes de Produção
app.get('/api/production-batches', (req, res) => {
  const sql = `
    SELECT pb.*, r.name as recipe_name, r.yield_unit
    FROM production_batches pb
    JOIN recipes r ON pb.recipe_id = r.id
    ORDER BY pb.production_date DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ "error": err.message });
    }
    res.json({ data: rows });
  });
});

app.post('/api/production-batches', (req, res) => {
  const { recipe_id, batch_size, notes } = req.body;
  
  if (!recipe_id || !batch_size || batch_size <= 0) {
    return res.status(400).json({ error: "ID da receita e tamanho do lote são obrigatórios. Tamanho deve ser maior que zero." });
  }
  
  // Get recipe details to calculate costs
  db.get("SELECT * FROM recipes WHERE id = ?", [recipe_id], (err, recipe) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!recipe) {
      return res.status(404).json({ error: "Receita não encontrada." });
    }
    
    // Calculate batch costs using CostCalculator
    const batchCosts = CostCalculator.calculateBatchCost(recipe, batch_size);
    const total_cost = batchCosts.total_cost;
    const cost_per_unit = batchCosts.cost_per_unit;
    
    const sql = `
      INSERT INTO production_batches (recipe_id, batch_size, total_cost, cost_per_unit, notes)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [recipe_id, batch_size, total_cost, cost_per_unit, notes || null], function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, message: "Lote de produção registrado com sucesso." });
    });
  });
});

app.get('/api/production-batches/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = `
    SELECT pb.*, r.name as recipe_name, r.description as recipe_description,
           r.yield_quantity, r.yield_unit
    FROM production_batches pb
    JOIN recipes r ON pb.recipe_id = r.id
    WHERE pb.id = ?
  `;
  
  db.get(sql, [id], (err, batch) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!batch) {
      return res.status(404).json({ error: "Lote de produção não encontrado." });
    }
    
    // Get recipe ingredients for this batch
    const ingredientsSql = `
      SELECT ri.quantity, ri.cost, i.name as ingredient_name, i.unit
      FROM recipe_ingredients ri
      JOIN ingredients i ON ri.ingredient_id = i.id
      WHERE ri.recipe_id = ?
    `;
    
    db.all(ingredientsSql, [batch.recipe_id], (err, ingredients) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      res.json({ data: { ...batch, ingredients: ingredients || [] } });
    });
  });
});

// Rota para estatísticas de custos
app.get('/api/cost-statistics', (req, res) => {
  const sql = "SELECT * FROM recipes";
  
  db.all(sql, [], (err, recipes) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    const statistics = CostCalculator.calculateCostStatistics(recipes);
    res.json({ data: statistics });
  });
});

// Rota para calcular margem de lucro
app.post('/api/calculate-profit-margin', (req, res) => {
  const { cost_price, sale_price } = req.body;
  
  if (!cost_price || !sale_price) {
    return res.status(400).json({ error: "Preço de custo e preço de venda são obrigatórios." });
  }
  
  try {
    const margin = CostCalculator.calculateProfitMargin(cost_price, sale_price);
    res.json({ data: margin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor back-end rodando com sucesso em http://localhost:${port}`);
});
