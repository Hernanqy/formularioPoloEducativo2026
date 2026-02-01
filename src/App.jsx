import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";

const STORAGE_KEY = "la_maxima_propuesta_2026";

// Paleta inspirada en el dossier La Máxima
const COLORS = {
  bg: "#E8E1D0", // beige
  ink: "#111111", // negro
  green: "#1FA35B", // verde marca
  blue: "#1F7AE0",
  pink: "#E65AA6",
  mustard: "#C8A200",
  line: "rgba(17,17,17,0.12)",
  white: "#FFFFFF",
};

const STEPS = [
  { key: "nombre", label: "Nombre del taller / actividad", icon: "🟩" },
  { key: "fundamentacion", label: "Fundamentación breve", icon: "📝" },
  { key: "objetivos", label: "Objetivos", icon: "🎯" },
  { key: "publico", label: "Público destinatario", icon: "👥" },
  { key: "ejes", label: "Ejes temáticos", icon: "🧭" },
  { key: "operativa", label: "Cupo y duración", icon: "⏱️" },
  { key: "responsables", label: "Responsables", icon: "🤝" },
  { key: "secuencia", label: "Secuencia de trabajo", icon: "🔄" },
  { key: "insumos", label: "Insumos necesarios", icon: "🧰" },
  { key: "logistica", label: "Logística necesaria", icon: "📦" },
  { key: "inclusion", label: "Accesibilidad e inclusión", icon: "♿" },
  { key: "espacios", label: "Espacios del Polo que participan", icon: "🏛️" },
  { key: "integracion", label: "Integrar otros espacios del Polo", icon: "🔗" },
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

function safe(v) {
  return (v ?? "").toString().trim();
}

function buildPdfText(data) {
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

function exportPDF(data) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Fondo beige
  doc.setFillColor(232, 225, 208);
  doc.rect(0, 0, W, H, "F");

  // Encabezado verde
  doc.setFillColor(31, 163, 91);
  doc.roundedRect(40, 36, W - 80, 78, 14, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("LA MÁXIMA", 60, 68);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Polo Educativo y Recreativo", 60, 88);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Propuesta de Actividades ${data.anio}`, 60, 108);

  // Caja blanca
  let y = 135;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(40, y, W - 80, H - y - 60, 16, 16, "F");

  // Contenido
  const items = buildPdfText(data);
  let cy = y + 28;
  const left = 60;
  const maxW = W - 120;

  doc.setTextColor(17, 17, 17);

  const newPageBox = () => {
    doc.addPage();
    doc.setFillColor(232, 225, 208);
    doc.rect(0, 0, W, H, "F");
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(40, 40, W - 80, H - 100, 16, 16, "F");
    cy = 70;
  };

  const writeBlock = (title, value) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.text(title, left, cy);
    cy += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    const lines = doc.splitTextToSize(value, maxW);
    doc.text(lines, left, cy);
    cy += lines.length * 12 + 12;

    if (cy > H - 80) newPageBox();
  };

  items.forEach((it) => writeBlock(it.t, it.v));

  doc.save(`Propuesta_LaMaxima_${safe(data.nombre) || "actividad"}_${data.anio}.pdf`);
}

function Dot({ active, done }) {
  return (
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: 99,
        display: "inline-block",
        background: done ? COLORS.green : active ? COLORS.blue : "rgba(17,17,17,0.18)",
      }}
    />
  );
}

