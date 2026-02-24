import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// SCHATZKARTE LANDING PAGE — MIT TOGGLE
// ═══════════════════════════════════════════════════════════════
// Wrapper mit Toggle zwischen Schüler- und Elternversion
// ═══════════════════════════════════════════════════════════════

import SchatzkarteLandingJugend from "./SchatzkarteLanding_Jugend";
import SchatzkarteLandingEltern from "./SchatzkarteLanding_Eltern";

// WhatsApp Nummer im internationalen Format (Malaysia: +60)
const WHATSAPP_NUMBER = "60172904521";

interface SchatzkarteLandingCombinedProps {
  onGoToMap?: () => void;
  onGuestMode?: () => void;
}

export default function SchatzkarteLandingCombined({ onGoToMap, onGuestMode }: SchatzkarteLandingCombinedProps) {
  const [showElternVersion, setShowElternVersion] = useState(false);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
    }}>
      {/* ══════════════════════════════════════════════ */}
      {/* TOGGLE BAR — Fixed oben                       */}
      {/* ══════════════════════════════════════════════ */}
      <div style={{
        flexShrink: 0,
        zIndex: 1000,
        background: "#fff",
        borderBottom: "2px solid #E5E7EB",
        padding: "12px 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
      }}>
        <div style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}>
          {/* Linke Seite: leer für Balance */}
          <div style={{ width: 44 }} />

          {/* Mitte: Toggle */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
          {/* Label Links */}
          <span style={{
            fontSize: 15,
            fontWeight: 600,
            color: !showElternVersion ? "#1FB6A6" : "#9CA3AF",
            transition: "color .3s ease",
          }}>
            Für Schüler 🎒
          </span>

          {/* Toggle Switch */}
          <button
            onClick={() => setShowElternVersion(!showElternVersion)}
            aria-label="Zwischen Schüler- und Elternversion wechseln"
            style={{
              position: "relative",
              width: 64,
              height: 34,
              borderRadius: 50,
              border: "none",
              cursor: "pointer",
              background: showElternVersion ? "#1E2A44" : "#1FB6A6",
              transition: "background .3s ease",
              padding: 0,
              boxShadow: "0 2px 6px rgba(0,0,0,.15)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.25)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,.15)";
            }}
          >
            <div style={{
              position: "absolute",
              top: 4,
              left: showElternVersion ? "34px" : "4px",
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 2px 4px rgba(0,0,0,.2)",
              transition: "left .3s cubic-bezier(0.4, 0.0, 0.2, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}>
              {showElternVersion ? "👨‍👩‍👧" : "🎮"}
            </div>
          </button>

          {/* Label Rechts */}
          <span style={{
            fontSize: 15,
            fontWeight: 600,
            color: showElternVersion ? "#1E2A44" : "#9CA3AF",
            transition: "color .3s ease",
          }}>
            Für Eltern 💼
          </span>
          </div>

          {/* Rechte Seite: WhatsApp Button */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hallo Sandra! Ich interessiere mich für die Schatzkarte und würde gerne mehr erfahren.")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Kontakt"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#25D366",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(37, 211, 102, 0.3)",
              transition: "all 0.3s ease",
              textDecoration: "none",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 211, 102, 0.5)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(37, 211, 102, 0.3)";
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* CONTENT — Je nach Toggle (scrollbar)          */}
      {/* ══════════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
      }}>
        <div
          key={showElternVersion ? "eltern" : "jugend"}
          style={{
            animation: "fadeInContent .5s ease",
          }}
        >
          {showElternVersion
            ? <SchatzkarteLandingEltern onGoToMap={onGoToMap} onGuestMode={onGuestMode} />
            : <SchatzkarteLandingJugend onGoToMap={onGoToMap} onGuestMode={onGuestMode} />}
        </div>
      </div>

      {/* Inline CSS für Animationen */}
      <style>{`
        @keyframes fadeInContent {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export { SchatzkarteLandingCombined };
