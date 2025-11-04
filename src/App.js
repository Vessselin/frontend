import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Navbar from "./components/NavBar";

// Páginas
import ClientePage from "./pages/ClientePage";
import ClienteCrearSolicitud from "./pages/ClienteCrearSolicitud";
import ClienteMisSolicitudes from "./pages/ClienteMisSolicitudes";
import TransportistaPage from "./pages/TransportistaPage";
import TransportistaMisViajes from "./pages/TransportistaMisViajes";
import TransportistaOfertas from "./pages/TransportistaOfertas";
import ClienteMisViajes from "./pages/ClienteMisViajes";
import TransportistaMisCargas from "./pages/TransportistaMisCargas";

console.log({
  Navbar,
  LoginForm,
  RegisterForm,
  ClientePage,
  ClienteCrearSolicitud,
  ClienteMisSolicitudes,
  ClienteMisViajes,
  TransportistaPage,
  TransportistaOfertas,
  TransportistaMisViajes,
  TransportistaMisCargas,
});


function App() {
  const [usuario, setUsuario] = useState(null);

  // Restaurar sesión 
  useEffect(() => {
    const raw = localStorage.getItem("usuario");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);

      const idUsuario = parsed.idUsuario ?? parsed.id_usuario ?? parsed.id;
      const idTipoUsuario =
        parsed.idTipoUsuario ??
        parsed.idTipo_Usuario ??
        parsed.tipoUsuario ??
        parsed.role ??
        parsed.idTipoUsuario;
      const nombre = parsed.nombre ?? parsed.name ?? parsed.username;
      const normalized = {
        ...parsed,
        idUsuario: Number(idUsuario),
        idTipoUsuario: Number(idTipoUsuario),
        nombre: nombre ?? "Usuario",
      };
      setUsuario(normalized);
      console.log("Sesión restaurada:", normalized);
    } catch (e) {
      console.warn("Error al parsear usuario en localStorage", e);
    }
  }, []);

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  // helper: obtener rol (número o null)
  const rol = usuario ? Number(usuario.idTipoUsuario) : null;

  const RequireRole = ({ allowedRoles, children }) => {
    if (!usuario) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(rol)) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <Router>
      <div>
        <Navbar usuario={usuario} onLogout={handleLogout} />

        <div style={{ padding: "20px" }}>
          <Routes>
            {/* LOGIN / REGISTER - si el usuario ya está logueado, redirigen a "/" */}
            <Route
              path="/login"
              element={!usuario ? <LoginForm setUser={setUsuario} /> : <Navigate to="/" replace />}
            />
            <Route
              path="/register"
              element={!usuario ? <RegisterForm /> : <Navigate to="/" replace />}
            />

            {/* RUTAS CLIENTE (requieren rol 2) */}
            <Route
              path="/cliente"
              element={
                <RequireRole allowedRoles={[2]}>
                  <ClientePage />
                </RequireRole>
              }
            />
            <Route
              path="/cliente/crear-solicitud"
              element={
                <RequireRole allowedRoles={[2]}>
                  <ClienteCrearSolicitud />
                </RequireRole>
              }
            />
            <Route
              path="/cliente/mis-solicitudes"
              element={
                <RequireRole allowedRoles={[2]}>
                  <ClienteMisSolicitudes />
                </RequireRole>
              }
            />
            <Route
              path="/cliente/mis-viajes"
              element={
                <RequireRole allowedRoles={[2]}>
                  <ClienteMisViajes />
                </RequireRole>
              }
            />

            {/* RUTAS TRANSPORTISTA (requieren rol 3) */}
            <Route
              path="/transportista"
              element={
                <RequireRole allowedRoles={[3]}>
                  <TransportistaPage />
                </RequireRole>
              }
            />
            <Route
              path="/transportista/cargas"
              element={
                <RequireRole allowedRoles={[3]}>
                  <TransportistaOfertas />
                </RequireRole>
              }
            />
            <Route
              path="/transportista/mis-viajes"
              element={
                <RequireRole allowedRoles={[3]}>
                  <TransportistaMisViajes />
                </RequireRole>
              }
            />
            <Route
              path="/transportista/mis-cargas"
              element={
                <RequireRole allowedRoles={[3]}>
                  <TransportistaMisCargas />
                </RequireRole>
              }
            />

            {/* RUTA RAIZ: redirige según rol, o a login */}
            <Route
              path="/"
              element={
                !usuario ? (
                  <Navigate to="/login" replace />
                ) : rol === 1 ? (
                  <Navigate to="/admin" replace />
                ) : rol === 2 ? (
                  <Navigate to="/cliente" replace />
                ) : rol === 3 ? (
                  <Navigate to="/transportista" replace />
                ) : (
                  <p>Error: rol no reconocido.</p>
                )
              }
            />

            {/* Si no coincide ninguna ruta */}
            <Route path="*" element={<p>Página no encontrada</p>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
