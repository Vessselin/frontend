import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // 👈 para redirección

function LoginForm({ setUser }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Redirigir dependiendo del rol
  const redirigir = useCallback((user) => {
    const role =
      Number(
        user.idTipoUsuario ??
        user.tipoUsuario ??
        user.idTipo_Usuario ??
        user.idTipo_usuario ??
        user.role
      );

    if (role === 1) console.log("Admin logueado");
    else if (role === 2) console.log("Cliente logueado");
    else if (role === 3) console.log("Transportista logueado");
    else console.error("Error: rol de usuario no reconocido");
  }, []);

  // Restaurar sesión si existe
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      const parsed = JSON.parse(usuarioGuardado);
      setUser(parsed);
      redirigir(parsed);
    }
  }, [setUser, redirigir]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      const data = await res.json();
      if (res.ok) {
        // Normalizo los datos
        const rawRole =
          data.idTipoUsuario ??
          data.tipoUsuario ??
          data.idTipo_Usuario ??
          data.idTipo_usuario ??
          data.role;
        const idTipoUsuario = Number(rawRole);

        const usuarioNormalizado = {
          idUsuario: data.idUsuario,
          nombre: data.nombre,
          idTipoUsuario,
        };

        // Guardar sesión
        localStorage.setItem("usuario", JSON.stringify(usuarioNormalizado));
        setUser(usuarioNormalizado);

        setMessage(`✅ Bienvenido, ${data.nombre}`);
        redirigir(usuarioNormalizado);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error de conexión con el servidor");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Ingresar
        </button>
      </form>

      <p>{message}</p>

      {/* 👇 Enlace al registro */}
      <p>
        ¿No tienes cuenta?{" "}
        <button
          onClick={() => navigate("/register")}
          style={styles.linkButton}
        >
          Regístrate aquí
        </button>
      </p>
    </div>
  );
}

const styles = {
  container: { maxWidth: "400px", margin: "50px auto", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "8px", borderRadius: "5px", border: "1px solid #ccc" },
  button: {
    padding: "8px",
    border: "none",
    borderRadius: "5px",
    background: "#007bff",
    color: "white",
  },
  linkButton: {
    background: "none",
    color: "#007bff",
    border: "none",
    textDecoration: "underline",
    cursor: "pointer",
  },
};

export default LoginForm;
