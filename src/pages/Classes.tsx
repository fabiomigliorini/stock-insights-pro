import { useState, useMemo, useEffect } from "react";
import { useMockData } from "@/hooks/useMockData";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Search, BarChart3, Loader2, TrendingUp, Package, ShoppingCart } from "lucide-react";
import { ProductAnalysis } from "@/components/ProductAnalysis";
import { Product } from "@/lib/excelParser";
import { getMonthlyDataFromMock } from "@/lib/getMonthlyDataFromMock";
import { FilterButton } from "@/components/FilterButton";

export default function Classes() {
  const { mockData, products, isLoading } = useMockData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("todos");
  const [selectedColor, setSelectedColor] = useState("todos");
  const [selectedSize, setSelectedSize] = useState("todos");
  const [selectedFamily, setSelectedFamily] = useState("todos");
  const [selectedPeriod, setSelectedPeriod] = useState<"inicio" | "3anos" | "2anos" | "1ano" | "6meses">("1ano");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loadingMonthlyData, setLoadingMonthlyData] = useState(false);

  // Calculate period display text
  const periodDisplayText = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return "";
    
    // Filter out predictions (with "(P)" suffix)
    const historicalData = monthlyData.filter(d => !d.month.includes("(P)"));
    if (historicalData.length === 0) return "";
    
    const firstMonth = historicalData[0].month;
    const lastMonth = historicalData[historicalData.length - 1].month;
    const totalMonths = historicalData.length;
    
    return `Período exibido: ${firstMonth} – ${lastMonth} (${totalMonths} ${totalMonths === 1 ? 'mês' : 'meses'})`;
  }, [monthlyData]);

  // Reset filters when class changes
  useEffect(() => {
    setSelectedLocation("todos");
    setSelectedColor("todos");
    setSelectedSize("todos");
    setSelectedFamily("todos");
  }, [selectedClass]);

  // Get all unique classes
  const classes = useMemo(() => {
    const uniqueClasses = [...new Set(products.map(p => p.classe).filter(Boolean))];
    return uniqueClasses.sort();
  }, [products]);

  // Filter classes based on search
  const filteredClasses = useMemo(() => {
    return classes.filter(c => 
      c.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [classes, searchTerm]);

  // Get products for selected class
  const classProducts = useMemo(() => {
    if (!selectedClass) return [];
    return products.filter(p => p.classe === selectedClass);
  }, [products, selectedClass]);

  // Get unique locations, colors, sizes, families from mock data for the selected class
  const locations = useMemo(() => {
    if (!selectedClass) return ["todos"];
    const classData = mockData.filter(d => d.classe === selectedClass);
    const locs = [...new Set(classData.map(d => d.local).filter(Boolean))];
    return ["todos", ...locs.sort()];
  }, [mockData, selectedClass]);

  const colors = useMemo(() => {
    if (!selectedClass) return ["todos"];
    const classData = mockData.filter(d => d.classe === selectedClass);
    const cols = [...new Set(classData.map(d => d.cor).filter(Boolean))];
    return ["todos", ...cols.sort()];
  }, [mockData, selectedClass]);

  const sizes = useMemo(() => {
    if (!selectedClass) return ["todos"];
    const classData = mockData.filter(d => d.classe === selectedClass);
    const szs = [...new Set(classData.map(d => d.tamanho).filter(Boolean))];
    return ["todos", ...szs.sort()];
  }, [mockData, selectedClass]);

  const families = useMemo(() => {
    if (!selectedClass) return ["todos"];
    const classData = mockData.filter(d => d.classe === selectedClass);
    const fams = [...new Set(classData.map(d => d.familia).filter(Boolean))];
    return ["todos", ...fams.sort()];
  }, [mockData, selectedClass]);

  // Filter products by location, color, size, and family
  const filteredProducts = useMemo(() => {
    let filtered = classProducts;
    if (selectedLocation !== "todos") {
      filtered = filtered.filter(p => p.local === selectedLocation);
    }
    if (selectedColor !== "todos") {
      filtered = filtered.filter(p => p.cor === selectedColor);
    }
    if (selectedSize !== "todos") {
      filtered = filtered.filter(p => p.tamanho === selectedSize);
    }
    if (selectedFamily !== "todos") {
      filtered = filtered.filter(p => p.familia === selectedFamily);
    }
    return filtered;
  }, [classProducts, selectedLocation, selectedColor, selectedSize, selectedFamily]);

  // Calculate aggregated stats from mock data
  const classStats = useMemo(() => {
    if (!selectedClass) return null;

    let filtered = mockData.filter(d => d.classe === selectedClass);
    
    if (selectedFamily !== "todos") {
      filtered = filtered.filter(d => d.familia === selectedFamily);
    }
    if (selectedColor !== "todos") {
      filtered = filtered.filter(d => d.cor === selectedColor);
    }
    if (selectedSize !== "todos") {
      filtered = filtered.filter(d => d.tamanho === selectedSize);
    }
    if (selectedLocation !== "todos") {
      filtered = filtered.filter(d => d.local === selectedLocation);
    }
    
    const totalDemanda = filtered.reduce((sum, d) => sum + d.qtde_vendida, 0);
    const totalEstoque = filtered.reduce((sum, d) => sum + d.estoque_final_mes, 0);
    const avgSales = filtered.length > 0 ? filtered.reduce((sum, d) => sum + d.qtde_vendida, 0) / filtered.length : 0;
    const totalMin = avgSales * 0.5;
    const totalMax = avgSales * 2.0;
    
    return {
      totalProducts: new Set(filtered.map(d => `${d.sku}-${d.local}`)).size,
      totalDemanda,
      avgDemanda: avgSales,
      totalEstoque,
      totalMin,
      totalMax,
      predominantVolatility: "Média",
    };
  }, [mockData, selectedClass, selectedFamily, selectedColor, selectedSize, selectedLocation]);

  // Calculate big numbers from mock data for selected class and filters
  const bigNumbers = useMemo(() => {
    if (!selectedClass) return { totalVendas: 0, totalEstoque: 0, totalCompras: 0 };

    let filtered = mockData.filter(d => d.classe === selectedClass);
    
    if (selectedFamily !== "todos") {
      filtered = filtered.filter(d => d.familia === selectedFamily);
    }
    if (selectedColor !== "todos") {
      filtered = filtered.filter(d => d.cor === selectedColor);
    }
    if (selectedSize !== "todos") {
      filtered = filtered.filter(d => d.tamanho === selectedSize);
    }
    if (selectedLocation !== "todos") {
      filtered = filtered.filter(d => d.local === selectedLocation);
    }

    const totalVendas = filtered.reduce((sum, d) => sum + d.qtde_vendida, 0);
    const totalEstoque = filtered.reduce((sum, d) => sum + d.estoque_final_mes, 0);
    const totalCompras = filtered.reduce((sum, d) => sum + d.qtde_entregue, 0);

    return { totalVendas, totalEstoque, totalCompras };
  }, [mockData, selectedClass, selectedFamily, selectedColor, selectedSize, selectedLocation]);

  // Load monthly data from mock when class or filters change
  useEffect(() => {
    if (!selectedClass) {
      setMonthlyData([]);
      return;
    }
    
    setLoadingMonthlyData(true);
    
    const data = getMonthlyDataFromMock(
      mockData,
      selectedClass,
      selectedFamily !== "todos" ? selectedFamily : undefined,
      selectedColor !== "todos" ? selectedColor : undefined,
      selectedSize !== "todos" ? selectedSize : undefined
    );

    if (!data || data.length === 0) {
      setMonthlyData([]);
      setLoadingMonthlyData(false);
      return;
    }

    // Filter by period
    const maxYear = Math.max(...data.map(d => d.year));
    let filteredHistoricalData = data;

    switch (selectedPeriod) {
      case "3anos":
        filteredHistoricalData = data.filter(d => d.year >= maxYear - 2);
        break;
      case "2anos":
        filteredHistoricalData = data.filter(d => d.year >= maxYear - 1);
        break;
      case "1ano":
        filteredHistoricalData = data.filter(d => d.year === maxYear);
        break;
      case "6meses":
        filteredHistoricalData = data.slice(-6);
        break;
      case "inicio":
      default:
        filteredHistoricalData = data;
    }

    // Map to chart format
    const chartData = filteredHistoricalData.map(d => ({
      month: d.month,
      vendas: d.sales,
      estoque: d.stock,
      compras: d.purchases,
      estoqueMin: d.minStock,
      estoqueMax: d.maxStock,
      predicao: undefined,
      estoquePredicao: undefined,
    }));

    // Calculate predictions for next 6 months
    if (data.length > 0) {
      const lastMonths = data.slice(-3);
      const avgSales = lastMonths.reduce((sum, d) => sum + d.sales, 0) / lastMonths.length;
      const avgPurchases = lastMonths.reduce((sum, d) => sum + d.purchases, 0) / lastMonths.length;
      
      // Calcular tendência histórica: proporção estoque/vendas (cobertura)
      const stockCoverageRatios = lastMonths
        .filter(d => d.sales > 0)
        .map(d => d.stock / d.sales);
      const avgStockCoverage = stockCoverageRatios.length > 0 
        ? stockCoverageRatios.reduce((sum, r) => sum + r, 0) / stockCoverageRatios.length 
        : 1.3; // Default: 30% acima das vendas
      
      const lastMonth = data[data.length - 1];
      const lastYear = lastMonth.year;
      const lastMonthNum = parseInt(lastMonth.month.split('-')[1]);
      
      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      
      for (let i = 1; i <= 6; i++) {
        const nextMonthNum = ((lastMonthNum + i - 1) % 12) + 1;
        const nextYear = lastYear + Math.floor((lastMonthNum + i - 1) / 12);
        const monthLabel = `${monthNames[nextMonthNum - 1]}/${nextYear.toString().slice(-2)} (P)`;
        
        // Projetar estoque baseado na tendência histórica de cobertura
        const stockProjetado = avgSales * avgStockCoverage;
        
        const estoqueMinProjetado = avgSales * 0.5;
        const estoqueMaxProjetado = avgSales * 2;
        
        chartData.push({
          month: monthLabel,
          vendas: undefined,
          estoque: undefined,
          compras: undefined,
          estoqueMin: estoqueMinProjetado,
          estoqueMax: estoqueMaxProjetado,
          predicao: avgSales,
          estoquePredicao: stockProjetado,
        });
      }
    }
    
    setMonthlyData(chartData);
    setLoadingMonthlyData(false);
  }, [mockData, selectedClass, selectedFamily, selectedColor, selectedSize, selectedPeriod]);

  // Branch data from mock data
  const branchData = useMemo(() => {
    if (!selectedClass) return [];
    
    let filtered = mockData.filter(d => d.classe === selectedClass);
    
    if (selectedFamily !== "todos") {
      filtered = filtered.filter(d => d.familia === selectedFamily);
    }
    if (selectedColor !== "todos") {
      filtered = filtered.filter(d => d.cor === selectedColor);
    }
    if (selectedSize !== "todos") {
      filtered = filtered.filter(d => d.tamanho === selectedSize);
    }
    
    const branches = filtered.reduce((acc, d) => {
      const local = d.local || "Outros";
      if (!acc[local]) {
        acc[local] = { vendas: 0, estoque: 0 };
      }
      acc[local].vendas += d.qtde_vendida;
      acc[local].estoque += d.estoque_final_mes;
      return acc;
    }, {} as Record<string, { vendas: number; estoque: number }>);

    return Object.entries(branches)
      .map(([name, data]) => ({
        name: name.substring(0, 3),
        vendas: data.vendas,
        estoque: data.estoque,
      }))
      .sort((a, b) => b.vendas - a.vendas);
  }, [mockData, selectedClass, selectedFamily, selectedColor, selectedSize]);

  // Branch distribution
  const branchDistribution = useMemo(() => {
    const total = branchData.reduce((sum, b) => sum + b.vendas, 0);
    return branchData.map((b, i) => ({
      name: b.name,
      value: total > 0 ? (b.vendas / total) * 100 : 0,
      color: ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"][i % 5],
    }));
  }, [branchData]);

  // Recommendation data
  const recommendationData = useMemo(() => {
    if (!classStats) return [];
    
    const diff = classStats.totalEstoque - classStats.totalDemanda;
    
    return [{
      name: "Status",
      recomendado: classStats.totalDemanda,
      atual: classStats.totalEstoque,
      diferenca: diff,
    }];
  }, [classStats]);

  const difference = (recommendationData[0]?.atual || 0) - (recommendationData[0]?.recomendado || 0);
  const isSurplus = difference > 0;

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold">Análise de Demanda vs Estoque</h1>
          <p className="text-muted-foreground">
            Visualize vendas, compras e estoque por classe de produto
          </p>
        </div>

        {isLoading ? (
          <Card className="p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          </Card>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Class Selection */}
          <Card className="p-4 lg:col-span-1">
            <h3 className="text-sm font-semibold mb-4">Selecione uma Classe</h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredClasses.map((classe) => {
                const classProductCount = products.filter(p => p.classe === classe).length;
                return (
                  <div
                    key={classe}
                    onClick={() => setSelectedClass(classe)}
                    className={`p-3 rounded-md cursor-pointer transition-colors border ${
                      selectedClass === classe
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card hover:bg-accent border-border"
                    }`}
                  >
                    <div className="font-medium text-sm">{classe}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {classProductCount} produto{classProductCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Right Content - Analysis */}
          <div className="lg:col-span-3">
            {!selectedClass ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Selecione uma classe para visualizar a análise
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Header with class name and filters */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">{selectedClass}</h2>
                    <Badge variant="outline">
                      {classStats?.totalProducts} produto{classStats?.totalProducts !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <FilterButton
                      label="Local"
                      value={selectedLocation}
                      options={locations.filter(l => l !== "todos")}
                      onChange={setSelectedLocation}
                    />
                    <FilterButton
                      label="Cor"
                      value={selectedColor}
                      options={colors.filter(c => c !== "todos")}
                      onChange={setSelectedColor}
                    />
                    <FilterButton
                      label="Tamanho"
                      value={selectedSize}
                      options={sizes.filter(s => s !== "todos")}
                      onChange={setSelectedSize}
                    />
                    <FilterButton
                      label="Família"
                      value={selectedFamily}
                      options={families.filter(f => f !== "todos")}
                      onChange={setSelectedFamily}
                    />
                  </div>
                </Card>

                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-6">
                  <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-900">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Total de Vendas</p>
                        <p className="text-4xl font-bold text-green-900 dark:text-green-100">
                          {classStats?.totalDemanda.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-500">Unidades vendidas (filtrado)</p>
                  </Card>
                  
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-900">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">Total em Estoque</p>
                        <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">
                          {classStats?.totalEstoque.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-500">Unidades em estoque (filtrado)</p>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 dark:from-purple-950/20 dark:to-violet-950/20 dark:border-purple-900">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">Total de Compras</p>
                        <p className="text-4xl font-bold text-purple-900 dark:text-purple-100">
                          {bigNumbers.totalCompras.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-500">Unidades recebidas (período)</p>
                  </Card>
                </div>

                {/* Monthly Sales Chart */}
                <Card className="p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2">Venda Mensal</h3>
                    <div className="flex gap-3 text-xs mb-3">
                      <span 
                        onClick={() => setSelectedPeriod("inicio")}
                        className={`cursor-pointer transition-colors ${selectedPeriod === "inicio" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        DESDE INÍCIO
                      </span>
                      <span 
                        onClick={() => setSelectedPeriod("3anos")}
                        className={`cursor-pointer transition-colors ${selectedPeriod === "3anos" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        3 ANOS
                      </span>
                      <span 
                        onClick={() => setSelectedPeriod("2anos")}
                        className={`cursor-pointer transition-colors ${selectedPeriod === "2anos" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        2 ANOS
                      </span>
                      <span 
                        onClick={() => setSelectedPeriod("1ano")}
                        className={`cursor-pointer transition-colors ${selectedPeriod === "1ano" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        1 ANO
                      </span>
                      <span 
                        onClick={() => setSelectedPeriod("6meses")}
                        className={`cursor-pointer transition-colors ${selectedPeriod === "6meses" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        6 MESES
                      </span>
                    </div>
                    {periodDisplayText && (
                      <p className="text-xs text-muted-foreground mb-2">{periodDisplayText}</p>
                    )}
                  </div>
                  {loadingMonthlyData ? (
                    <div className="flex items-center justify-center h-[250px]">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ fontSize: 12 }} />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="vendas" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Vendas" connectNulls={false} />
                        <Line type="monotone" dataKey="predicao" stroke="hsl(var(--chart-1))" strokeWidth={2} strokeDasharray="5 5" name="" legendType="none" connectNulls={false} />
                        <Line type="monotone" dataKey="compras" stroke="hsl(var(--chart-6))" strokeWidth={2} name="Compras" connectNulls={false} />
                        <Line type="monotone" dataKey="estoque" stroke="hsl(var(--chart-5))" strokeWidth={2} name="Estoque" connectNulls={false} />
                        <Line type="monotone" dataKey="estoquePredicao" stroke="hsl(var(--chart-5))" strokeWidth={2} strokeDasharray="5 5" name="" legendType="none" connectNulls={false} />
                        <Line type="monotone" dataKey="estoqueMax" stroke="hsl(var(--chart-3))" strokeWidth={1.5} strokeDasharray="5 5" name="Estoque Máx" />
                        <Line type="monotone" dataKey="estoqueMin" stroke="hsl(var(--chart-2))" strokeWidth={1.5} strokeDasharray="5 5" name="Estoque Mín" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </Card>

                {/* Branch Sales and Distribution */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="text-sm font-semibold mb-4">Vendas das Filiais</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={branchData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ fontSize: 12 }} 
                          formatter={(value: number) => value.toFixed(0)}
                        />
                        <Bar dataKey="vendas" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Vendas" />
                        <Bar dataKey="estoque" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Estoque" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card className="p-4">
                    <h3 className="text-sm font-semibold mb-4">Distribuição das Filiais</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={branchDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                          labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                        >
                          {branchDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                {/* Products Table */}
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-4">Produtos ({filteredProducts.length})</h3>
                  <div className="max-h-[400px] overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-card border-b">
                        <tr className="text-left">
                          <th className="p-2 font-semibold text-center">Análise</th>
                          <th className="p-2 font-semibold">SKU</th>
                          <th className="p-2 font-semibold">Produto</th>
                          <th className="p-2 font-semibold">Família</th>
                          <th className="p-2 font-semibold">Cor</th>
                          <th className="p-2 font-semibold">Tamanho</th>
                          <th className="p-2 font-semibold">Local</th>
                          <th className="p-2 font-semibold text-right">Estoque</th>
                          <th className="p-2 font-semibold text-right">Demanda</th>
                          <th className="p-2 font-semibold">Volatilidade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product, index) => (
                          <tr key={`${product.sku}-${product.local}-${index}`} className="border-b hover:bg-accent/50">
                            <td className="p-2 text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  // Convert MockProduct to Product for ProductAnalysis
                                  const productForAnalysis: Product = {
                                    id: `${product.sku}-${product.local}`,
                                    sku: product.sku,
                                    name: product.produto,
                                    category: product.classe,
                                    familia: product.familia,
                                    cor: product.cor,
                                    tamanho: product.tamanho,
                                    local: product.local,
                                    stock: product.estoque_atual,
                                    demandaMedia: product.demanda_media,
                                    volatilidade: product.volatilidade,
                                    estoqueMinSugerido: product.demanda_media * 0.5,
                                    estoqueMaxSugerido: product.demanda_media * 2.0,
                                    min: product.demanda_media * 0.5,
                                    max: product.demanda_media * 2.0,
                                    reorderPoint: product.demanda_media * 0.75,
                                    safetyStock: product.demanda_media * 0.25,
                                    status: product.estoque_atual < product.demanda_media * 0.5 ? 'low' : 
                                            product.estoque_atual > product.demanda_media * 2.0 ? 'high' : 'ok',
                                    filial: product.local,
                                  };
                                  setSelectedProduct(productForAnalysis);
                                  setAnalysisOpen(true);
                                }}
                              >
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                            </td>
                            <td className="p-2 font-mono text-xs">{product.sku}</td>
                            <td className="p-2">{product.produto}</td>
                            <td className="p-2 text-muted-foreground">{product.familia || "-"}</td>
                            <td className="p-2 capitalize">{product.cor || "-"}</td>
                            <td className="p-2 capitalize">{product.tamanho || "-"}</td>
                            <td className="p-2">{product.local}</td>
                            <td className="p-2 text-right font-medium">{product.estoque_atual?.toFixed(0) || 0}</td>
                            <td className="p-2 text-right">{product.demanda_media?.toFixed(1) || 0}</td>
                            <td className="p-2">
                              <Badge 
                                variant={
                                  product.volatilidade === "Alta" ? "destructive" : 
                                  product.volatilidade === "Media" ? "secondary" : 
                                  "default"
                                }
                                className="text-xs"
                              >
                                {product.volatilidade || "Baixa"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
        )}

        <ProductAnalysis
          product={selectedProduct}
          allProducts={filteredProducts.map(p => ({
            id: `${p.sku}-${p.local}`,
            sku: p.sku,
            name: p.produto,
            category: p.classe,
            familia: p.familia,
            cor: p.cor,
            tamanho: p.tamanho,
            local: p.local,
            stock: p.estoque_atual,
            demandaMedia: p.demanda_media,
            volatilidade: p.volatilidade,
            estoqueMinSugerido: p.demanda_media * 0.5,
            estoqueMaxSugerido: p.demanda_media * 2.0,
            min: p.demanda_media * 0.5,
            max: p.demanda_media * 2.0,
            reorderPoint: p.demanda_media * 0.75,
            safetyStock: p.demanda_media * 0.25,
            status: p.estoque_atual < p.demanda_media * 0.5 ? 'low' : 
                    p.estoque_atual > p.demanda_media * 2.0 ? 'high' : 'ok',
            filial: p.local,
          }))}
          open={analysisOpen}
          onOpenChange={setAnalysisOpen}
        />
      </div>
    </DashboardLayout>
  );
}
