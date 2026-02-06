import { useState, useEffect, useRef, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// VOICE TEXT INPUT - Wiederverwendbare Komponente für Spracheingabe
// ═══════════════════════════════════════════════════════════════

// Web Speech API Types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// ─── HOOK: useSpeechRecognition ────────────────────────────────
export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "de-DE";
    }
  }, []);

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setIsListening(true);

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      let finalTranscript = "";
      for (let i = 0; i < results.length; i++) {
        if (results[i].isFinal) {
          finalTranscript += results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
        onResult(finalTranscript);
      }
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return { isListening, transcript, isSupported, startListening, stopListening };
}

// ─── ICONS ─────────────────────────────────────────────────────
const MicIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

// ─── THEME COLORS ──────────────────────────────────────────────
const colors = {
  purple: "#A78BFA",
  purpleLight: "rgba(167, 139, 250, 0.1)",
  purpleBorder: "rgba(167, 139, 250, 0.3)",
  red: "#EF4444",
  redLight: "rgba(239, 68, 68, 0.2)",
  redBorder: "rgba(239, 68, 68, 0.5)",
  text: "#E8DCC8",
  textMuted: "#7A8BA0",
  inputBg: "rgba(255, 255, 255, 0.06)",
  inputBorder: "rgba(255, 255, 255, 0.1)",
  inputFocusBorder: "rgba(14, 165, 233, 0.4)",
};

// ─── STYLES ────────────────────────────────────────────────────
const styles = {
  container: {
    position: 'relative' as const,
    width: '100%',
  },
  inputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  input: {
    flex: 1,
    padding: '12px 14px',
    borderRadius: '12px',
    background: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    color: colors.text,
    fontFamily: "'Nunito', sans-serif",
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    resize: 'vertical' as const,
  },
  inputActive: {
    borderColor: colors.purple,
    boxShadow: `0 0 0 3px rgba(167, 139, 250, 0.2)`,
  },
  micButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: `1px solid ${colors.purpleBorder}`,
    background: colors.purpleLight,
    color: colors.purple,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  micButtonActive: {
    background: colors.redLight,
    borderColor: colors.redBorder,
    color: colors.red,
    animation: 'voice-pulse 1.5s ease-in-out infinite',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '6px',
    color: colors.textMuted,
  },
  hint: {
    fontSize: '11px',
    color: colors.textMuted,
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
};

// ─── COMPONENT PROPS ───────────────────────────────────────────
interface VoiceTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showHint?: boolean;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

// ─── MAIN COMPONENT ────────────────────────────────────────────
export function VoiceTextInput({
  value,
  onChange,
  placeholder = "",
  label,
  multiline = false,
  rows = 3,
  disabled = false,
  className = "",
  style = {},
  showHint = true,
  autoFocus = false,
  onKeyDown,
}: VoiceTextInputProps) {
  const voice = useSpeechRecognition();
  const [isActive, setIsActive] = useState(false);

  const handleVoiceInput = () => {
    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.startListening((text) => {
        onChange(value + (value && !value.endsWith(' ') ? ' ' : '') + text);
      });
    }
  };

  const inputStyle = {
    ...styles.input,
    ...(isActive || voice.isListening ? styles.inputActive : {}),
    ...style,
  };

  const micStyle = {
    ...styles.micButton,
    ...(voice.isListening ? styles.micButtonActive : {}),
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div style={styles.container} className={className}>
      {label && <label style={styles.label}>{label}</label>}

      <div style={styles.inputWrapper}>
        <InputComponent
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          onFocus={() => setIsActive(true)}
          onBlur={() => setIsActive(false)}
          onKeyDown={onKeyDown}
          style={inputStyle}
          {...(multiline ? { rows } : { type: 'text' })}
        />

        {voice.isSupported && !disabled && (
          <button
            type="button"
            onClick={handleVoiceInput}
            style={micStyle}
            title={voice.isListening ? "Aufnahme stoppen" : "Spracheingabe starten"}
          >
            <MicIcon size={18} />
          </button>
        )}
      </div>

      {showHint && voice.isSupported && (
        <div style={styles.hint}>
          <MicIcon size={12} />
          <span>{voice.isListening ? "Sprich jetzt..." : "Tippe auf das Mikrofon zum Einsprechen"}</span>
        </div>
      )}

      {/* CSS Animation für den pulsierenden Mikrofon-Button */}
      <style>{`
        @keyframes voice-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}

// ─── COMPACT VERSION (nur Icon, ohne Label/Hint) ───────────────
interface VoiceButtonProps {
  onResult: (text: string) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function VoiceButton({ onResult, disabled = false, size = 'medium' }: VoiceButtonProps) {
  const voice = useSpeechRecognition();

  const handleClick = () => {
    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.startListening(onResult);
    }
  };

  if (!voice.isSupported) return null;

  const sizes = {
    small: { btn: 28, icon: 14 },
    medium: { btn: 36, icon: 18 },
    large: { btn: 44, icon: 22 },
  };

  const s = sizes[size];

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        style={{
          ...styles.micButton,
          ...(voice.isListening ? styles.micButtonActive : {}),
          width: s.btn,
          height: s.btn,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        title={voice.isListening ? "Aufnahme stoppen" : "Spracheingabe"}
      >
        <MicIcon size={s.icon} />
      </button>
      <style>{`
        @keyframes voice-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        }
      `}</style>
    </>
  );
}

export default VoiceTextInput;
