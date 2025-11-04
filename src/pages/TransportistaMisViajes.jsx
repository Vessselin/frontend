import React, { useEffect, useState } from "react";
import axios from "axios";

const TransportistaMisViajes = () => {
  const [negociaciones, setNegociaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [valoresInput, setValoresInput] = useState({});
  const [idTransportista, setIdTransportista] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("usuario"));
    if (userData && userData.idUsuario) {
      setIdTransportista(userData.idUsuario);
    } else {
      alert("Debes iniciar sesión nuevamente.");
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    if (!idTransportista) return;
    const fetchNegociaciones = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/negociaciones-transportista/${idTransportista}`
        );
        const mapped = res.data.map((n) => ({
          ...n,
          originalMin: Number(n.precio_min),
          originalMax: Number(n.precio_max)
        }));
        setNegociaciones(mapped);
      } catch (error) {
        console.error("❌ Error al cargar negociaciones:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNegociaciones();
  }, [idTransportista]);

  const aceptar = async (idNegociacion, idSolicitud_Carga) => {
    try {
      const res = await axios.put(
        `http://localhost:4000/api/negociaciones/pactar/${idNegociacion}`,
        { idSolicitud_Carga }
      );

      if (!res.data.success) {
        if (res.data.message.includes("tomada")) {
          alert("⚠️ Esta carga ya fue tomada por otro transportista.");
        } else {
          alert("❌ No se pudo pactar la negociación.");
        }
        return window.location.reload();
      }

      // 2️⃣ Crear contrato automáticamente
      const contratoRes = await axios.post(
        "http://localhost:4000/api/blockchain/contrato",
        { idNegociacion }
      );

      if (contratoRes.data.success) {
        alert(
          `✅ Contrato generado correctamente.\nTxHash: ${contratoRes.data.txHash}`
        );
      } else {
        alert("⚠️ Negociación aceptada, pero ocurrió un error al crear el contrato.");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error al aceptar:", error);
      alert("❌ Ocurrió un error al aceptar la negociación.");
    }
  };


  const contraofertar = async (neg) => {
    const raw = valoresInput[neg.idNegociacion];
    const valor = Number(raw);
    const min = Number(neg.originalMin);
    const max = Number(neg.originalMax);

    if (!raw || isNaN(valor)) return alert("Ingrese un monto válido.");
    if (min && valor < min) return alert(`La oferta no puede ser menor a ${min}.`);
    if (max && valor > max) return alert(`La oferta no puede ser mayor a ${max}.`);

    try {
      await axios.post(
        "http://localhost:4000/api/negociaciones-transportista/contraoferta",
        { idNegociacion: neg.idNegociacion, nuevoMonto: valor }
      );
      alert("📩 Contraoferta enviada correctamente.");
      window.location.reload();
    } catch (error) {
      console.error("Error en contraoferta:", error);
      alert("❌ Error al enviar la contraoferta.");
    }
  };

  const cancelar = async (idNegociacion) => {
    try {
      await axios.put(
        `http://localhost:4000/api/negociaciones-transportista/cancelar/${idNegociacion}`
      );
      alert("🚫 Negociación cancelada");
      window.location.reload();
    } catch (error) {
      console.error("Error al cancelar:", error);
    }
  };

  if (loading) return <p>Cargando información...</p>;

  return (
    <div className="contenedor">
      <h2>🚚 Mis Negociaciones</h2>
      {negociaciones.length === 0 ? (
        <p>No tienes negociaciones activas.</p>
      ) : (
        negociaciones
          .filter((neg) => neg.estado !== "Cancelado" && neg.estado !== "Pactado")
          .map((neg) => (
            <div key={neg.idNegociacion} className="tarjeta">
              <h3>{neg.descripcion}</h3>
              <p><b>Origen:</b> {neg.origen} → <b>Destino:</b> {neg.destino}</p>
              <p><b>Peso:</b> {neg.peso} kg | <b>Distancia:</b> {neg.distancia_km} km</p>
              <p><b>Monto actual:</b> ${neg.monto ?? "N/A"}</p>
              <p><b>Rango permitido:</b> ${neg.originalMin} - ${neg.originalMax}</p>
              <p><b>Estado:</b> {neg.estado}</p>

              {neg.estado === "Oferta_Cliente" && (
                <div>
                  <button onClick={() => aceptar(neg.idNegociacion, neg.idSolicitud_Carga)}>Aceptar</button>

                  <input
                    type="number"
                    placeholder={`Entre ${neg.originalMin} y ${neg.originalMax}`}
                    value={valoresInput[neg.idNegociacion] ?? ""}
                    onChange={(e) =>
                      setValoresInput({
                        ...valoresInput,
                        [neg.idNegociacion]: e.target.value
                      })
                    }
                  />

                  <button onClick={() => contraofertar(neg)}>Contraoferta</button>
                  <button onClick={() => cancelar(neg.idNegociacion)}>Cancelar</button>
                </div>
              )}

              {neg.estado === "Oferta_Transportista" && (
                <p style={{ color: "gray" }}>⏳ Esperando respuesta del cliente...</p>
              )}

              {neg.estado === "Cancelado" && <p style={{ color: "red" }}>❌ Esta oferta ha sido cancelada</p>}
              {neg.estado === "Pactado" && <p style={{ color: "green" }}>✅ Negociación pactada</p>}
            </div>
          ))
      )}
    </div>
  );
};

export default TransportistaMisViajes;
