import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";

// Firestore
import { db } from "./lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

/**
 * UI FLOW
 * - home: bienvenida (Nuevo / Ver)
 * - form: wizard Nuevo/Editar (limpio)
 * - list: cards de talleres
 */

const COLORS = {
  bg: "#E8E1D0",
  ink: "#111111",
  green: "#1FA35B",
  blue: "#1F7AE0",
  line: "rgba(17,17,17,0.12)",
  white: "#FFFFFF",
  softGreen: "rgba(31,163,91,0.08)",
};

const STEPS = [
  { key: "nombre", label: "Nombre del taller", icon: "🟩", required: true },
  { key: "fundamentacion", label: "Fundamentación", icon: "📝" },
  { key: "objetivos", label: "Objetivos", icon: "🎯" },
  { key: "publico", label: "Público destinatario", icon: "👥" },
  { key: "ejes", label: "Ejes temáticos", icon: "🧭" },
  { key: "operativa", label: "Cupo y duración", icon: "⏱️" },
  { key: "responsables", label: "Responsables", icon: "🤝" },
  { key: "secuencia", label: "Secuencia de trabajo", icon: "🔄" },
  { key: "insumos", label: "Insumos necesarios", icon: "🧰" },
  { key: "logistica", label: "Logística necesaria", icon: "📦" },
  { key: "inclusion", label: "Accesibilidad e inclusión", icon: "♿" },
  { key: "espacios", label: "Espacios del Polo", icon: "🏛️" },
  { key: "integracion", label: "Integración de otros espacios", icon: "🔗" },
  { key: "observaciones", label: "Observaciones finales", icon: "✅" },
];

const initial = {
  anio: "2026",
  nombre: "",
  fundamentacion: "",
  objetivos: "",
  publico: {
    infantes: false,
    ninos: false,
    adolescentes: false,
    jovenes18: false,
    adultosMayores: false,
    aclaraciones: "",
  },
  ejes: "",
  operativa: {
    cupo: "",
    duracion: "",
  },
  responsables: "",
  secuencia: {
    inicio: "",
    desarrollo: "",
    cierre: "",
  },
  insumos: "",
  logistica: "",
  inclusion: {
    puede: "", // "si" | "no"
    tipos: {
      motriz: false,
      visual: false,
      auditiva: false,
      intelectual: false,
      psicosocial: false,
      otras: "",
    },
    paraIncluir: "",
  },
  espacios: "",
  integracion: "",
  observaciones: "",
};
function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function safe(v) {
  return (v ?? "").toString().trim();
}

// -----------------------------
// Firestore CRUD + realtime
// -----------------------------
async function createTallerFS(data) {
  const payload = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  const ref = await addDoc(collection(db, "talleres"), payload);
  return ref.id;
}

async function updateTallerFS(id, data) {
  await updateDoc(doc(db, "talleres", id), { ...data, updatedAt: serverTimestamp() });
}

async function deleteTallerFS(id) {
  await deleteDoc(doc(db, "talleres", id));
}

