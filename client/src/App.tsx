import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import SearchResults from "@/pages/SearchResults";
import NotFound from "@/pages/not-found";
import AdminAIAnalytics from "@/pages/AdminAIAnalytics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={SearchResults} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/admin/ai-analytics" component={AdminAIAnalytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
