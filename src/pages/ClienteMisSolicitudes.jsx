import React, { useEffect, useState } from "react";
import axios from "axios";

const ClienteMisSolicitudes = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [solicitudes, setSolicitudes] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (usuario?.idUsuario) obtenerSolicitudes();
    else setMensaje("No se encontró el usuario. Inicia sesión nuevamente.");
  }, []);

  const obtenerSolicitudes = async () => {
    setCargando(true);
    try {
      const res = await axios.get(
        `http://localhost:4000/api/solicitudes/cliente/${usuario.idUsuario}`
      );
      setSolicitudes(res.data);
      setMensaje("");
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
      setMensaje("No hay solicitudes disponibles o cerradas.");
      setSolicitudes([]);
    } finally {
      setCargando(false);
    }
  };

  const cancelarSolicitud = async (idSolicitud_Carga) => {
    if (!window.confirm("¿Deseas cancelar esta solicitud?")) return;
    setCargando(true);
    try {
      const res = await axios.put(
        `http://localhost:4000/api/solicitudes/cancelar/${idSolicitud_Carga}`
      );
      alert(res.data.message || "Solicitud cancelada correctamente.");
      obtenerSolicitudes();
    } catch (error) {
      console.error("Error al cancelar solicitud:", error);
      alert("Error al cancelar la solicitud.");
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
      console.error("Error al descargar contrato:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        📦 Mis Solicitudes de Carga
      </h1>

      {mensaje && <p className="text-center text-gray-600 mb-4">{mensaje}</p>}
      {cargando && (
        <p className="text-center text-blue-600 font-semibold">Cargando...</p>
      )}

      {solicitudes.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-md border border-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Descripción</th>
                <th className="px-4 py-2">Peso (kg)</th>
                <th className="px-4 py-2">Origen</th>
                <th className="px-4 py-2">Destino</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => (
                <tr key={s.idSolicitud_Carga} className="text-center border-b">
                  <td className="px-4 py-2">{s.idSolicitud_Carga}</td>
                  <td className="px-4 py-2">{s.descripcion}</td>
                  <td className="px-4 py-2">{s.peso || "—"}</td>
                  <td className="px-4 py-2">{s.origen}</td>
                  <td className="px-4 py-2">{s.destino}</td>
                  <td
                    className={`px-4 py-2 font-semibold ${
                      s.estado_carga === "cerrado"
                        ? "text-green-600"
                        : s.estado_carga === "disponible"
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {s.estado_carga}
                  </td>
                  <td className="px-4 py-2">
                    {s.estado_carga === "disponible" ? (
                      <button
                        onClick={() => cancelarSolicitud(s.idSolicitud_Carga)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        Cancelar
                      </button>
                    ) : s.estado_carga === "cerrado" ? (
                      <button
                        onClick={() => descargarContrato(s.hashBlockchain)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        🖨️
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !cargando && (
          <p className="text-center text-gray-500 mt-4">
            No hay solicitudes registradas.
          </p>
        )
      )}
    </div>
  );
};

export default ClienteMisSolicitudes;