function subscribeTalleresFS(setItems) {
  const q = query(collection(db, "talleres"), orderBy("createdAt", "desc"), limit(200));
  return onSnapshot(q, (snap) => {
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// -----------------------------
// PDF
// -----------------------------
function buildPdfItems(data) {
  const publico = [];
  if (data.publico.infantes) publico.push("Infantes");
  if (data.publico.ninos) publico.push("Niños/as");
  if (data.publico.adolescentes) publico.push("Adolescentes");
  if (data.publico.jovenes18) publico.push("Jóvenes (+18)");
  if (data.publico.adultosMayores) publico.push("Adultos mayores");

  const tipos = [];
  if (data.inclusion.tipos.motriz) tipos.push("Motriz");
  if (data.inclusion.tipos.visual) tipos.push("Visual");
  if (data.inclusion.tipos.auditiva) tipos.push("Auditiva");
  if (data.inclusion.tipos.intelectual) tipos.push("Intelectual");
  if (data.inclusion.tipos.psicosocial) tipos.push("Psicosocial");
  if (safe(data.inclusion.tipos.otras)) tipos.push(`Otras: ${safe(data.inclusion.tipos.otras)}`);

  return [
    { t: "Nombre del Taller / Actividad", v: safe(data.nombre) },
    { t: "Fundamentación", v: safe(data.fundamentacion) },
    { t: "Objetivos", v: safe(data.objetivos) },
    { t: "Público", v: publico.length ? publico.join(", ") : "" },
    { t: "Aclaraciones público", v: safe(data.publico.aclaraciones) },
    { t: "Ejes temáticos", v: safe(data.ejes) },
    { t: "Cupo", v: safe(data.operativa.cupo) },
    { t: "Duración", v: safe(data.operativa.duracion) },
    { t: "Responsables", v: safe(data.responsables) },
    { t: "Secuencia – Inicio", v: safe(data.secuencia.inicio) },
    { t: "Secuencia – Desarrollo", v: safe(data.secuencia.desarrollo) },
    { t: "Secuencia – Cierre", v: safe(data.secuencia.cierre) },
    { t: "Insumos necesarios", v: safe(data.insumos) },
    { t: "Logística necesaria", v: safe(data.logistica) },
    {
      t: "¿El taller puede ser realizado por personas con discapacidad?",
      v: data.inclusion.puede ? (data.inclusion.puede === "si" ? "Sí" : "No") : "",
    },
    { t: "¿Qué tipo de discapacidad?", v: data.inclusion.puede === "si" ? tipos.join(", ") : "" },
    {
      t: "¿Qué se necesitaría para que fuera inclusivo?",
      v: data.inclusion.puede === "no" ? safe(data.inclusion.paraIncluir) : "",
    },
    { t: "¿Qué espacios del Polo participan?", v: safe(data.espacios) },
    { t: "¿Qué se necesitaría para integrar otros espacios del Polo?", v: safe(data.integracion) },
    { t: "Observaciones", v: safe(data.observaciones) },
  ].filter((x) => safe(x.v));
}

function buildPdfDoc(data) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  pdf.setFillColor(232, 225, 208);
  pdf.rect(0, 0, W, H, "F");

  pdf.setFillColor(31, 163, 91);
  pdf.roundedRect(40, 36, W - 80, 78, 14, 14, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("LA MÁXIMA", 60, 68);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.text("Polo Educativo y Recreativo", 60, 88);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text(`Propuesta de Actividades ${data.anio}`, 60, 108);

  let y = 135;
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(40, y, W - 80, H - y - 60, 16, 16, "F");

  const items = buildPdfItems(data);
  let cy = y + 28;
  const left = 60;
  const maxW = W - 120;

  pdf.setTextColor(17, 17, 17);

  const newPageBox = () => {
    pdf.addPage();
    pdf.setFillColor(232, 225, 208);
    pdf.rect(0, 0, W, H, "F");
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(40, 40, W - 80, H - 100, 16, 16, "F");
    cy = 70;
  };

  const writeBlock = (title, value) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11.5);
    pdf.text(title, left, cy);
    cy += 14;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    const lines = pdf.splitTextToSize(value, maxW);
    pdf.text(lines, left, cy);
    cy += lines.length * 12 + 12;

    if (cy > H - 80) newPageBox();
  };

  items.forEach((it) => writeBlock(it.t, it.v));
  return pdf;
}

function downloadPdf(data) {
  const pdf = buildPdfDoc(data);
  pdf.save(`Propuesta_LaMaxima_${safe(data.nombre) || "actividad"}_${data.anio}.pdf`);
}

function pdfBlobUrl(data) {
  const pdf = buildPdfDoc(data);
  return pdf.output("bloburl");
}

// -----------------------------
// UI Components
// -----------------------------
function ProgressBar({ value }) {
  return (
    <div style={{ width: "100%", background: "rgba(17,17,17,0.10)", borderRadius: 999, height: 10 }}>
      <div
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: 10,
          borderRadius: 999,
          background: COLORS.green,
          transition: "width 180ms ease",
        }}
      />
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, kind = "green" }) {
  const bg = kind === "green" ? COLORS.green : kind === "blue" ? COLORS.blue : COLORS.ink;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn"
      style={{ background: bg, color: "#fff", border: "1px solid transparent" }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="btn"
      style={{ background: "transparent", border: `1px solid ${COLORS.line}`, color: COLORS.ink }}
    >
      {children}
    </button>
  );
}

