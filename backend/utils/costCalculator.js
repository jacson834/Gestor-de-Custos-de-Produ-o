// backend/utils/costCalculator.js
// Utilitários para cálculo de custos de receitas e produção

class CostCalculator {
  /**
   * Calcula o custo total de uma receita baseado nos ingredientes
   * @param {Array} ingredients - Array de ingredientes com quantity e unit_price
   * @returns {number} Custo total da receita
   */
  static calculateRecipeCost(ingredients) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return 0;
    }

    return ingredients.reduce((total, ingredient) => {
      const quantity = parseFloat(ingredient.quantity) || 0;
      const unitPrice = parseFloat(ingredient.unit_price) || 0;
      return total + (quantity * unitPrice);
    }, 0);
  }

  /**
   * Calcula o custo por unidade baseado no custo total e rendimento
   * @param {number} totalCost - Custo total da receita
   * @param {number} yieldQuantity - Quantidade produzida pela receita
   * @returns {number} Custo por unidade
   */
  static calculateCostPerUnit(totalCost, yieldQuantity) {
    const cost = parseFloat(totalCost) || 0;
    const yield_qty = parseFloat(yieldQuantity) || 1;
    
    if (yield_qty <= 0) {
      throw new Error('Rendimento deve ser maior que zero');
    }
    
    return cost / yield_qty;
  }

  /**
   * Calcula o custo de um lote de produção
   * @param {Object} recipe - Receita com cost_per_unit
   * @param {number} batchSize - Tamanho do lote a ser produzido
   * @returns {Object} Objeto com total_cost e cost_per_unit
   */
  static calculateBatchCost(recipe, batchSize) {
    const costPerUnit = parseFloat(recipe.cost_per_unit) || 0;
    const batch_size = parseFloat(batchSize) || 0;
    
    if (batch_size <= 0) {
      throw new Error('Tamanho do lote deve ser maior que zero');
    }
    
    const total_cost = costPerUnit * batch_size;
    
    return {
      total_cost: total_cost,
      cost_per_unit: costPerUnit
    };
  }

  /**
   * Calcula o custo de um ingrediente específico em uma receita
   * @param {number} quantity - Quantidade do ingrediente
   * @param {number} unitPrice - Preço unitário do ingrediente
   * @returns {number} Custo do ingrediente na receita
   */
  static calculateIngredientCost(quantity, unitPrice) {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    
    return qty * price;
  }

  /**
   * Valida se os dados de uma receita são válidos para cálculo
   * @param {Object} recipeData - Dados da receita
   * @returns {Object} Objeto com isValid e errors
   */
  static validateRecipeData(recipeData) {
    const errors = [];
    
    if (!recipeData.name || recipeData.name.trim() === '') {
      errors.push('Nome da receita é obrigatório');
    }
    
    if (!recipeData.yield_quantity || parseFloat(recipeData.yield_quantity) <= 0) {
      errors.push('Rendimento deve ser maior que zero');
    }
    
    if (!recipeData.yield_unit || recipeData.yield_unit.trim() === '') {
      errors.push('Unidade de rendimento é obrigatória');
    }
    
    if (!recipeData.ingredients || !Array.isArray(recipeData.ingredients) || recipeData.ingredients.length === 0) {
      errors.push('Adicione pelo menos um ingrediente à receita');
    } else {
      // Validar cada ingrediente
      recipeData.ingredients.forEach((ingredient, index) => {
        if (!ingredient.ingredient_id) {
          errors.push(`Ingrediente ${index + 1}: ID do ingrediente é obrigatório`);
        }
        
        if (!ingredient.quantity || parseFloat(ingredient.quantity) <= 0) {
          errors.push(`Ingrediente ${index + 1}: Quantidade deve ser maior que zero`);
        }
        
        if (!ingredient.unit_price || parseFloat(ingredient.unit_price) <= 0) {
          errors.push(`Ingrediente ${index + 1}: Preço unitário deve ser maior que zero`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Valida se os dados de um ingrediente são válidos
   * @param {Object} ingredientData - Dados do ingrediente
   * @returns {Object} Objeto com isValid e errors
   */
  static validateIngredientData(ingredientData) {
    const errors = [];
    
    if (!ingredientData.name || ingredientData.name.trim() === '') {
      errors.push('Nome do ingrediente é obrigatório');
    }
    
    if (!ingredientData.unit || ingredientData.unit.trim() === '') {
      errors.push('Unidade de medida é obrigatória');
    }
    
    if (!ingredientData.unit_price || parseFloat(ingredientData.unit_price) <= 0) {
      errors.push('Preço unitário deve ser maior que zero');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Calcula estatísticas de custo para um conjunto de receitas
   * @param {Array} recipes - Array de receitas
   * @returns {Object} Estatísticas de custo
   */
  static calculateCostStatistics(recipes) {
    if (!Array.isArray(recipes) || recipes.length === 0) {
      return {
        total_recipes: 0,
        average_cost_per_unit: 0,
        min_cost_per_unit: 0,
        max_cost_per_unit: 0,
        total_cost_all_recipes: 0
      };
    }

    const costs = recipes.map(recipe => parseFloat(recipe.cost_per_unit) || 0);
    const totalCosts = recipes.map(recipe => parseFloat(recipe.total_cost) || 0);
    
    return {
      total_recipes: recipes.length,
      average_cost_per_unit: costs.reduce((sum, cost) => sum + cost, 0) / costs.length,
      min_cost_per_unit: Math.min(...costs),
      max_cost_per_unit: Math.max(...costs),
      total_cost_all_recipes: totalCosts.reduce((sum, cost) => sum + cost, 0)
    };
  }

  /**
   * Formata valor monetário para exibição
   * @param {number} value - Valor a ser formatado
   * @param {string} currency - Símbolo da moeda (padrão: 'R$')
   * @returns {string} Valor formatado
   */
  static formatCurrency(value, currency = 'R$') {
    const numValue = parseFloat(value) || 0;
    return `${currency} ${numValue.toFixed(2).replace('.', ',')}`;
  }

  /**
   * Calcula a margem de lucro baseada no custo e preço de venda
   * @param {number} costPrice - Preço de custo
   * @param {number} salePrice - Preço de venda
   * @returns {Object} Objeto com margin_value, margin_percentage
   */
  static calculateProfitMargin(costPrice, salePrice) {
    const cost = parseFloat(costPrice) || 0;
    const sale = parseFloat(salePrice) || 0;
    
    if (sale <= 0) {
      return {
        margin_value: 0,
        margin_percentage: 0
      };
    }
    
    const margin_value = sale - cost;
    const margin_percentage = (margin_value / sale) * 100;
    
    return {
      margin_value: margin_value,
      margin_percentage: margin_percentage
    };
  }
}

module.exports = CostCalculator;