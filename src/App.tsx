
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import Create from "./pages/Create";
import NFTDetail from "./pages/NFTDetail";
import NotFound from "./pages/NotFound";
import { AccountsProvider } from "./web3/lib/wallets/AccountsProvider";
import { UniqueSDKProvider } from "./web3/lib/sdk/UniqueSDKProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AccountsProvider>
        <UniqueSDKProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/create" element={<Create />} />
                  <Route path="/nft/:id" element={<NFTDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </UniqueSDKProvider>
      </AccountsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
