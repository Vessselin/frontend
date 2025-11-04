import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ usuario, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    if (onLogout) onLogout();
    navigate("/login");
  };

  if (!usuario) return null;

  const rol = parseInt(usuario.idTipoUsuario);

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <strong style={{ marginRight: 12 }}>AppCargo</strong>

        {/* CLIENTE */}
        {rol === 2 && (
          <>
            <Link to="/cliente" style={styles.link}>Panel</Link>
            <Link to="/cliente/crear-solicitud" style={styles.link}>Crear solicitud</Link>
            <Link to="/cliente/mis-solicitudes" style={styles.link}>Mis solicitudes</Link>
            <Link to="/cliente/mis-viajes" style={styles.link}>Mis viajes</Link>
          </>
        )}

        {/* TRANSPORTISTA */}
        {rol === 3 && (
          <>
            <Link to="/transportista" style={styles.link}>Panel</Link>
            <Link to="/transportista/cargas" style={styles.link}>Cargas disponibles</Link>
            <Link to="/transportista/mis-viajes" style={styles.link}>Mis viajes</Link>
            <Link to="/transportista/mis-cargas" style={styles.link}>Mis cargas</Link>
          </>
        )}
      </div>

      <div style={styles.right}>
        <span style={{ marginRight: 12 }}>👋 Hola, {usuario.nombre}</span>
        <button onClick={handleLogout} style={styles.logoutButton}>Cerrar sesión</button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 16px",
    background: "#0d6efd",
    color: "#fff",
  },
  left: { display: "flex", alignItems: "center", gap: "10px" },
  link: { color: "#fff", textDecoration: "none", marginRight: 12 },
  right: { display: "flex", alignItems: "center" },
  logoutButton: {
    background: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 4,
    cursor: "pointer",
  },
};

export default Navbar;