function PdfModal({ open, url, title, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17,17,17,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "min(980px, 95vw)",
          height: "min(92vh, 900px)",
          background: "#fff",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 30px 90px rgba(0,0,0,0.25)",
          border: `1px solid ${COLORS.line}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: 12,
            borderBottom: `1px solid ${COLORS.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div
            style={{
              fontWeight: 950,
              fontSize: 14,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title || "Vista previa PDF"}
          </div>

          <SecondaryButton onClick={onClose}>Cerrar</SecondaryButton>
        </div>

        <iframe title="pdf" src={url} style={{ width: "100%", height: "100%", border: 0 }} />
      </div>
    </div>
  );
}

function Toast({ msg, onClose }) {
  if (!msg) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        display: "flex",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          maxWidth: 720,
          width: "100%",
          background: "#111",
          color: "#fff",
          borderRadius: 16,
          padding: "12px 14px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          fontWeight: 850,
        }}
      >
        {msg}
      </div>
    </div>
  );
}

function WelcomeScreen({ onNew, onList }) {
  return (
    <div className="center">
      <div className="welcome">
        <div className="welcomeBadge">👋</div>
        <h2 className="welcomeTitle">Bienvenid@</h2>
        <p className="welcomeText">
          Te guiamos paso a paso para crear, guardar y exportar propuestas de talleres del Polo Educativo y Recreativo La Máxima.
        </p>

        <div className="welcomeActions">
          <PrimaryButton onClick={onNew}>➕ Nuevo taller</PrimaryButton>
          <SecondaryButton onClick={onList}>📚 Ver talleres</SecondaryButton>
        </div>

        <div className="welcomeHint">Tip: podés guardar en cualquier momento.</div>
      </div>
    </div>
  );
}

function TalleresCards({ onEdit, onViewPdf }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const unsub = subscribeTalleresFS(setItems);
    return () => unsub?.();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((t) => {
      const nombre = (t.nombre || "").toLowerCase();
      const resp = (t.responsables || "").toLowerCase();
      const ejes = (t.ejes || "").toLowerCase();
      return nombre.includes(s) || resp.includes(s) || ejes.includes(s);
    });
  }, [items, q]);

  const fmt = (v) => (v ? v : "—");

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, responsable o ejes…" className="field" />

      <div className="cardsGrid">
        {filtered.map((t) => (
          <div key={t.id} className="cardItem">
            <div className="cardItemHead">
              <div className="cardIcon" title="Taller">
                🧩
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="cardTitle">{t.nombre || "Sin nombre"}</div>
                <div className="cardMeta">
                  ⏱️ {fmt(t.operativa?.duracion)} · 👥 {fmt(t.operativa?.cupo)}
                </div>
              </div>
            </div>

            <div className="cardBody">
              <div className="cardMeta">🤝 {fmt(t.responsables)}</div>

              <div className="cardBtns">
                <button
                  className="btn"
                  style={{ background: COLORS.blue, color: "#fff", border: "1px solid transparent" }}
                  onClick={() => {
                    const { id, createdAt, updatedAt, ...rest } = t;
                    onViewPdf(rest, t.nombre);
                  }}
                >
                  📄 Ver PDF
                </button>

                <button
                  className="btn"
                  style={{ background: COLORS.green, color: "#fff", border: "1px solid transparent" }}
                  onClick={() => onEdit(t)}
                >
                  ✏️ Editar
                </button>

                <button
                  className="btn"
                  style={{ background: "#fff", border: `1px solid ${COLORS.line}`, color: "#b30000" }}
                  onClick={async () => {
                    const ok = confirm("¿Eliminar este taller? No se puede deshacer.");
                    if (!ok) return;
                    await deleteTallerFS(t.id);
                  }}
                >
                  🗑️ Borrar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!filtered.length && <div style={{ opacity: 0.7, fontWeight: 800 }}>No hay talleres guardados todavía.</div>}
    </div>
  );
}

