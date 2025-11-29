import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { mes: "Jan", vendas: 240, previsao: null },
  { mes: "Fev", vendas: 320, previsao: null },
  { mes: "Mar", vendas: 280, previsao: null },
  { mes: "Abr", vendas: 390, previsao: null },
  { mes: "Mai", vendas: 420, previsao: null },
  { mes: "Jun", vendas: 380, previsao: null },
  { mes: "Jul", vendas: null, previsao: 410 },
  { mes: "Ago", vendas: null, previsao: 450 },
  { mes: "Set", vendas: null, previsao: 480 },
];

export const StockChart = () => {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Movimentação e Predição</h3>
        <p className="text-sm text-muted-foreground">Histórico real vs. projeção baseada em tendências</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="mes" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="vendas" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={2}
            name="Vendas Reais"
            dot={{ fill: 'hsl(var(--chart-1))' }}
          />
          <Line 
            type="monotone" 
            dataKey="previsao" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Previsão"
            dot={{ fill: 'hsl(var(--chart-2))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
