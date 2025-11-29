import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import Index from "./pages/Index";
import Import from "./pages/Import";
import Produtos from "./pages/Produtos";
import Predicoes from "./pages/Predicoes";
import Filiais from "./pages/Filiais";
import TestSheetNames from "./pages/TestSheetNames";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DataProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/import" element={<Import />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/predicoes" element={<Predicoes />} />
            <Route path="/filiais" element={<Filiais />} />
            <Route path="/test-sheets" element={<TestSheetNames />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </DataProvider>
  </QueryClientProvider>
);

export default App;
