import React from "react";

const ClientePage = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  return (
    <div style={styles.container}>
      <h2>📦 Panel de Cliente</h2>
      <p>Bienvenido {usuario?.nombre}</p>
      <p>Aquí puedes crear solicitudes de carga y revisar su estado.</p>
    </div>
  );
};

const styles = { container: { textAlign: "center", padding: "20px" } };

export default ClientePage;
