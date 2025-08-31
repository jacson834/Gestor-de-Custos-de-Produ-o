// backend/test-api-direct.js
// Teste direto da API para debug

const fetch = require('node-fetch');

async function testIngredients() {
  console.log('🧪 Testando API de Ingredientes...\n');
  
  // Teste GET
  try {
    console.log('📋 Teste GET /api/ingredients');
    const getResponse = await fetch('http://localhost:3001/api/ingredients');
    const getData = await getResponse.json();
    console.log('Status:', getResponse.status);
    console.log('Dados:', getData);
    console.log('✅ GET funcionou!\n');
  } catch (error) {
    console.log('❌ GET falhou:', error.message);
  }
  
  // Teste POST
  try {
    console.log('📝 Teste POST /api/ingredients');
    const postData = {
      name: 'Açúcar Teste API',
      unit: 'kg',
      unit_price: 4.50,
      supplier_info: 'Fornecedor API'
    };
    
    const postResponse = await fetch('http://localhost:3001/api/ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });
    
    const postResult = await postResponse.json();
    console.log('Status:', postResponse.status);
    console.log('Resultado:', postResult);
    
    if (postResponse.ok) {
      console.log('✅ POST funcionou!\n');
    } else {
      console.log('❌ POST falhou!\n');
    }
  } catch (error) {
    console.log('❌ POST falhou:', error.message);
  }
}

testIngredients();