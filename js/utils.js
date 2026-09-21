/* =========================================================
   ECO LÓGICA García — Utilidades Globales
   ========================================================= */

const ESCAPE_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

function isSafeHttpUrl(url) {
  try {
    const u = new URL(String(url || "").trim(), window.location.href);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (_e) {
    return false;
  }
}

function formatMexPhone(rawDigits) {
  let d = String(rawDigits || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("52")) d = d.slice(2);
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : d;
}

const MEXICO_STATES = [
  { id: "aguascalientes", name: "Aguascalientes", lat: 21.8853, lng: -102.2916 },
  { id: "baja-california", name: "Baja California", lat: 32.6245, lng: -115.4523 },
  { id: "baja-california-sur", name: "Baja California Sur", lat: 24.1426, lng: -110.3128 },
  { id: "campeche", name: "Campeche", lat: 19.8301, lng: -90.5349 },
  { id: "chiapas", name: "Chiapas", lat: 16.7569, lng: -93.1292 },
  { id: "chihuahua", name: "Chihuahua", lat: 28.6353, lng: -106.0889 },
  { id: "cdmx", name: "Ciudad de México", lat: 19.4326, lng: -99.1332 },
  { id: "coahuila", name: "Coahuila", lat: 25.4260, lng: -101.0053 },
  { id: "colima", name: "Colima", lat: 19.2452, lng: -103.7241 },
  { id: "durango", name: "Durango", lat: 24.0277, lng: -104.6532 },
  { id: "guanajuato", name: "Guanajuato", lat: 21.0190, lng: -101.2574 },
  { id: "guerrero", name: "Guerrero", lat: 17.5515, lng: -99.5058 },
  { id: "hidalgo", name: "Hidalgo", lat: 20.1011, lng: -98.7591 },
  { id: "jalisco", name: "Jalisco", lat: 20.6597, lng: -103.3496 },
  { id: "mexico", name: "Estado de México", lat: 19.2826, lng: -99.6557 },
  { id: "michoacan", name: "Michoacán", lat: 19.7008, lng: -101.1844 },
  { id: "morelos", name: "Morelos", lat: 18.9242, lng: -99.2216 },
  { id: "nayarit", name: "Nayarit", lat: 21.5041, lng: -104.8946 },
  { id: "nuevo-leon", name: "Nuevo León", lat: 25.6866, lng: -100.3161 },
  { id: "oaxaca", name: "Oaxaca", lat: 17.0732, lng: -96.7266 },
  { id: "puebla", name: "Puebla", lat: 19.0414, lng: -98.2063 },
  { id: "queretaro", name: "Querétaro", lat: 20.5888, lng: -100.3899 },
  { id: "quintana-roo", name: "Quintana Roo", lat: 18.5036, lng: -88.3055 },
  { id: "san-luis-potosi", name: "San Luis Potosí", lat: 22.1565, lng: -100.9855 },
  { id: "sinaloa", name: "Sinaloa", lat: 24.8091, lng: -107.4022 },
  { id: "sonora", name: "Sonora", lat: 29.0729, lng: -110.9559 },
  { id: "tabasco", name: "Tabasco", lat: 17.9892, lng: -92.9475 },
  { id: "tamaulipas", name: "Tamaulipas", lat: 23.7369, lng: -99.1411 },
  { id: "tlaxcala", name: "Tlaxcala", lat: 19.3139, lng: -98.2404 },
  { id: "veracruz", name: "Veracruz", lat: 19.1738, lng: -96.1342 },
  { id: "yucatan", name: "Yucatán", lat: 20.9674, lng: -89.5926 },
  { id: "zacatecas", name: "Zacatecas", lat: 22.7709, lng: -102.5832 },
];
const TOTAL_MEXICO_STATES = MEXICO_STATES.length;
