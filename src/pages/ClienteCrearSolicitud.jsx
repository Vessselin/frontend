import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Icono del marcador
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function ClienteCrearSolicitud() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [formData, setFormData] = useState({
    descripcion: "",
    peso: "",
    origen: "",
    destino: "",
    origen_lat: null,
    origen_lng: null,
    destino_lat: null,
    destino_lng: null,
    distancia_km: 0,
    precio_estimado: 0,
    precio_usuario: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [posicionActual, setPosicionActual] = useState(null);
  const [destino, setDestino] = useState(null);
  const [permisoUbicacion, setPermisoUbicacion] = useState(false);

  // 🗺️ Obtener ciudad por coordenadas
  const obtenerCiudad = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      return (
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.county ||
        "Ubicación desconocida"
      );
    } catch {
      return "Ubicación desconocida";
    }
  };

  // 📍 Obtener ubicación actual
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        const ciudadOrigen = await obtenerCiudad(coords[0], coords[1]);
        setPosicionActual(coords);
        setFormData((prev) => ({
          ...prev,
          origen: ciudadOrigen,
          origen_lat: coords[0],
          origen_lng: coords[1],
        }));
        setPermisoUbicacion(true);
      },
      () => setMensaje("❌ No se pudo obtener tu ubicación actual")
    );
  }, []);

  // 📏 Calcular distancia (Haversine)
  const calcularDistancia = (origen, destino) => {
    const R = 6371;
    const dLat = ((destino[0] - origen[0]) * Math.PI) / 180;
    const dLon = ((destino[1] - origen[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((origen[0] * Math.PI) / 180) *
        Math.cos((destino[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  //  Calcular precio estimado
  const calcularPrecio = (peso, distancia) => {
    if (!peso || !distancia) return 0;
    const precioKm = 950;
    const precioKg = 1500;
    return Math.round(precioKm * distancia + precioKg * peso);
  };


  // 📍 Mapa para seleccionar destino
  function MapaDestino() {
    useMapEvents({
      async click(e) {
        const nuevaPos = [e.latlng.lat, e.latlng.lng];
        const ciudadDestino = await obtenerCiudad(nuevaPos[0], nuevaPos[1]);
        setDestino(nuevaPos);
        const distancia = calcularDistancia(posicionActual, nuevaPos);
        const precio = calcularPrecio(formData.peso, distancia);
        setFormData((prev) => ({
          ...prev,
          destino: ciudadDestino,
          destino_lat: nuevaPos[0],
          destino_lng: nuevaPos[1],
          distancia_km: distancia,
          precio_estimado: precio,
          precio_usuario: precio,
        }));
      },
    });
    return destino ? <Marker position={destino} /> : null;
  }

  // 🚀 Envío del formulario
  // 🚀 Envío del formulario
const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuario || !usuario.idUsuario) {
      setMensaje("❌ No se encontró el usuario. Inicia sesión nuevamente.");
      return;
    }

    // Verificamos que haya coordenadas y ciudades
    if (
      !formData.origen_lat ||
      !formData.origen_lng ||
      !formData.destino_lat ||
      !formData.destino_lng ||
      !formData.origen ||
      !formData.destino
    ) {
      setMensaje("⚠️ Selecciona un destino en el mapa antes de enviar.");
      return;
    }

    const rangoInferior = formData.precio_estimado * 0.9;
    const rangoSuperior = formData.precio_estimado * 1.1;

    if (
      formData.precio_usuario < rangoInferior ||
      formData.precio_usuario > rangoSuperior
    ) {
      setMensaje(
        "⚠️ El precio ingresado está fuera del rango permitido (±10% del estimado)"
      );
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/solicitudes/crear", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion: formData.descripcion,
          peso: formData.peso,
          origen: formData.origen,
          destino: formData.destino,
          origen_lat: formData.origen_lat,
          origen_lng: formData.origen_lng,
          destino_lat: formData.destino_lat,
          destino_lng: formData.destino_lng,
          distancia_km: formData.distancia_km,
          precio_usuario: formData.precio_usuario,
          idUsuario: usuario.idUsuario,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje("✅ Solicitud creada correctamente");
        setFormData({
          descripcion: "",
          peso: "",
          origen: "",
          destino: "",
          origen_lat: null,
          origen_lng: null,
          destino_lat: null,
          destino_lng: null,
          distancia_km: 0,
          precio_estimado: 0,
          precio_usuario: "",
        });
        setDestino(null);
      } else {
        setMensaje(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al conectar con el servidor");
    }
  };


  if (!permisoUbicacion) return <p>📍 Solicitando permiso de ubicación...</p>;

  return (
    <div style={styles.container}>
      <h2>Crear Solicitud de Carga</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label>Descripción:</label>
        <input
          type="text"
          value={formData.descripcion}
          onChange={(e) =>
            setFormData({ ...formData, descripcion: e.target.value })
          }
          required
        />

        <label>Peso (kg):</label>
        <input
          type="number"
          value={formData.peso}
          onChange={(e) =>
            setFormData({ ...formData, peso: e.target.value })
          }
          required
        />

        <label>Selecciona el destino en el mapa:</label>
        <div style={styles.mapContainer}>
          {posicionActual && (
            <MapContainer
              center={posicionActual}
              zoom={13}
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={posicionActual} />
              <MapaDestino />
              {destino && (
                <Polyline
                  positions={[posicionActual, destino]}
                  pathOptions={{
                    color: "blue",
                    dashArray: "5,10", // línea punteada
                    weight: 3,
                  }}
                />
              )}
            </MapContainer>
          )}
        </div>

        {formData.distancia_km > 0 && (
          <>
            <p>
              📏 {formData.origen} → {formData.destino} (
              {formData.distancia_km} km)
            </p>
            <p>💰 Precio sugerido: ${formData.precio_estimado}</p>
            <label>Precio propuesto:</label>
            <input
              type="number"
              value={formData.precio_usuario}
              onChange={(e) =>
                setFormData({ ...formData, precio_usuario: e.target.value })
              }
              required
            />
          </>
        )}

        <button type="submit" style={styles.button}>
          Crear solicitud
        </button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

const styles = {
  container: { maxWidth: "500px", margin: "30px auto", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  mapContainer: {
    height: "300px",
    width: "100%",
    marginBottom: "10px",
    border: "2px solid #ddd",
    borderRadius: "5px",
  },
  button: {
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "8px",
    cursor: "pointer",
  },
};

export default ClienteCrearSolicitud;
