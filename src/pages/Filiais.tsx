import { DashboardLayout } from "@/components/DashboardLayout";
import { BranchesOverview } from "@/components/BranchesOverview";
import { TransferSuggestions } from "@/components/TransferSuggestions";
import { Card } from "@/components/ui/card";
import { dataStore } from "@/lib/dataStore";
import { Building2, MapPin, Phone } from "lucide-react";

const Filiais = () => {
  const branches = dataStore.getBranches();

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Filiais</h1>
          <p className="text-muted-foreground">
            Gestão de estoque e capacidade por localização
          </p>
        </div>

        <BranchesOverview />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <Card key={branch.name} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{branch.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {branch.stock} / {branch.capacity} unidades
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Localização disponível após importação</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Contato disponível após importação</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <TransferSuggestions />
      </div>
    </DashboardLayout>
  );
};

export default Filiais;
