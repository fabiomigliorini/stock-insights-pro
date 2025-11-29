import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Import from "./pages/Import";
import ProcessUpload from "./pages/ProcessUpload";
import Produtos from "./pages/Produtos";
import Predicoes from "./pages/Predicoes";
import Filiais from "./pages/Filiais";
import AnalyzeData from "./pages/AnalyzeData";
import AnalyzePrediction from "./pages/AnalyzePrediction";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/import" element={<Import />} />
          <Route path="/process-upload" element={<ProcessUpload />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/predicoes" element={<Predicoes />} />
          <Route path="/filiais" element={<Filiais />} />
          <Route path="/analyze-data" element={<AnalyzeData />} />
          <Route path="/analyze-prediction" element={<AnalyzePrediction />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