// -----------------------------
// Step renderers
// -----------------------------
function renderPublico(data, setData) {
  const p = data.publico;
  const set = (patch) => setData((d) => ({ ...d, ...patch }));
  const toggle = (k) => set({ publico: { ...p, [k]: !p[k] } });

  return (
    <>
      <label>Seleccioná destinatarios</label>
      <div className="grid2">
        {[
          ["infantes", "Infantes"],
          ["ninos", "Niños/as"],
          ["adolescentes", "Adolescentes"],
          ["jovenes18", "Jóvenes (+18)"],
          ["adultosMayores", "Adultos mayores"],
        ].map(([k, txt]) => (
          <label key={k} className="chip">
            <input type="checkbox" checked={!!p[k]} onChange={() => toggle(k)} />
            <span>{txt}</span>
          </label>
        ))}
      </div>

      <label style={{ marginTop: 14 }}>Aclaraciones (opcional)</label>
      <textarea
        placeholder="Ej.: requisitos, edades, inscripción previa, etc."
        value={p.aclaraciones}
        onChange={(e) => set({ publico: { ...p, aclaraciones: e.target.value } })}
        className="field"
        style={{ minHeight: 140 }}
      />
    </>
  );
}

function renderInclusion(data, setData) {
  const inc = data.inclusion;
  const tipos = inc.tipos;
  const set = (patch) => setData((d) => ({ ...d, ...patch }));
  const setInc = (patch) => set({ inclusion: { ...inc, ...patch } });
  const toggle = (k) => setInc({ tipos: { ...tipos, [k]: !tipos[k] } });

  return (
    <>
      <label>¿Puede realizarse por personas con discapacidad?</label>
      <div className="grid2">
        <label className="chip">
          <input type="radio" name="puede" checked={inc.puede === "si"} onChange={() => setInc({ puede: "si" })} />
          <span>Sí</span>
        </label>
        <label className="chip">
          <input type="radio" name="puede" checked={inc.puede === "no"} onChange={() => setInc({ puede: "no" })} />
          <span>No</span>
        </label>
      </div>

      {inc.puede === "si" && (
        <>
          <label style={{ marginTop: 14 }}>¿Qué tipo/s?</label>
          <div className="grid2">
            {[
              ["motriz", "Motriz"],
              ["visual", "Visual"],
              ["auditiva", "Auditiva"],
              ["intelectual", "Intelectual"],
              ["psicosocial", "Psicosocial"],
            ].map(([k, txt]) => (
              <label key={k} className="chip">
                <input type="checkbox" checked={!!tipos[k]} onChange={() => toggle(k)} />
                <span>{txt}</span>
              </label>
            ))}
          </div>

          <label style={{ marginTop: 14 }}>Otras (opcional)</label>
          <input
            placeholder="Ej.: TEA, etc."
            value={tipos.otras}
            onChange={(e) => setInc({ tipos: { ...tipos, otras: e.target.value } })}
            className="field"
          />
        </>
      )}

      {inc.puede === "no" && (
        <>
          <label style={{ marginTop: 14 }}>¿Qué se necesitaría para que fuera inclusivo?</label>
          <textarea
            placeholder="Ej.: intérprete, adecuaciones, materiales accesibles…"
            value={inc.paraIncluir}
            onChange={(e) => setInc({ paraIncluir: e.target.value })}
            className="field"
            style={{ minHeight: 140 }}
          />
        </>
      )}
    </>
  );
}

