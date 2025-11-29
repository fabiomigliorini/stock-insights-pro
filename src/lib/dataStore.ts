import { Product, BranchConfig, Movement } from "./excelParser";

// Simple in-memory data store (você pode substituir por contexto ou Lovable Cloud depois)
class DataStore {
  private products: Product[] = [
    { id: "1", name: "Camiseta Básica Branca", sku: "CAM-001", stock: 45, min: 50, max: 200, status: "low" },
    { id: "2", name: "Calça Jeans Slim", sku: "CAL-002", stock: 120, min: 30, max: 150, status: "ok" },
    { id: "3", name: "Tênis Esportivo", sku: "TEN-003", stock: 85, min: 40, max: 100, status: "high" },
    { id: "4", name: "Vestido Floral", sku: "VES-004", stock: 65, min: 30, max: 80, status: "ok" },
    { id: "5", name: "Jaqueta Jeans", sku: "JAQ-005", stock: 25, min: 40, max: 120, status: "low" },
  ];

  private branches: BranchConfig[] = [
    { name: "Filial Centro", stock: 850, capacity: 1000, status: "ok" },
    { name: "Filial Norte", stock: 320, capacity: 1000, status: "low" },
    { name: "Filial Sul", stock: 950, capacity: 1000, status: "high" },
    { name: "Filial Oeste", stock: 680, capacity: 1000, status: "ok" },
  ];

  private movements: Movement[] = [];

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
