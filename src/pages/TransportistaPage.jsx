import React from "react";

const TransportistaPage = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  return (
    <div style={styles.container}>
      <h2>🚛 Panel de Transportista</h2>
      <p>Bienvenido {usuario?.nombre}</p>
      <p>Aquí verás las cargas disponibles y tus transportes activos.</p>
    </div>
  );
};

const styles = { container: { textAlign: "center", padding: "20px" } };

export default TransportistaPage;
