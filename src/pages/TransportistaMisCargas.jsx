import React, { useEffect, useState } from "react";
import axios from "axios";

const TransportistaMisCargas = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [cargas, setCargas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (usuario?.idUsuario) obtenerCargas();
    else setMensaje("❌ No se encontró el usuario. Inicia sesión nuevamente.");
  }, []);

  const obtenerCargas = async () => {
    setCargando(true);
    try {
      const res = await axios.get(
        `http://localhost:4000/api/solicitudes/transportista/${usuario.idUsuario}`
      );
      setCargas(res.data);
      setMensaje("");
    } catch (error) {
      console.error("❌ Error al obtener cargas:", error);
      setMensaje("No hay cargas cerradas registradas.");
      setCargas([]);
    } finally {
      setCargando(false);
    }
  };

  const descargarContrato = async (hashBlockchain) => {
    if (!hashBlockchain) return alert("⚠️ No hay contrato disponible.");
    try {
      const blob = new Blob(
        [
          `Contrato Blockchain\n\nHash (Dirección): ${hashBlockchain}\n\nEste contrato fue generado automáticamente en Ganache.`
        ],
        { type: "text/plain;charset=utf-8" }
      );

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Contrato_${hashBlockchain.slice(0, 8)}.txt`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("❌ Error al descargar contrato:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        🚛 Mis Cargas Cerradas
      </h1>

      {mensaje && <p className="text-center text-gray-600 mb-4">{mensaje}</p>}
      {cargando && (
        <p className="text-center text-blue-600 font-semibold">Cargando...</p>
      )}

      {cargas.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-md border border-gray-200">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Descripción</th>
                <th className="px-4 py-2">Origen</th>
                <th className="px-4 py-2">Destino</th>
                <th className="px-4 py-2">Precio Final</th>
                <th className="px-4 py-2">Contrato</th>
              </tr>
            </thead>
            <tbody>
              {cargas.map((c) => (
                <tr key={c.idSolicitud_Carga} className="text-center border-b">
                  <td className="px-4 py-2">{c.idSolicitud_Carga}</td>
                  <td className="px-4 py-2">{c.descripcion}</td>
                  <td className="px-4 py-2">{c.origen}</td>
                  <td className="px-4 py-2">{c.destino}</td>
                  <td className="px-4 py-2">
                    {c.precio_final
                      ? `$${Number(c.precio_final).toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => descargarContrato(c.hashBlockchain)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      🖨️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !cargando && (
          <p className="text-center text-gray-500 mt-4">
            No hay cargas cerradas registradas.
          </p>
        )
      )}
    </div>
  );
};

export default TransportistaMisCargas;
