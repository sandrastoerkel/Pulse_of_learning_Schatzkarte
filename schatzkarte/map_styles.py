# -*- coding: utf-8 -*-
"""
CSS-Styles fuer die WOW-Schatzkarte.
Alle viralen Elemente: Pulsieren, Nebel, Confetti, Glitzer
"""

def get_map_css():
    return """
<style>
/* ===============================================================
   OZEAN-HINTERGRUND MIT WELLEN
   =============================================================== */

.ocean-bg {
    background: linear-gradient(180deg, 
        #87CEEB 0%,      /* Himmel */
        #1E90FF 30%,     /* Uebergang */
        #0077BE 60%,     /* Tiefes Meer */
        #005A8C 100%);
    min-height: 500px;
    border-radius: 25px;
    padding: 30px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

/* Animierte Wellen */
.ocean-bg::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: -100%;
    width: 300%;
    height: 80px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath fill='%23ffffff30' d='M0,60 Q300,120 600,60 T1200,60 L1200,120 L0,120 Z'%3E%3C/path%3E%3C/svg%3E") repeat-x;
    animation: waves 15s linear infinite;
}

@keyframes waves {
    0% { transform: translateX(0); }
    100% { transform: translateX(33.33%); }
}

/* ===============================================================
   INSEL-KARTEN
   =============================================================== */

.island-card {
    background: white;
    border-radius: 20px;
    padding: 15px;
    margin: 8px;
    text-align: center;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    position: relative;
}

.island-card:hover {
    transform: translateY(-15px) scale(1.08);
    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    z-index: 10;
}

/* Grosses Emoji-Icon */
.island-icon {
    font-size: 50px;
    display: block;
    margin-bottom: 8px;
    filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
}

/* ===============================================================
   PULSIERENDE AKTUELLE INSEL
   =============================================================== */

.island-current {
    animation: pulse-glow 2s ease-in-out infinite;
    border: 4px solid #FFD700 !important;
    background: linear-gradient(135deg, #FFFAF0, #FFF8DC) !important;
}

@keyframes pulse-glow {
    0%, 100% { 
        box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7),
                    0 8px 25px rgba(0,0,0,0.2);
    }
    50% { 
        box-shadow: 0 0 40px 20px rgba(255, 215, 0, 0.4),
                    0 8px 25px rgba(0,0,0,0.2);
    }
}

/* Stern-Badge fuer aktuelle Insel */
.island-current::before {
    content: '\2B50';
    position: absolute;
    top: -15px;
    right: -15px;
    font-size: 30px;
    animation: spin-star 3s linear infinite;
}

@keyframes spin-star {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.2); }
    100% { transform: rotate(360deg) scale(1); }
}

/* ===============================================================
   GESPERRTE INSEL - MYSTERIOSER NEBEL
   =============================================================== */

.island-locked {
    filter: grayscale(80%) blur(3px);
    opacity: 0.6;
    pointer-events: none;
    position: relative;
}

.island-locked::after {
    content: '\1F512';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 35px;
    filter: none;
    opacity: 1;
    animation: lock-bounce 2s ease-in-out infinite;
}

@keyframes lock-bounce {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -55%) scale(1.1); }
}

/* ===============================================================
   ABGESCHLOSSENE INSEL - GOLDEN
   =============================================================== */

.island-completed {
    border: 4px solid #FFD700 !important;
    background: linear-gradient(135deg, #FFF9C4, #FFE082) !important;
}

.island-completed::after {
    content: '\2705';
    position: absolute;
    top: -10px;
    right: -10px;
    font-size: 25px;
}

/* ===============================================================
   STREAK-FLAMME
   =============================================================== */

.streak-box {
    background: linear-gradient(135deg, #FF6B6B, #FF8E53);
    border-radius: 20px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
}

.streak-flame {
    font-size: 50px;
    display: block;
    animation: flame-dance 0.5s ease-in-out infinite alternate;
}

@keyframes flame-dance {
    0% { transform: scale(1) rotate(-8deg); }
    100% { transform: scale(1.15) rotate(8deg); }
}

.streak-number {
    font-size: 36px;
    font-weight: 800;
    color: white;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

/* ===============================================================
   XP-ANZEIGE
   =============================================================== */

.xp-box {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    border-radius: 20px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4);
}

.xp-number {
    font-size: 32px;
    font-weight: 800;
    color: #333;
}

/* XP-Pop Animation bei Gewinn */
.xp-pop {
    position: fixed;
    font-size: 28px;
    font-weight: bold;
    color: #FFD700;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    animation: xp-fly-up 1.5s ease-out forwards;
    pointer-events: none;
    z-index: 9999;
}

@keyframes xp-fly-up {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-100px) scale(1.5); }
}

/* ===============================================================
   FORTSCHRITTS-BALKEN
   =============================================================== */

.progress-bar-container {
    background: #E0E0E0;
    border-radius: 25px;
    height: 35px;
    overflow: hidden;
    box-shadow: inset 0 3px 10px rgba(0,0,0,0.2);
}

.progress-bar-fill {
    background: linear-gradient(90deg, #FFD700, #FF8C00, #FFD700);
    background-size: 200% 100%;
    height: 100%;
    border-radius: 25px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 15px;
    animation: shimmer 2s linear infinite;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* ===============================================================
   SCHATZ-ITEMS
   =============================================================== */

.treasure-item {
    background: linear-gradient(90deg, #FFF8E1, #FFFDE7);
    border-radius: 15px;
    padding: 15px 20px;
    margin: 8px 0;
    display: flex;
    align-items: center;
    gap: 15px;
    transition: all 0.3s ease;
    border-left: 5px solid #FFC107;
    cursor: pointer;
}

.treasure-item:hover {
    transform: translateX(10px) scale(1.02);
    box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
}

.treasure-collected {
    background: linear-gradient(90deg, #C8E6C9, #DCEDC8) !important;
    border-left-color: #4CAF50 !important;
}

.treasure-icon {
    font-size: 30px;
}

/* ===============================================================
   CONFETTI
   =============================================================== */

.confetti-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
}

.confetti-piece {
    position: absolute;
    width: 15px;
    height: 15px;
    animation: confetti-fall 3s ease-out forwards;
}

@keyframes confetti-fall {
    0% {
        opacity: 1;
        transform: translateY(-100px) rotate(0deg);
    }
    100% {
        opacity: 0;
        transform: translateY(100vh) rotate(720deg);
    }
}

/* ===============================================================
   GLITZER-STERNE
   =============================================================== */

.sparkle {
    position: absolute;
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    animation: sparkle-twinkle 2s ease-in-out infinite;
    box-shadow: 0 0 10px 5px rgba(255,255,255,0.5);
}

@keyframes sparkle-twinkle {
    0%, 100% { opacity: 0; transform: scale(0); }
    50% { opacity: 1; transform: scale(1); }
}

/* ===============================================================
   TITEL MIT GRADIENT
   =============================================================== */

.title-gradient {
    background: linear-gradient(90deg, #FFD700, #FF8C00, #FFD700);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradient-flow 3s linear infinite;
    font-size: 48px;
    font-weight: 800;
    text-align: center;
}

@keyframes gradient-flow {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
}

/* ===============================================================
   BUTTONS
   =============================================================== */

.btn-explore {
    background: linear-gradient(135deg, #4CAF50, #45a049);
    color: white;
    border: none;
    border-radius: 25px;
    padding: 12px 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.btn-explore:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(76, 175, 80, 0.5);
}

.btn-explore:active {
    transform: translateY(0);
}

/* ===============================================================
   KLICKBARE INSEL-KARTEN (NEU)
   Der Button wird transparent ueber die Karte gelegt.
   Zum Rueckgaengig machen: Diesen CSS-Block loeschen
   =============================================================== */

/* Container der sowohl Karte als auch Button enthaelt */
div[data-testid="column"] > div[data-testid="stVerticalBlockBorderWrapper"] {
    position: relative;
}

/* Button absolut positionieren ueber der Karte */
div[data-testid="column"] .stButton {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    z-index: 100 !important;
    margin: 0 !important;
}

div[data-testid="column"] .stButton button {
    width: 100% !important;
    height: 100% !important;
    opacity: 0 !important;
    cursor: pointer !important;
    background: transparent !important;
    border: none !important;
}
</style>
"""
