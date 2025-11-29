import { useState, useMemo, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Search, BarChart3 } from "lucide-react";
import { ProductAnalysis } from "@/components/ProductAnalysis";
import { Product } from "@/lib/excelParser";

export default function Classes() {
  const { products } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("todos");
  const [selectedColor, setSelectedColor] = useState("todos");
  const [selectedSize, setSelectedSize] = useState("todos");
  const [selectedFamily, setSelectedFamily] = useState("todos");
  const [selectedPeriod, setSelectedPeriod] = useState<"inicio" | "3anos" | "2anos" | "1ano" | "6meses">("1ano");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);

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

  // Get unique locations for the selected class
  const locations = useMemo(() => {
    if (!selectedClass) return ["todos"];
    const locs = [...new Set(classProducts.map(p => p.local).filter(Boolean))];
    return ["todos", ...locs];
  }, [classProducts, selectedClass]);

  // Get unique colors for the selected class
  const colors = useMemo(() => {
    if (!selectedClass) return ["todos"];
    const cols = [...new Set(classProducts.map(p => p.cor).filter(Boolean))];
    return ["todos", ...cols];
  }, [classProducts, selectedClass]);

  // Get unique sizes for the selected class
  const sizes = useMemo(() => {
    if (!selectedClass) return ["todos"];
    const szs = [...new Set(classProducts.map(p => p.tamanho).filter(Boolean))];
    return ["todos", ...szs];
  }, [classProducts, selectedClass]);

  // Get unique families for the selected class
  const families = useMemo(() => {
    if (!selectedClass) return ["todos"];
    const fams = [...new Set(classProducts.map(p => p.familia).filter(Boolean))];
    return ["todos", ...fams];
  }, [classProducts, selectedClass]);

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

  // Calculate aggregated stats
  const classStats = useMemo(() => {
    if (filteredProducts.length === 0) return null;
    
    const totalDemanda = filteredProducts.reduce((sum, p) => sum + (p.demandaMedia || 0), 0);
    const avgDemanda = totalDemanda / filteredProducts.length;
    const totalEstoque = filteredProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalMin = filteredProducts.reduce((sum, p) => sum + (p.estoqueMinSugerido || 0), 0);
    const totalMax = filteredProducts.reduce((sum, p) => sum + (p.estoqueMaxSugerido || 0), 0);
    
    // Volatilidade predominante
    const volatilidades = filteredProducts.map(p => p.volatilidade || 'Baixa');
    const volatilityCount = volatilidades.reduce((acc, v) => {
      acc[v] = (acc[v] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const predominantVolatility = Object.entries(volatilityCount).sort((a, b) => b[1] - a[1])[0][0];

    return {
      totalProducts: filteredProducts.length,
      totalDemanda,
      avgDemanda,
      totalEstoque,
      totalMin,
      totalMax,
      predominantVolatility,
    };
  }, [filteredProducts]);

  // Monthly data with historical sales and future predictions
  const monthlyData = useMemo(() => {
    if (!classStats) return [];
    
    const monthsMap = {
      "inicio": 36,
      "3anos": 36,
      "2anos": 24,
      "1ano": 12,
      "6meses": 6,
    };
    const numMonths = monthsMap[selectedPeriod];
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    const volatility = classStats.predominantVolatility === "Alta" ? 0.3 : 
                       classStats.predominantVolatility === "Media" ? 0.15 : 0.05;
    
    // Historical data
    const historicalData = Array.from({ length: numMonths }, (_, i) => {
      const monthIndex = i % 12;
      const year = Math.floor(i / 12);
      const vendas = Math.max(0, classStats.totalDemanda + (Math.random() - 0.5) * classStats.totalDemanda * volatility * 2);
      return {
        month: numMonths > 12 ? `${monthNames[monthIndex]}/${year + 1}` : monthNames[monthIndex],
        vendas,
        estoque: classStats.totalEstoque,
        min: classStats.totalMin,
        max: classStats.totalMax,
        seguranca: classStats.totalMin * 1.2,
        predicao: undefined,
      };
    });

    // Prediction for next 12 months
    const predictionData = Array.from({ length: 12 }, (_, i) => {
      const monthIndex = i % 12;
      const lastHistoricalSales = historicalData[historicalData.length - 1]?.vendas || classStats.totalDemanda;
      // Trend: slight growth with volatility
      const trend = 1 + (i * 0.01); // 1% growth per month
      const predicao = Math.max(0, lastHistoricalSales * trend + (Math.random() - 0.5) * lastHistoricalSales * volatility);
      
      return {
        month: `${monthNames[monthIndex]} (P)`,
        vendas: undefined,
        estoque: undefined,
        min: classStats.totalMin,
        max: classStats.totalMax,
        seguranca: classStats.totalMin * 1.2,
        predicao,
      };
    });

    return [...historicalData, ...predictionData];
  }, [classStats, selectedPeriod]);

  // Branch data
  const branchData = useMemo(() => {
    if (filteredProducts.length === 0) return [];
    
    const branches = filteredProducts
      .filter(p => p.local)
      .reduce((acc, p) => {
        const local = p.local || "Outros";
        if (!acc[local]) {
          acc[local] = { vendas: 0, estoque: 0 };
        }
        acc[local].vendas += p.demandaMedia || 0;
        acc[local].estoque += p.stock || 0;
        return acc;
      }, {} as Record<string, { vendas: number; estoque: number }>);

    return Object.entries(branches)
      .map(([name, data]) => ({
        name: name.substring(0, 3),
        vendas: data.vendas,
        estoque: data.estoque,
      }))
      .sort((a, b) => b.vendas - a.vendas);
  }, [filteredProducts]);

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
          <h1 className="text-3xl font-bold">Análise por Classes</h1>
          <p className="text-muted-foreground">
            Visualize métricas agregadas por classe de produtos
          </p>
        </div>

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
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{selectedClass}</h2>
                    <Badge variant="outline">
                      {classStats?.totalProducts} produto{classStats?.totalProducts !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Local de Estoque</h3>
                      <RadioGroup value={selectedLocation} onValueChange={setSelectedLocation} className="flex flex-wrap gap-3">
                        {locations.map((loc) => (
                          <div key={loc} className="flex items-center space-x-2">
                            <RadioGroupItem value={loc} id={`loc-${loc}`} />
                            <Label htmlFor={`loc-${loc}`} className="text-sm cursor-pointer capitalize">
                              {loc}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Cor</h3>
                      <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex flex-wrap gap-3">
                        {colors.map((cor) => (
                          <div key={cor} className="flex items-center space-x-2">
                            <RadioGroupItem value={cor} id={`cor-${cor}`} />
                            <Label htmlFor={`cor-${cor}`} className="text-sm cursor-pointer capitalize">
                              {cor}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Tamanho</h3>
                      <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-3">
                        {sizes.map((tam) => (
                          <div key={tam} className="flex items-center space-x-2">
                            <RadioGroupItem value={tam} id={`tam-${tam}`} />
                            <Label htmlFor={`tam-${tam}`} className="text-sm cursor-pointer capitalize">
                              {tam}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Família</h3>
                      <RadioGroup value={selectedFamily} onValueChange={setSelectedFamily} className="flex flex-wrap gap-3">
                        {families.map((fam) => (
                          <div key={fam} className="flex items-center space-x-2">
                            <RadioGroupItem value={fam} id={`fam-${fam}`} />
                            <Label htmlFor={`fam-${fam}`} className="text-sm cursor-pointer capitalize">
                              {fam}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </Card>

                {/* Stats Overview */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Demanda Total</p>
                    <p className="text-2xl font-bold mt-1">{classStats?.totalDemanda.toFixed(0)}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Estoque Total</p>
                    <p className="text-2xl font-bold mt-1">{classStats?.totalEstoque.toFixed(0)}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Demanda Média</p>
                    <p className="text-2xl font-bold mt-1">{classStats?.avgDemanda.toFixed(1)}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Volatilidade</p>
                    <Badge 
                      className="mt-2"
                      variant={
                        classStats?.predominantVolatility === "Alta" ? "destructive" : 
                        classStats?.predominantVolatility === "Media" ? "secondary" : 
                        "default"
                      }
                    >
                      {classStats?.predominantVolatility}
                    </Badge>
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
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="vendas" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Vendas" connectNulls={false} />
                      <Line type="monotone" dataKey="predicao" stroke="hsl(var(--chart-1))" strokeWidth={2} strokeDasharray="5 5" name="Predição" connectNulls={false} />
                      <Line type="monotone" dataKey="estoque" stroke="hsl(var(--chart-5))" strokeWidth={2} name="Estoque" connectNulls={false} />
                      <Line type="monotone" dataKey="max" stroke="hsl(var(--chart-3))" strokeWidth={1.5} strokeDasharray="5 5" name="Estoque Máx" />
                      <Line type="monotone" dataKey="min" stroke="hsl(var(--chart-2))" strokeWidth={1.5} strokeDasharray="5 5" name="Estoque Mín" />
                      <Line type="monotone" dataKey="seguranca" stroke="hsl(var(--chart-4))" strokeWidth={1.5} strokeDasharray="3 3" name="Segurança" />
                    </LineChart>
                  </ResponsiveContainer>
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
                          <th className="p-2 font-semibold">SKU</th>
                          <th className="p-2 font-semibold">Produto</th>
                          <th className="p-2 font-semibold">Família</th>
                          <th className="p-2 font-semibold">Cor</th>
                          <th className="p-2 font-semibold">Tamanho</th>
                          <th className="p-2 font-semibold">Local</th>
                          <th className="p-2 font-semibold text-right">Estoque</th>
                          <th className="p-2 font-semibold text-right">Demanda</th>
                          <th className="p-2 font-semibold">Volatilidade</th>
                          <th className="p-2 font-semibold text-center">Análise</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-accent/50">
                            <td className="p-2 font-mono text-xs">{product.sku}</td>
                            <td className="p-2">{product.name}</td>
                            <td className="p-2 text-muted-foreground">{product.familia || "-"}</td>
                            <td className="p-2 capitalize">{product.cor || "-"}</td>
                            <td className="p-2 capitalize">{product.tamanho || "-"}</td>
                            <td className="p-2">{product.local}</td>
                            <td className="p-2 text-right font-medium">{product.stock?.toFixed(0) || 0}</td>
                            <td className="p-2 text-right">{product.demandaMedia?.toFixed(1) || 0}</td>
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
                            <td className="p-2 text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setAnalysisOpen(true);
                                }}
                              >
                                <BarChart3 className="h-4 w-4" />
                              </Button>
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

        <ProductAnalysis
          product={selectedProduct}
          allProducts={products}
          open={analysisOpen}
          onOpenChange={setAnalysisOpen}
        />
      </div>
    </DashboardLayout>
  );
}