// ✅ IMPORTANTE: renderers fuera del componente App (para no perder foco)
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
          <input
            type="radio"
            name="puede"
            checked={inc.puede === "si"}
            onChange={() => setInc({ puede: "si" })}
          />
          <span>Sí</span>
        </label>
        <label className="chip">
          <input
            type="radio"
            name="puede"
            checked={inc.puede === "no"}
            onChange={() => setInc({ puede: "no" })}
          />
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
          <input
            placeholder="Ej.: Taller de Naturaleza"
            value={data.nombre}
            onChange={(e) => set({ nombre: e.target.value })}
          />
        </>
      );

    case "fundamentacion":
      return (
        <>
          <label>Fundamentación breve</label>
          <textarea
            placeholder="¿Por qué es importante? ¿Qué aporta?"
            value={data.fundamentacion}
            onChange={(e) => set({ fundamentacion: e.target.value })}
          />
        </>
      );

    case "objetivos":
      return (
        <>
          <label>Objetivos</label>
          <textarea
            placeholder="Incluí objetivo general y 2/3 objetivos específicos."
            value={data.objetivos}
            onChange={(e) => set({ objetivos: e.target.value })}
          />
        </>
      );

    case "publico":
      return renderPublico(data, setData);

    case "ejes":
      return (
        <>
          <label>Ejes temáticos</label>
          <textarea
            placeholder="Separalos por líneas o viñetas."
            value={data.ejes}
            onChange={(e) => set({ ejes: e.target.value })}
          />
        </>
      );

    case "operativa":
      return (
        <div className="grid2">
          <div>
            <label>Cupo</label>
            <input
              placeholder="Ej.: 25"
              value={data.operativa.cupo}
              onChange={(e) => set({ operativa: { ...data.operativa, cupo: e.target.value } })}
            />
          </div>
          <div>
            <label>Duración</label>
            <input
              placeholder="Ej.: 4 encuentros de 90 min"
              value={data.operativa.duracion}
              onChange={(e) => set({ operativa: { ...data.operativa, duracion: e.target.value } })}
            />
          </div>
        </div>
      );

    case "responsables":
      return (
        <>
          <label>Responsables</label>
          <textarea
            placeholder="Nombre/s y rol/es."
            value={data.responsables}
            onChange={(e) => set({ responsables: e.target.value })}
          />
        </>
      );

    case "secuencia":
      return (
        <>
          <label>Momento 1 – Inicio</label>
          <textarea
            placeholder="Recepción, presentación, disparador…"
            value={data.secuencia.inicio}
            onChange={(e) => set({ secuencia: { ...data.secuencia, inicio: e.target.value } })}
            style={{ minHeight: 120 }}
          />
          <label>Momento 2 – Desarrollo</label>
          <textarea
            placeholder="Actividades centrales, metodología…"
            value={data.secuencia.desarrollo}
            onChange={(e) => set({ secuencia: { ...data.secuencia, desarrollo: e.target.value } })}
            style={{ minHeight: 140 }}
          />
          <label>Momento 3 – Cierre</label>
          <textarea
            placeholder="Síntesis, evaluación, devolución…"
            value={data.secuencia.cierre}
            onChange={(e) => set({ secuencia: { ...data.secuencia, cierre: e.target.value } })}
            style={{ minHeight: 120 }}
          />
        </>
      );

    case "insumos":
      return (
        <>
          <label>Insumos necesarios</label>
          <textarea
            placeholder="Materiales didácticos, tecnológicos, artísticos…"
            value={data.insumos}
            onChange={(e) => set({ insumos: e.target.value })}
          />
        </>
      );

    case "logistica":
      return (
        <>
          <label>Logística necesaria</label>
          <textarea
            placeholder="Espacios, mobiliario, horarios, apoyos…"
            value={data.logistica}
            onChange={(e) => set({ logistica: e.target.value })}
          />
        </>
      );

    case "inclusion":
      return renderInclusion(data, setData);

    case "espacios":
      return (
        <>
          <label>¿Qué espacios del Polo participan?</label>
          <textarea
            placeholder="Ej.: BioParque, Museo de las Ciencias, CiT…"
            value={data.espacios}
            onChange={(e) => set({ espacios: e.target.value })}
          />
        </>
      );

    case "integracion":
      return (
        <>
          <label>¿Qué se necesitaría para integrar otros espacios?</label>
          <textarea
            placeholder="Recursos, acuerdos, adaptaciones…"
            value={data.integracion}
            onChange={(e) => set({ integracion: e.target.value })}
          />
        </>
      );

    case "observaciones":
    default:
      return (
        <>
          <label>Observaciones finales</label>
          <textarea
            placeholder="Notas, cuidados, recomendaciones…"
            value={data.observaciones}
            onChange={(e) => set({ observaciones: e.target.value })}
          />
        </>
      );
  }
}

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initial);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setData((d) => ({ ...d, ...JSON.parse(saved) }));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [data]);

  const current = STEPS[step];
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const dots = useMemo(() => STEPS.map((_, i) => ({ active: i === step, done: i < step })), [step]);

  const styles = `
    :root{
      --bg:${COLORS.bg};
      --ink:${COLORS.ink};
      --green:${COLORS.green};
      --blue:${COLORS.blue};
      --pink:${COLORS.pink};
      --mustard:${COLORS.mustard};
      --line:${COLORS.line};
      --white:${COLORS.white};
    }
    *{box-sizing:border-box}
    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:var(--bg);color:var(--ink)}
    .wrap{min-height:100vh;display:flex;flex-direction:column;}
    .top{padding:22px 16px 8px;display:flex;justify-content:center;}
    .topInner{width:100%;max-width:940px;display:flex;align-items:center;justify-content:center;}
    .brand{width:100%;display:flex;justify-content:center;text-align:center;}
    .brand h1{margin:0;font-size:28px;letter-spacing:0.2px;font-weight:900;line-height:1.1;}
    .brand h1 span{color:var(--green)}
    .main{flex:1;display:flex;justify-content:center;align-items:flex-start;padding:14px 16px 28px;}
    .card{
      width:100%;max-width:940px;background:var(--white);
      border:1px solid var(--line);border-radius:22px;
      box-shadow:0 20px 60px rgba(17,17,17,0.10);overflow:hidden;
    }
    .cardHead{padding:18px 18px 12px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
    .stepTitle{display:flex;align-items:center;gap:12px}
    .iconBubble{
      width:42px;height:42px;border-radius:16px;display:flex;align-items:center;justify-content:center;
      background:rgba(31,163,91,0.12);border:1px solid rgba(31,163,91,0.28);
      font-size:18px;font-weight:900;color:var(--green);
    }
    .stepTitle h2{margin:0;font-size:22px;font-weight:950;letter-spacing:-0.2px}
    .stepMeta{margin:2px 0 0;font-size:14px;font-weight:700;color:rgba(17,17,17,0.6)}
    .actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
    .btn{
      border:1px solid transparent;border-radius:14px;padding:12px 14px;
      font-weight:900;cursor:pointer;font-size:15px;
    }
    .btnPrimary{background:var(--ink);color:var(--white)}
    .btnSecondary{background:transparent;border-color:var(--line);color:var(--ink)}
    .btnGreen{background:var(--green);color:var(--white)}
    .btn:disabled{opacity:0.55;cursor:not-allowed}
    .dots{padding:0 18px 10px;display:flex;gap:8px;flex-wrap:wrap}
    .content{padding:8px 18px 18px;}
    label{display:block;font-size:16px;font-weight:950;margin:10px 0 8px}
    input, textarea{
      width:100%;font-size:18px;padding:14px 14px;border-radius:16px;
      border:1px solid var(--line);background:#fff;color:var(--ink);outline:none;
    }
    textarea{min-height:160px;resize:vertical}
    input::placeholder,textarea::placeholder{color:rgba(17,17,17,0.35)}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .chip{
      border:1px solid var(--line);border-radius:16px;padding:12px 12px;
      display:flex;gap:10px;align-items:center;font-size:16px;font-weight:850;
      user-select:none;background:#fff;
    }
    .chip input{width:18px;height:18px}
    .nav{padding:0 18px 18px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .footerIcons{display:flex;justify-content:center;gap:16px;padding:10px 16px 20px;opacity:0.9;}
    .pill{
      width:46px;height:46px;border-radius:18px;display:flex;align-items:center;justify-content:center;
      border:1px solid rgba(17,17,17,0.10);background:#fff;box-shadow:0 10px 30px rgba(17,17,17,0.06);
      font-size:20px;
    }
    @media (max-width: 760px){
      .brand h1{font-size:22px}
      .stepTitle h2{font-size:19px}
      .grid2{grid-template-columns:1fr}
      input,textarea{font-size:17px}
    }
  `;

  return (
    <div className="wrap">
      <style>{styles}</style>

      {/* SOLO TÍTULO */}
      <header className="top">
        <div className="topInner">
          <div className="brand">
            <h1>
              Planilla Modelo <span>{data.anio}</span> – Propuesta de Actividades
            </h1>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="main">
        <section className="card">
          <div className="cardHead">
            <div className="stepTitle">
              <div className="iconBubble">{current.icon}</div>
              <div>
                <div className="stepMeta">
                  Paso {step + 1} de {STEPS.length}
                </div>
                <h2>{current.label}</h2>
              </div>
            </div>

            <div className="actions">
              <button className="btn btnGreen" onClick={() => exportPDF(data)} title="Exportar PDF">
                Exportar PDF
              </button>
            </div>
          </div>

          <div className="dots">
            {dots.map((d, idx) => (
              <Dot key={idx} active={d.active} done={d.done} />
            ))}
          </div>

          <div className="content">
            {renderStepContent(current.key, data, setData)}
          </div>

          <div className="nav">
            <button className="btn btnSecondary" onClick={back} disabled={step === 0}>
              Atrás
            </button>

            {step < STEPS.length - 1 ? (
              <button className="btn btnPrimary" onClick={next}>
                Siguiente
              </button>
            ) : (
              <button className="btn btnPrimary" onClick={() => exportPDF(data)}>
                Finalizar y exportar
              </button>
            )}
          </div>
        </section>
      </main>

      {/* ICONOS DECORATIVOS (sutil, estilo dossier) */}
      <div className="footerIcons" aria-hidden="true">
        <div className="pill" style={{ borderColor: "rgba(31,163,91,0.25)", background: "rgba(31,163,91,0.10)" }}>
          🌿
        </div>
        <div className="pill" style={{ borderColor: "rgba(31,122,224,0.25)", background: "rgba(31,122,224,0.10)" }}>
          💧
        </div>
        <div className="pill" style={{ borderColor: "rgba(230,90,166,0.25)", background: "rgba(230,90,166,0.10)" }}>
          🌸
        </div>
        <div className="pill" style={{ borderColor: "rgba(200,162,0,0.25)", background: "rgba(200,162,0,0.10)" }}>
          ☀️
        </div>
      </div>
    </div>
  );
}
