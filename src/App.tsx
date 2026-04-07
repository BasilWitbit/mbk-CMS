import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { CMSLayout } from "@/components/cms/CMSLayout";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Profile from "./pages/cms/Profile";
import Dashboard from "./pages/cms/Dashboard";
import PostsList from "./pages/cms/PostsList";
import PostEditor from "./pages/cms/PostEditor";
import CategoriesList from "./pages/cms/CategoriesList";
import CategoryEditor from "./pages/cms/CategoryEditor";
import PageEditor from "./pages/cms/PageEditor";
import PagesList from "./pages/cms/PagesList";
import PartnersList from "./pages/cms/PartnersList";
import UsersList from "./pages/cms/UsersList";
import CMSSettings from "./pages/cms/CMSSettings";
import MediaLibrary from "./pages/cms/MediaLibrary";
import SiteIdentity from "./pages/cms/SiteIdentity";
import SocialMedia from "./pages/cms/SocialMedia";
import ContactInfoPage from "./pages/cms/ContactInfoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/cms" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/cms" element={<CMSLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="posts" element={<PostsList />} />
              <Route path="posts/:id" element={<PostEditor />} />
              <Route path="categories" element={<CategoriesList />} />
              <Route path="categories/new" element={<CategoryEditor />} />
              <Route path="categories/:id" element={<CategoryEditor />} />
              <Route path="pages" element={<PagesList />} />
              <Route path="pages/:slug" element={<PageEditor />} />
              <Route path="partners" element={<PartnersList />} />
              <Route path="users" element={<UsersList />} />
              <Route path="settings" element={<CMSSettings />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="site-identity" element={<SiteIdentity />} />
              <Route path="social-media" element={<SocialMedia />} />
              <Route path="contact-info" element={<ContactInfoPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
