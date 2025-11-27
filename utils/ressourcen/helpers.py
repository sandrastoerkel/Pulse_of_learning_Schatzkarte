"""
Helper-Funktionen für die Ressourcen-Seite.

Enthält Rendering-Funktionen für Videos, Tipps und Wissenschaft.
"""

import streamlit as st

# Versuche streamlit-player zu importieren
try:
    from streamlit_player import st_player
    HAS_PLAYER = True
except ImportError:
    HAS_PLAYER = False


def embed_youtube(video_id: str, title: str = ""):
    """Bettet YouTube-Video ein"""

    url = f"https://www.youtube.com/watch?v={video_id}"

    if HAS_PLAYER:
        st_player(url)
    else:
        # st.video unterstützt YouTube direkt
        st.video(url)


def render_video_section(videos: list, color: str):
    """Rendert die Video-Sektion"""

    if not videos:
        st.info("🎬 Videos für diesen Bereich werden gerade analysiert. Schau bald wieder vorbei!")
        return

    validated_videos = [v for v in videos if v.get('validated', False)]

    if not validated_videos:
        st.info("🎬 Videos für diesen Bereich werden gerade analysiert. Schau bald wieder vorbei!")
        return

    for video in validated_videos:
        st.markdown(f"""
        <div style="background: white; border-radius: 15px; padding: 5px;
                    margin: 15px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    border-left: 5px solid {color};">
        </div>
        """, unsafe_allow_html=True)

        col1, col2 = st.columns([3, 2])

        with col1:
            # Video einbetten
            embed_youtube(video['id'], video.get('title', ''))

        with col2:
            st.markdown(f"### {video.get('title', 'Video')}")
            st.markdown(f"**{video.get('creator', '')}** · {video.get('duration_min', '?')} Min")

            if video.get('views'):
                st.markdown(f"👁️ {video.get('views')} Views")
            if video.get('score'):
                st.success(f"⭐ **Validierungs-Score: {video.get('score')}/10**")

            st.markdown("---")

            if video.get('kernbotschaft'):
                st.info(f"**💡 Kernbotschaft:** {video.get('kernbotschaft')}")

        # Warum hilft dieses Video?
        if video.get('warum_hilft'):
            with st.expander("🎯 Warum hilft dir dieses Video?", expanded=False):
                st.markdown(video.get('warum_hilft'))

        st.markdown("---")


def render_tipps_section(tipps: list, color: str):
    """Rendert die Tipps-Sektion"""

    if not tipps:
        st.info("💡 Tipps für diesen Bereich werden gerade zusammengestellt.")
        return

    # Sortiere: Sofort umsetzbar und leicht zuerst
    sofort = [t for t in tipps if t.get('sofort_umsetzbar', False) and t.get('schwierigkeit') == 'leicht']
    spaeter = [t for t in tipps if t not in sofort]

    if sofort:
        st.markdown("### ⚡ Sofort umsetzbar")
        for tipp in sofort:
            with st.expander(f"{tipp.get('titel', 'Tipp')} · ⏱️ {tipp.get('dauer', '')}", expanded=False):
                st.markdown(tipp.get('beschreibung', ''))

    if spaeter:
        st.markdown("### 📅 Mit etwas Übung")
        for tipp in spaeter:
            with st.expander(f"{tipp.get('titel', 'Tipp')} · ⏱️ {tipp.get('dauer', '')}", expanded=False):
                st.markdown(tipp.get('beschreibung', ''))


def render_wissenschaft_section(wissenschaft: dict, color: str):
    """Rendert die Wissenschafts-Sektion"""

    col1, col2, col3 = st.columns(3)

    with col1:
        d = wissenschaft.get('hattie_d', 0)
        if isinstance(d, str):
            # Falls d ein String ist (z.B. "0.92 + 1.33")
            delta = "Sehr hoch!"
        elif d >= 0.8:
            delta = "Sehr hoch!"
        elif d >= 0.6:
            delta = "Hoch"
        elif d >= 0.4:
            delta = "Überdurchschnittlich"
        else:
            delta = None
        st.metric("Hattie-Effektstärke", f"d = {d}", delta)

    with col2:
        st.metric("Hattie-Rang", f"#{wissenschaft.get('hattie_rank', '?')} / 252")

    with col3:
        st.metric("PISA-Einfluss", wissenschaft.get('pisa_impact', '?'))

    if wissenschaft.get('erklaerung'):
        st.markdown("---")
        st.markdown(wissenschaft.get('erklaerung'))
