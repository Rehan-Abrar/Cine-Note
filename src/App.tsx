import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import Watchlist from "./pages/Watchlist";
import MyReviews from "./pages/MyReviews";
import Reviews from "./pages/Reviews";
import NotFound from "./pages/NotFound";
import TopPicks from '@/pages/TopPicks';


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter> {/* ✅ Router MUST come first */}
      <AuthProvider> {/* ✅ Now useNavigate is safe here */}
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Auth initialMode="login" />} />
            <Route path="/signup" element={<Auth initialMode="signup" />} />

            {/* Protected / app routes */}
            <Route path="/top-picks" element={<TopPicks />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<Search />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/reviews/:imdbId" element={<Reviews />} />
            <Route path="/my-reviews" element={<MyReviews />} />     {/* Logged-in user's own reviews */}

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>

        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
