// TransportistaOfertas.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const TransportistaOfertas = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idTransportista = usuario?.idUsuario;

  useEffect(() => {
    obtenerSolicitudes();
  }, []);

  const obtenerSolicitudes = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/ofertas/solicitudes-disponibles");
      setSolicitudes(res.data);
    } catch (err) {
      console.error("❌ Error al obtener solicitudes:", err);
      setError("No se pudieron cargar las solicitudes disponibles.");
    }
  };

  /**
   * 🔹 Aceptar una solicitud directamente
   */
  const aceptarSolicitud = async (idNegociacionParam, idSolicitud_Carga, s) => {
    if (!window.confirm("¿Deseas aceptar esta carga y cerrar la negociación?")) return;
    setCargando(true);

    try {
      let idNegociacion = idNegociacionParam;

      // Buscar negociación activa o crear una nueva
      if (!idNegociacion) {
        const resp = await axios.get(
          `http://localhost:4000/api/negociaciones/por-carga/${idSolicitud_Carga}`
        );
        const negociaciones = resp.data || [];

        const existente = negociaciones.find(
          (n) =>
            Number(n.idTransportista) === Number(idTransportista) &&
            n.estado !== "Cancelado" &&
            n.estado !== "Pactado"
        );

        if (existente) {
          idNegociacion = existente.idNegociacion;
        } else {
          const crear = await axios.post("http://localhost:4000/api/negociaciones/crear", {
            idSolicitud_Carga,
            idTransportista,
            monto: s.precio_final, // 💰 usar el precio final actual de la tabla precio_carga
            comentarios: "Aceptación directa (basada en precio actual del cliente)",
          });
          idNegociacion = crear.data.idNegociacion || crear.data.insertId;
        }
      }

      // Pactar la negociación
      const pactar = await axios.put(
        `http://localhost:4000/api/negociaciones/pactar/${idNegociacion}`,
        { idSolicitud_Carga, idTransportista }
      );

      if (!pactar.data.success) {
        alert("❌ No se pudo pactar la negociación.");
        return;
      }

      // Crear contrato blockchain automáticamente
      const contrato = await axios.post("http://localhost:4000/api/blockchain/contrato", {
        idNegociacion,
      });

      if (contrato.data.success) {
        alert(`✅ Contrato creado correctamente.\nTxHash: ${contrato.data.txHash}`);
      } else {
        alert("⚠️ Negociación pactada, pero no se pudo crear el contrato blockchain.");
      }

      await obtenerSolicitudes();
    } catch (err) {
      console.error("❌ Error al aceptar solicitud:", err);
      alert("❌ Error al aceptar la solicitud.");
    } finally {
      setCargando(false);
    }
  };

  /**
   * 🔹 Enviar contraoferta (valida rango precio_min/precio_max)
   */
  const hacerContraoferta = async (idSolicitud_Carga, precio_min, precio_max) => {
    const montoStr = prompt(
      `Ingrese el valor de su contraoferta (entre $${precio_min?.toLocaleString()} y $${precio_max?.toLocaleString()}):`
    );

    if (!montoStr || isNaN(montoStr)) {
      return alert("❌ Debe ingresar un monto válido.");
    }

    const monto = Number(montoStr);
    if (monto < precio_min) return alert(`⚠️ El monto no puede ser menor a $${precio_min}.`);
    if (monto > precio_max) return alert(`⚠️ El monto no puede ser mayor a $${precio_max}.`);

    setCargando(true);
    try {
      const resp = await axios.post("http://localhost:4000/api/negociaciones/crear", {
        idSolicitud_Carga,
        idTransportista,
        monto,
        comentarios: "Contraoferta del transportista",
      });

      if (resp.data.success) {
        alert("✅ Contraoferta enviada correctamente.");
      } else {
        alert("⚠️ No se pudo enviar la contraoferta.");
      }

      await obtenerSolicitudes();
    } catch (err) {
      console.error("❌ Error al crear contraoferta:", err);
      alert("❌ Error al crear la contraoferta.");
    } finally {
      setCargando(false);
    }
  };

  // ------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        🧾 Solicitudes de Carga Disponibles
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-3 rounded mb-6 text-center">
          {error}
        </div>
      )}
      {cargando && (
        <p className="text-center text-blue-600 font-semibold mb-4">
          Cargando información...
        </p>
      )}

      {solicitudes.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          No hay solicitudes disponibles por el momento.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {solicitudes.map((s) => (
            <div
              key={s.idSolicitud_Carga}
              className={`bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition ${
                s.estado_carga === "cerrado" ? "opacity-60" : ""
              }`}
            >
              <h2 className="text-xl font-semibold text-blue-700 mb-2">
                {s.origen} ➜ {s.destino}
              </h2>
              <p className="text-gray-700 mb-1">
                <strong>Descripción:</strong> {s.descripcion}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Peso:</strong> {s.peso} kg
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Distancia:</strong> {s.distancia_km} km
              </p>

              <div className="bg-gray-100 rounded-lg p-3 mt-3">
                <p className="text-sm text-gray-600 mb-1">
                  💰 <strong>Precio ofertado:</strong>{" "}
                  ${s.precio_final?.toLocaleString() || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  🔄 <strong>Rango permitido:</strong>{" "}
                  ${s.precio_min?.toLocaleString()} - ${s.precio_max?.toLocaleString()}
                </p>
                <p className="text-sm mt-2">
                  📦 <strong>Estado:</strong>{" "}
                  <span className="font-semibold">{s.estado_carga}</span>
                </p>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => aceptarSolicitud(s.idNegociacion, s.idSolicitud_Carga, s)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                  disabled={s.estado_carga === "cerrado"}
                >
                  Aceptar
                </button>
                <button
                  onClick={() =>
                    hacerContraoferta(s.idSolicitud_Carga, s.precio_min, s.precio_max)
                  }
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                  disabled={s.estado_carga === "cerrado"}
                >
                  Contraoferta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransportistaOfertas;
