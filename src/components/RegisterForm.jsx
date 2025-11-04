import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    tipoUsuario: "cliente",
    empresa: "",
    nit: "",
    placa: "",
    vehiculo: "",
    capacidad: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/register",
        formData
      );

      alert(response.data.message || "Registro exitoso");

      // Reiniciar formulario
      setFormData({
        nombre: "",
        correo: "",
        contrasena: "",
        tipoUsuario: "cliente",
        empresa: "",
        nit: "",
        placa: "",
        vehiculo: "",
        capacidad: "",
      });

      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Error al registrar usuario");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label>Nombre:</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />

        <label>Correo:</label>
        <input
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          required
        />

        <label>Contraseña:</label>
        <input
          type="password"
          name="contrasena"
          value={formData.contrasena}
          onChange={handleChange}
          required
        />

        <label>Tipo de usuario:</label>
        <select
          name="tipoUsuario"
          value={formData.tipoUsuario}
          onChange={handleChange}
        >
          <option value="cliente">Cliente (Solicitante)</option>
          <option value="transportista">Transportista</option>
        </select>

        {formData.tipoUsuario === "cliente" && (
          <>
            <label>Empresa:</label>
            <input
              type="text"
              name="empresa"
              value={formData.empresa}
              onChange={handleChange}
              required
            />
            <label>NIT:</label>
            <input
              type="text"
              name="nit"
              value={formData.nit}
              onChange={handleChange}
              required
            />
          </>
        )}

        {formData.tipoUsuario === "transportista" && (
          <>
            <label>Placa del vehículo:</label>
            <input
              type="text"
              name="placa"
              value={formData.placa}
              onChange={handleChange}
              required
            />

            <label>Vehículo:</label>
            <input
              type="text"
              name="vehiculo"
              value={formData.vehiculo}
              onChange={handleChange}
              required
            />

            <label>Capacidad (kg):</label>
            <input
              type="number"
              name="capacidad"
              value={formData.capacidad}
              onChange={handleChange}
              required
            />
          </>
        )}

        <button type="submit">Registrarse</button>
      </form>

      <p style={{ textAlign: "center", marginTop: "10px" }}>
        ¿Ya tienes una cuenta?{" "}
        <button
          onClick={() => navigate("/login")}
          style={{
            background: "none",
            color: "#007bff",
            border: "none",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Inicia sesión
        </button>
      </p>
    </div>
  );
};

const styles = {
  container: {
    width: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    background: "#f9f9f9",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
};

export default RegisterForm;