function renderStepContent(stepKey, data, setData) {
  const set = (patch) => setData((d) => ({ ...d, ...patch }));

  switch (stepKey) {
    case "nombre":
      return (
        <>
          <label>Nombre del taller / actividad</label>
          <input placeholder="Ej.: Antropología viva" value={data.nombre} onChange={(e) => set({ nombre: e.target.value })} className="field" />
        </>
      );

    case "fundamentacion":
      return (
        <>
          <label>Fundamentación breve</label>
          <textarea placeholder="¿Por qué es importante? ¿Qué aporta?" value={data.fundamentacion} onChange={(e) => set({ fundamentacion: e.target.value })} className="field" />
        </>
      );

    case "objetivos":
      return (
        <>
          <label>Objetivos</label>
          <textarea placeholder="Incluí objetivo general y 2/3 objetivos específicos." value={data.objetivos} onChange={(e) => set({ objetivos: e.target.value })} className="field" />
        </>
      );

    case "publico":
      return renderPublico(data, setData);

    case "ejes":
      return (
        <>
          <label>Ejes temáticos</label>
          <textarea placeholder="Separalos por líneas o viñetas." value={data.ejes} onChange={(e) => set({ ejes: e.target.value })} className="field" />
        </>
      );

    case "operativa":
      return (
        <div className="grid2">
          <div>
            <label>Cupo</label>
            <input placeholder="Ej.: 25" value={data.operativa.cupo} onChange={(e) => set({ operativa: { ...data.operativa, cupo: e.target.value } })} className="field" />
          </div>
          <div>
            <label>Duración</label>
            <input placeholder="Ej.: 4 encuentros de 90 min" value={data.operativa.duracion} onChange={(e) => set({ operativa: { ...data.operativa, duracion: e.target.value } })} className="field" />
          </div>
        </div>
      );

    case "responsables":
      return (
        <>
          <label>Responsables</label>
          <textarea placeholder="Nombre/s y rol/es." value={data.responsables} onChange={(e) => set({ responsables: e.target.value })} className="field" />
        </>
      );

    case "secuencia":
      return (
        <>
          <label>Momento 1 – Inicio</label>
          <textarea value={data.secuencia.inicio} onChange={(e) => set({ secuencia: { ...data.secuencia, inicio: e.target.value } })} className="field" style={{ minHeight: 120 }} />
          <label>Momento 2 – Desarrollo</label>
          <textarea value={data.secuencia.desarrollo} onChange={(e) => set({ secuencia: { ...data.secuencia, desarrollo: e.target.value } })} className="field" style={{ minHeight: 140 }} />
          <label>Momento 3 – Cierre</label>
          <textarea value={data.secuencia.cierre} onChange={(e) => set({ secuencia: { ...data.secuencia, cierre: e.target.value } })} className="field" style={{ minHeight: 120 }} />
        </>
      );

    case "insumos":
      return (
        <>
          <label>Insumos necesarios</label>
          <textarea value={data.insumos} onChange={(e) => set({ insumos: e.target.value })} className="field" />
        </>
      );

    case "logistica":
      return (
        <>
          <label>Logística necesaria</label>
          <textarea value={data.logistica} onChange={(e) => set({ logistica: e.target.value })} className="field" />
        </>
      );

    case "inclusion":
      return renderInclusion(data, setData);

    case "espacios":
      return (
        <>
          <label>¿Qué espacios del Polo participan?</label>
          <textarea value={data.espacios} onChange={(e) => set({ espacios: e.target.value })} className="field" />
        </>
      );

    case "integracion":
      return (
        <>
          <label>¿Qué se necesitaría para integrar otros espacios del Polo?</label>
          <textarea value={data.integracion} onChange={(e) => set({ integracion: e.target.value })} className="field" />
        </>
      );

    case "observaciones":
    default:
      return (
        <>
          <label>Observaciones finales</label>
          <textarea value={data.observaciones} onChange={(e) => set({ observaciones: e.target.value })} className="field" />
        </>
      );
  }
}

// -----------------------------
// Main App
// -----------------------------
export default function App() {
  const [route, setRoute] = useState("home"); // home | form | list
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initial);
  const [currentId, setCurrentId] = useState(null);
  const [saving, setSaving] = useState(false);

  // toast (solo en error / feedback puntual)
  const [toast, setToast] = useState("");

  // PDF viewer
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");

  const current = STEPS[step];

  const canSave = safe(data.nombre).length > 0;

  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const startNew = () => {
    setData(initial);
    setCurrentId(null);
    setStep(0);
    setRoute("form");
  };

  const saveNow = async () => {
    if (!canSave) {
      setToast("⚠️ Falta completar el nombre del taller.");
      return;
    }
    setSaving(true);
    try {
      if (currentId) {
        await updateTallerFS(currentId, data);
        setToast("✅ Taller actualizado.");
      } else {
        const id = await createTallerFS(data);
        setCurrentId(id);
        setToast("✅ Taller guardado.");
      }
    } catch (e) {
      console.error(e);
      setToast("❌ Error al guardar. Revisá la consola.");
    } finally {
      setSaving(false);
    }
  };

  const guardedNext = () => {
    // si está en paso 0, validamos nombre antes de avanzar
    if (step === 0 && !canSave) {
      setToast("⚠️ Antes de continuar, completá el nombre del taller.");
      return;
    }
    next();
  };

