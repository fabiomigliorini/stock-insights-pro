import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Import from "./pages/Import";
import Classes from "./pages/Classes";
import Transferencias from "./pages/Transferencias";
import TestSheetNames from "./pages/TestSheetNames";
import Auth from "./pages/Auth";
import AdminSetup from "./pages/AdminSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin-setup" element={<ProtectedRoute><AdminSetup /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
              <Route path="/import" element={<ProtectedRoute><Import /></ProtectedRoute>} />
              <Route path="/transferencias" element={<ProtectedRoute><Transferencias /></ProtectedRoute>} />
              <Route path="/test-sheets" element={<ProtectedRoute><TestSheetNames /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
