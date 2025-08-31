// backend/debug-ingredients.js
// Debug do problema de ingredientes

const sqlite3 = require('sqlite3').verbose();
const CostCalculator = require('./utils/costCalculator');

const db = new sqlite3.Database('./estoque.sqlite');

console.log('🔍 Debugando problema de ingredientes...\n');

// 1. Verificar se a tabela existe
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='ingredients'", (err, row) => {
  if (err) {
    console.error("❌ Erro ao verificar tabela:", err.message);
    return;
  }
  
  if (row) {
    console.log("✅ Tabela 'ingredients' existe!");
    
    // 2. Verificar estrutura da tabela
    db.all("PRAGMA table_info(ingredients)", (err, columns) => {
      if (err) {
        console.error("❌ Erro ao verificar estrutura:", err.message);
        return;
      }
      
      console.log("📋 Estrutura da tabela:");
      columns.forEach(col => {
        console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
      
      // 3. Verificar dados existentes
      db.all("SELECT * FROM ingredients", (err, rows) => {
        if (err) {
          console.error("❌ Erro ao buscar dados:", err.message);
          return;
        }
        
        console.log(`\n📊 Ingredientes existentes: ${rows.length}`);
        rows.forEach(row => {
          console.log(`  - ID: ${row.id}, Nome: ${row.name}, Unidade: ${row.unit}, Preço: R$ ${row.unit_price}`);
        });
        
        // 4. Testar validação do CostCalculator
        console.log('\n🧪 Testando CostCalculator...');
        const testData = {
          name: 'Teste Validação',
          unit: 'kg',
          unit_price: 5.50
        };
        
        try {
          const validation = CostCalculator.validateIngredientData(testData);
          console.log('✅ Validação funcionou:', validation);
        } catch (error) {
          console.log('❌ Erro na validação:', error.message);
        }
        
        // 5. Testar inserção direta
        console.log('\n💾 Testando inserção direta...');
        const insertSql = `INSERT INTO ingredients (name, unit, unit_price, supplier_info) VALUES (?, ?, ?, ?)`;
        const testName = `Teste Debug ${Date.now()}`;
        
        db.run(insertSql, [testName, 'kg', 3.50, 'Fornecedor Debug'], function(err) {
          if (err) {
            console.error('❌ Erro na inserção:', err.message);
          } else {
            console.log('✅ Inserção funcionou! ID:', this.lastID);
          }
          
          db.close();
        });
      });
    });
  } else {
    console.log("❌ Tabela 'ingredients' NÃO existe!");
    db.close();
  }
});