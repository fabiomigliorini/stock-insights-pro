import { Product, BranchConfig, Movement } from "./excelParser";

// Simple in-memory data store (você pode substituir por contexto ou Lovable Cloud depois)
class DataStore {
  private products: Product[] = [];
  private branches: BranchConfig[] = [];
  private movements: Movement[] = [];

  clear() {
    this.products = [];
    this.branches = [];
    this.movements = [];
  }

  getProducts(): Product[] {
    return this.products;
  }

  getBranches(): BranchConfig[] {
    return this.branches;
  }

  getMovements(): Movement[] {
    return this.movements;
  }

  setProducts(products: Product[]): void {
    this.products = products;
  }

  setBranches(branches: BranchConfig[]): void {
    this.branches = branches;
  }

  setMovements(movements: Movement[]): void {
    this.movements = movements;
  }

  getTotalStock(): number {
    return this.products.reduce((sum, p) => sum + p.stock, 0);
  }

  getLowStockCount(): number {
    return this.products.filter((p) => p.status === "low").length;
  }
}

export const dataStore = new DataStore();
