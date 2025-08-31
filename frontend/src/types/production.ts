import { RawMaterial } from "./product";

export interface RecipeIngredient {
  id: string; // UUID for frontend key
  rawMaterialId: number | string;
  quantity: number;
}

export interface Recipe {
  id: string; // UUID for frontend key
  name:string;
  ingredients: RecipeIngredient[];
  yield: number; // Rendimento (ex: 5 litros, 10 unidades)
  yieldUnit: string; // Unidade do rendimento (ex: 'litros', 'unidades')
}