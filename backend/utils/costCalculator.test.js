// backend/utils/costCalculator.test.js
// Testes básicos para o CostCalculator (para execução manual)

const CostCalculator = require('./costCalculator');

console.log('🧪 Iniciando testes do CostCalculator...\n');

// Teste 1: Cálculo de custo de receita
console.log('📋 Teste 1: Cálculo de custo de receita');
const ingredients = [
  { quantity: 2, unit_price: 5.50 }, // Leite: 2L x R$5,50 = R$11,00
  { quantity: 0.5, unit_price: 8.00 }, // Açúcar: 0.5kg x R$8,00 = R$4,00
  { quantity: 1, unit_price: 12.00 }   // Morango: 1kg x R$12,00 = R$12,00
];
const recipeCost = CostCalculator.calculateRecipeCost(ingredients);
console.log(`Custo total da receita: R$ ${recipeCost.toFixed(2)}`);
console.log(`Esperado: R$ 27.00`);
console.log(`✅ ${recipeCost === 27 ? 'PASSOU' : 'FALHOU'}\n`);

// Teste 2: Cálculo de custo por unidade
console.log('📊 Teste 2: Cálculo de custo por unidade');
const costPerUnit = CostCalculator.calculateCostPerUnit(27, 10);
console.log(`Custo por unidade: R$ ${costPerUnit.toFixed(2)}`);
console.log(`Esperado: R$ 2.70`);
console.log(`✅ ${costPerUnit === 2.7 ? 'PASSOU' : 'FALHOU'}\n`);

// Teste 3: Cálculo de custo de lote
console.log('🏭 Teste 3: Cálculo de custo de lote');
const recipe = { cost_per_unit: 2.7 };
const batchCosts = CostCalculator.calculateBatchCost(recipe, 5);
console.log(`Custo do lote (5 unidades): R$ ${batchCosts.total_cost.toFixed(2)}`);
console.log(`Custo por unidade: R$ ${batchCosts.cost_per_unit.toFixed(2)}`);
console.log(`Esperado: R$ 13.50 total, R$ 2.70 por unidade`);
console.log(`✅ ${batchCosts.total_cost === 13.5 && batchCosts.cost_per_unit === 2.7 ? 'PASSOU' : 'FALHOU'}\n`);

// Teste 4: Validação de dados de receita
console.log('✅ Teste 4: Validação de dados de receita');
const validRecipe = {
  name: 'Sorvete de Morango',
  yield_quantity: 10,
  yield_unit: 'unidades',
  ingredients: [
    { ingredient_id: 1, quantity: 2, unit_price: 5.50 }
  ]
};
const validation = CostCalculator.validateRecipeData(validRecipe);
console.log(`Receita válida: ${validation.isValid}`);
console.log(`Erros: ${validation.errors.join(', ') || 'Nenhum'}`);
console.log(`✅ ${validation.isValid ? 'PASSOU' : 'FALHOU'}\n`);

// Teste 5: Validação de dados inválidos
console.log('❌ Teste 5: Validação de dados inválidos');
const invalidRecipe = {
  name: '',
  yield_quantity: 0,
  yield_unit: '',
  ingredients: []
};
const invalidValidation = CostCalculator.validateRecipeData(invalidRecipe);
console.log(`Receita inválida: ${!invalidValidation.isValid}`);
console.log(`Erros encontrados: ${invalidValidation.errors.length}`);
console.log(`✅ ${!invalidValidation.isValid && invalidValidation.errors.length > 0 ? 'PASSOU' : 'FALHOU'}\n`);

// Teste 6: Cálculo de margem de lucro
console.log('💰 Teste 6: Cálculo de margem de lucro');
const margin = CostCalculator.calculateProfitMargin(2.70, 5.00);
console.log(`Custo: R$ 2.70, Venda: R$ 5.00`);
console.log(`Margem em valor: R$ ${margin.margin_value.toFixed(2)}`);
console.log(`Margem em %: ${margin.margin_percentage.toFixed(1)}%`);
console.log(`Esperado: R$ 2.30 (46.0%)`);
console.log(`✅ ${Math.abs(margin.margin_value - 2.3) < 0.01 && Math.abs(margin.margin_percentage - 46) < 0.1 ? 'PASSOU' : 'FALHOU'}\n`);

// Teste 7: Formatação de moeda
console.log('💵 Teste 7: Formatação de moeda');
const formatted = CostCalculator.formatCurrency(27.5);
console.log(`Valor formatado: ${formatted}`);
console.log(`Esperado: R$ 27,50`);
console.log(`✅ ${formatted === 'R$ 27,50' ? 'PASSOU' : 'FALHOU'}\n`);

console.log('🎉 Testes concluídos!');