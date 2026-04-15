import { apiGet } from "../config/apiClient";
import { createCategory } from "../models/categoryModel";
import defaultCategories from "../data/defaultCategories";

export async function fetchCategories() {
  const data = await apiGet("/api/categories").catch(() => []);
  const list = data.length ? data : defaultCategories;
  return list.map(createCategory);
}