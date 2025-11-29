import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Product } from "@/lib/excelParser";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

interface ProductAnalysisProps {
  product: Product | null;
  allProducts: Product[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductAnalysis = ({ product, allProducts, open, onOpenChange }: ProductAnalysisProps) => {
  const [selectedLocation, setSelectedLocation] = useState("todos");
  const [selectedColor, setSelectedColor] = useState("todos");

  // Get unique locations and colors for this product
  const locations = useMemo(() => {
    if (!product) return [];
    const locs = allProducts
      .filter(p => p.sku === product.sku || p.name === product.name)
      .map(p => p.local)
      .filter((v, i, a) => v && a.indexOf(v) === i);
    return ["todos", ...locs];
  }, [product, allProducts]);

  const colors = useMemo(() => {
    if (!product) return [];
    const cols = allProducts
      .filter(p => p.sku === product.sku || p.name === product.name)
      .map(p => p.cor)
      .filter((v, i, a) => v && a.indexOf(v) === i);
    return ["todos", ...cols];
  }, [product, allProducts]);

  // Mock data for charts - em produção, viriam do backend
  const monthlyData = useMemo(() => {
    if (!product) return [];
    const demanda = product.demandaMedia || 50;
    const volatility = product.volatilidade === "Alta" ? 0.3 : product.volatilidade === "Media" ? 0.15 : 0.05;
    
    return Array.from({ length: 12 }, (_, i) => ({
      month: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][i],
      vendas: Math.max(0, demanda + (Math.random() - 0.5) * demanda * volatility * 2),
      estoque: product.estoqueMinSugerido || product.min || 100,
      min: product.estoqueMinSugerido || product.min || 50,
      max: product.estoqueMaxSugerido || product.max || 200,
    }));
  }, [product]);

  const branchData = useMemo(() => {
    if (!product) return [];
    
    const branches = allProducts
      .filter(p => (p.sku === product.sku || p.name === product.name) && p.local)
      .reduce((acc, p) => {
        const local = p.local || "Outros";
        if (!acc[local]) {
          acc[local] = { vendas: 0, estoque: 0 };
        }
        acc[local].vendas += p.demandaMedia || 0;
        acc[local].estoque += p.estoqueMinSugerido || p.min || 0;
        return acc;
      }, {} as Record<string, { vendas: number; estoque: number }>);

    return Object.entries(branches).map(([name, data]) => ({
      name: name.substring(0, 3),
      vendas: data.vendas,
      estoque: data.estoque,
    }));
  }, [product, allProducts]);

  const branchDistribution = useMemo(() => {
    if (!product) return [];
    
    const total = branchData.reduce((sum, b) => sum + b.vendas, 0);
    return branchData.map((b, i) => ({
      name: b.name,
      value: total > 0 ? (b.vendas / total) * 100 : 0,
      color: ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"][i % 5],
    }));
  }, [branchData]);

  const recommendationData = useMemo(() => {
    if (!product) return [];
    
    const demanda = product.demandaMedia || 50;
    const estoqueAtual = product.estoqueMinSugerido || product.min || 100;
    const diff = estoqueAtual - demanda;
    
    return [{
      name: "Status",
      recomendado: demanda,
      atual: estoqueAtual,
      diferenca: diff,
    }];
  }, [product]);

  const seasonalData = useMemo(() => {
    if (!product) return [];
    const demanda = product.demandaMedia || 50;
    
    return Array.from({ length: 12 }, (_, i) => ({
      month: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i],
      vendas: demanda * (1 + Math.sin(i / 12 * Math.PI * 2) * 0.3),
    }));
  }, [product]);

  if (!product) return null;

  const difference = (recommendationData[0]?.atual || 0) - (recommendationData[0]?.recomendado || 0);
  const isSurplus = difference > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[90vw] overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-lg">
            #{product.sku} {product.name}
          </SheetTitle>
        </SheetHeader>

        <div className="flex gap-6 mt-6">
          {/* Left Sidebar - Filters */}
          <div className="w-48 space-y-6 flex-shrink-0">
            <div>
              <h3 className="text-sm font-medium mb-3">Local de Estoque</h3>
              <RadioGroup value={selectedLocation} onValueChange={setSelectedLocation}>
                {locations.map((loc) => (
                  <div key={loc} className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value={loc} id={`loc-${loc}`} />
                    <Label htmlFor={`loc-${loc}`} className="text-sm cursor-pointer capitalize">
                      {loc}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {colors.length > 1 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Variações Ativas</h3>
                <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                  {colors.map((cor) => (
                    <div key={cor} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value={cor} id={`cor-${cor}`} />
                      <Label htmlFor={`cor-${cor}`} className="text-sm cursor-pointer capitalize">
                        {cor}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* First Row: Monthly Sales + Recommendation + Seasonal */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 col-span-2">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">Venda Mensal</h3>
                  <div className="flex gap-3 text-xs mb-3">
                    <span className="text-muted-foreground cursor-pointer hover:text-foreground">DESDE INÍCIO</span>
                    <span className="text-muted-foreground cursor-pointer hover:text-foreground">3 ANOS</span>
                    <span className="text-muted-foreground cursor-pointer hover:text-foreground">2 ANOS</span>
                    <span className="text-primary font-semibold cursor-pointer">1 ANO</span>
                    <span className="text-muted-foreground cursor-pointer hover:text-foreground">6 MESES</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="vendas" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Vendas" />
                    <Line type="monotone" dataKey="estoque" stroke="hsl(var(--destructive))" strokeWidth={2} name="Estoque" />
                    <Line type="monotone" dataKey="min" stroke="hsl(var(--muted))" strokeWidth={1} strokeDasharray="5 5" name="Mín" />
                    <Line type="monotone" dataKey="max" stroke="hsl(var(--muted))" strokeWidth={1} strokeDasharray="5 5" name="Máx" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-4">Recomendado</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={recommendationData} layout="horizontal">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Bar dataKey="recomendado" fill="hsl(var(--chart-1))" radius={[4, 4, 4, 4]} />
                    <Bar dataKey="atual" fill="hsl(var(--destructive))" radius={[4, 4, 4, 4]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-center mt-3">
                  <p className={`text-sm font-semibold ${isSurplus ? 'text-destructive' : 'text-chart-1'}`}>
                    {isSurplus ? 'Sobrando' : 'Faltando'} {Math.abs(difference).toFixed(0)} unidade(s)
                  </p>
                </div>
              </Card>
            </div>

            {/* Seasonal Sales */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-4">Venda Volta às Aulas</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={seasonalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="vendas" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Second Row: Branch Sales + Distribution */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-4">Vendas das Filiais</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={branchData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="vendas" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="estoque" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
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

            {/* Product Details Summary */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-4">Detalhes do Produto</h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Família</p>
                  <p className="font-medium">{product.familia || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Classe</p>
                  <p className="font-medium">{product.classe || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Demanda Média</p>
                  <p className="font-medium">{product.demandaMedia?.toFixed(2) || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Volatilidade</p>
                  <Badge variant={product.volatilidade === "Alta" ? "destructive" : product.volatilidade === "Media" ? "warning" : "success"}>
                    {product.volatilidade || '-'}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