const openPdfPreview = (payload, nombre) => {
  const url = pdfBlobUrl(payload);

  // 📱 En celular → abrir visor nativo
  if (isMobile()) {
    window.open(url, "_blank");
    return;
  }

  // 🖥️ En desktop → modal con iframe
  setPdfTitle(nombre ? `PDF — ${nombre}` : "PDF — Taller");
  setPdfUrl(url);
  setPdfOpen(true);
};

  const styles = `
    :root{--bg:${COLORS.bg};--ink:${COLORS.ink};--green:${COLORS.green};--blue:${COLORS.blue};--line:${COLORS.line};--white:${COLORS.white}}
    *{box-sizing:border-box}
    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:var(--bg);color:var(--ink)}
    .wrap{min-height:100vh;display:flex;flex-direction:column}
    .top{padding:22px 16px 8px;display:flex;justify-content:center}
    .topInner{width:100%;max-width:980px;text-align:center}
    .title{margin:0;font-size:28px;font-weight:950;line-height:1.1}
    .title span{color:var(--green)}
    .main{flex:1;display:flex;justify-content:center;align-items:flex-start;padding:14px 16px 28px}
    .panel{
      width:100%;max-width:980px;background:var(--white);
      border:1px solid var(--line);border-radius:22px;
      box-shadow:0 20px 60px rgba(17,17,17,0.10);overflow:hidden;
    }
    .head{padding:18px 18px 12px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .leftHead{display:flex;gap:12px;align-items:center}
    .iconBubble{width:42px;height:42px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:${COLORS.softGreen};border:1px solid rgba(31,163,91,0.28);font-weight:900}
    .hmeta{margin:0;font-size:13px;font-weight:900;color:rgba(17,17,17,0.6)}
    .h2{margin:2px 0 0;font-size:22px;font-weight:950}
    .actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
    .btn{border:1px solid transparent;border-radius:14px;padding:12px 14px;font-weight:900;cursor:pointer;font-size:15px}
    .btn:disabled{opacity:.55;cursor:not-allowed}
    .content{padding:12px 18px 18px}
    label{display:block;font-size:16px;font-weight:950;margin:10px 0 8px}
    .field{
      width:100%;font-size:18px;padding:14px 14px;border-radius:16px;border:1px solid var(--line);
      background:#fff;color:var(--ink);outline:none;
    }
    textarea.field{min-height:160px;resize:vertical}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .chip{border:1px solid var(--line);border-radius:16px;padding:12px 12px;display:flex;gap:10px;align-items:center;font-size:16px;font-weight:850;background:#fff}
    .chip input{width:18px;height:18px}
    .foot{padding:0 18px 18px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .hintRow{padding:0 18px 12px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    .pill{border:1px solid var(--line);border-radius:999px;padding:6px 10px;background:rgba(31,163,91,0.06);font-weight:850;font-size:13px}
    .center{flex:1;display:flex;justify-content:center;align-items:flex-start;padding:18px}
    .welcome{
      width:100%;max-width:620px;background:#fff;border:1px solid var(--line);border-radius:22px;
      box-shadow:0 20px 60px rgba(17,17,17,0.10);padding:22px;
      display:grid;gap:12px;text-align:center
    }
    .welcomeBadge{width:54px;height:54px;margin:0 auto;border-radius:18px;display:flex;align-items:center;justify-content:center;background:${COLORS.softGreen};border:1px solid rgba(31,163,91,0.28);font-size:22px;font-weight:900}
    .welcomeTitle{margin:0;font-size:24px;font-weight:950}
    .welcomeText{margin:0;color:rgba(17,17,17,0.72);font-weight:750;line-height:1.35}
    .welcomeActions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:8px}
    .welcomeHint{margin-top:6px;color:rgba(17,17,17,0.6);font-weight:750;font-size:13px}
    .cardsGrid{display:grid;grid-template-columns:repeat(auto-fit, minmax(290px, 1fr));gap:14px}
    .cardItem{border:1px solid var(--line);border-radius:18px;background:#fff;box-shadow:0 10px 30px rgba(17,17,17,0.06);overflow:hidden}
    .cardItemHead{padding:14px;display:flex;gap:12px;align-items:center;border-bottom:1px solid var(--line);background:${COLORS.softGreen}}
    .cardIcon{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:#fff;border:1px solid var(--line);font-size:24px}
    .cardTitle{font-weight:950;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .cardMeta{opacity:.78;font-size:13px;font-weight:800}
    .cardBody{padding:14px;display:grid;gap:10px}
    .cardBtns{display:flex;gap:10px;flex-wrap:wrap}
    @media (max-width:760px){
      .title{font-size:22px}
      .h2{font-size:19px}
      .grid2{grid-template-columns:1fr}
      .field{font-size:17px}
    }
  `;

  return (
    <div className="wrap">
      <style>{styles}</style>

      <header className="top">
        <div className="topInner">
          <h1 className="title">
            Planilla Modelo <span>2026</span> – Propuesta de Actividades
          </h1>
        </div>
      </header>

      <main className="main">
        {route === "home" && (
          <WelcomeScreen onNew={startNew} onList={() => setRoute("list")} />
        )}

        {route === "form" && (
          <section className="panel">
            <div className="head">
              <div className="leftHead">
                <div className="iconBubble">{current.icon}</div>
                <div>
                  <p className="hmeta">{currentId ? "Editando taller" : "Nuevo taller"}</p>
                  <h2 className="h2">{currentId ? "Editar taller" : "Nuevo taller"}</h2>
                </div>
              </div>

              <div className="actions">
                <SecondaryButton onClick={() => setRoute("home")}>🏠 Inicio</SecondaryButton>
                <SecondaryButton onClick={() => setRoute("list")}>📚 Talleres</SecondaryButton>
                <SecondaryButton onClick={startNew}>➕ Nuevo</SecondaryButton>

                <PrimaryButton onClick={saveNow} disabled={saving || !canSave} kind="green">
                  {saving ? "Guardando…" : "Guardar"}
                </PrimaryButton>

                {step === STEPS.length - 1 && (
                  <PrimaryButton onClick={() => downloadPdf(data)} kind="blue">
                    📄 Exportar PDF
                  </PrimaryButton>
                )}
              </div>
            </div>

            {/* ✅ SOLO Progreso siempre visible. Avisos solo con error via Toast */}
            <div className="hintRow">
              <span className="pill">Progreso: {progress}%</span>
            </div>

            <div className="content">
              <ProgressBar value={progress} />
              <div style={{ height: 12 }} />
              {renderStepContent(current.key, data, setData)}
            </div>

            <div className="foot">
              <SecondaryButton onClick={() => (step === 0 ? setRoute("home") : back())}>
                ← Volver
              </SecondaryButton>

              {step < STEPS.length - 1 ? (
                <PrimaryButton onClick={guardedNext} kind="blue">
                  Siguiente →
                </PrimaryButton>
              ) : (
                <PrimaryButton onClick={() => openPdfPreview(data, data.nombre)} kind="blue">
                  👀 Ver PDF
                </PrimaryButton>
              )}
            </div>
          </section>
        )}

        {route === "list" && (
          <section className="panel">
            <div className="head">
              <div className="leftHead">
                <div className="iconBubble">📚</div>
                <div>
                  <p className="hmeta">Talleres guardados</p>
                  <h2 className="h2">Listado de talleres</h2>
                </div>
              </div>

              <div className="actions">
                <SecondaryButton onClick={() => setRoute("home")}>🏠 Inicio</SecondaryButton>
                <PrimaryButton onClick={startNew}>➕ Nuevo taller</PrimaryButton>
              </div>
            </div>

            <div className="content">
              <TalleresCards
                onViewPdf={(payload, nombre) => openPdfPreview(payload, nombre)}
                onEdit={(t) => {
                  const { id, createdAt, updatedAt, ...rest } = t;
                  setData((d) => ({ ...d, ...rest }));
                  setCurrentId(id);
                  setStep(0);
                  setRoute("form");
                }}
              />
            </div>
          </section>
        )}
      </main>

      <PdfModal open={pdfOpen} url={pdfUrl} title={pdfTitle} onClose={() => setPdfOpen(false)} />
      <Toast msg={toast} onClose={() => setToast("")} />
    </div>
  );
}
