import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { Layout } from "./components/Layout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { RoleProtectedRoute } from "./components/RoleProtectedRoute"
import { Dashboard } from "./pages/Dashboard"
import { Links } from "./pages/Links"
import { Settings } from "./pages/Settings"
import { Guidelines } from "./pages/Guidelines"
import Analytics from './pages/Analytics'
import { Organization } from "@/pages/Organization"

function App() {
  return (
    <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="links" element={<Links />} />
                <Route path="settings" element={
                  <RoleProtectedRoute allowedRoles={['Admin']}>
                    <Settings />
                  </RoleProtectedRoute>
                } />
                <Route path="guidelines" element={<Guidelines />} />
                <Route path="/analytics" element={
                  <RoleProtectedRoute allowedRoles={['Admin', 'Editor', 'Viewer']}>
                    <Analytics />
                  </RoleProtectedRoute>
                } />
                <Route path="/organization" element={
                  <RoleProtectedRoute allowedRoles={["Admin"]}>
                    <Organization />
                  </RoleProtectedRoute>
                } />
              </Route>
            </Routes>
          </Router>
          <Toaster />
        </ThemeProvider>
    </AuthProvider>
  )
}

export default App