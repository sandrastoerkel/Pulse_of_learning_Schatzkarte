// ============================================
// WerkzeugeTutorial.tsx - React Komponente
// Die 7 Power-Techniken mit animierten Karten
// ============================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WERKZEUGE_CONTENT,
  EFFECT_SIZES,
  type ContentSection,
  type IslandContent
} from '../content/werkzeugeContent';
import '../styles/werkzeuge-tutorial.css';

// Props
interface WerkzeugeTutorialProps {
  ageGroup: 'grundschule' | 'unterstufe' | 'mittelstufe';
  onComplete?: () => void;
}

// Gradient-Farben für die 7 Techniken
const TECHNIQUE_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Retrieval - Lila
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Spaced - Pink
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Feynman - Cyan
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Interleaving - Grün
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Loci - Orange
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Pomodoro - Pastell
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Lehren - Pfirsich
];

// Icons für die Techniken
const TECHNIQUE_ICONS = ['🧠', '📅', '👨‍🏫', '🔀', '🏛️', '🍅', '👥'];

// ============================================
// Sub-Components
// ============================================

// Effektstärke-Badge mit Sternen
const EffectSizeBadge: React.FC<{ 
  value: number; 
  stars: 1 | 2 | 3; 
  label: string;
}> = ({ value, stars, label }) => {
  return (
    <motion.div 
      className="effect-badge"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <span className="effect-value">d = {value.toFixed(2)}</span>
      <span className="effect-stars">
        {'⭐'.repeat(stars)}
      </span>
      <span className="effect-label">{label}</span>
    </motion.div>
  );
};

// Studie Highlight-Box
const StudyHighlight: React.FC<{
  authors: string;
  year: number;
  finding: string;
}> = ({ authors, year, finding }) => {
  return (
    <motion.div 
      className="study-highlight"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="study-header">
        <span className="study-icon">📚</span>
        <span className="study-citation">{authors} ({year})</span>
      </div>
      <p className="study-finding">{finding}</p>
    </motion.div>
  );
};

// Fun Fact Highlight-Box
const FunFactHighlight: React.FC<{
  emoji: string;
  text: string;
}> = ({ emoji, text }) => {
  return (
    <motion.div 
      className="funfact-highlight"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, type: 'spring' }}
    >
      <span className="funfact-emoji">{emoji}</span>
      <span className="funfact-label">Fun Fact</span>
      <p className="funfact-text">{text}</p>
    </motion.div>
  );
};

// Pro-Tip Box
const ProTipBox: React.FC<{ tip: string }> = ({ tip }) => {
  return (
    <motion.div 
      className="protip-box"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <span className="protip-icon">💡</span>
      <span className="protip-label">Pro-Tipp</span>
      <p className="protip-text">{tip}</p>
    </motion.div>
  );
};

// Progress Indicator (1-7)
const ProgressIndicator: React.FC<{
  current: number;
  total: number;
}> = ({ current, total }) => {
  return (
    <div className="progress-indicator">
      <div className="progress-label">Technik {current} von {total}</div>
      <div className="progress-bar-container">
        {Array.from({ length: total }, (_, i) => (
          <motion.div
            key={i}
            className={`progress-dot ${i < current ? 'active' : ''} ${i === current - 1 ? 'current' : ''}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05, type: 'spring' }}
          >
            {i < current && (
              <motion.div
                className="progress-fill"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Animierter Expander
const AnimatedExpander: React.FC<{
  title: string;
  content: string;
  isExpanded: boolean;
  onToggle: () => void;
  gradient: string;
  icon: string;
  index: number;
  section: ContentSection;
}> = ({ title, content, isExpanded, onToggle, gradient, icon, index, section }) => {
  
  // Markdown-artiges Rendering (vereinfacht)
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold
      line = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // Italic
      line = line.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      // Blockquote
      if (line.startsWith('>')) {
        return <blockquote key={i} dangerouslySetInnerHTML={{ __html: line.substring(1) }} />;
      }
      // Liste
      if (line.startsWith('- ')) {
        return <li key={i} dangerouslySetInnerHTML={{ __html: line.substring(2) }} />;
      }
      // Nummerierte Liste
      if (/^\d+\.\s/.test(line)) {
        return <li key={i} className="numbered" dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s/, '') }} />;
      }
      // Leerzeile
      if (line.trim() === '' || line.trim() === '---') {
        return <div key={i} className="spacer" />;
      }
      // Normaler Text
      return <p key={i} dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  return (
    <motion.div
      className={`expander-card ${isExpanded ? 'expanded' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <motion.button
        className="expander-header"
        onClick={onToggle}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        style={{ background: gradient }}
      >
        <span className="expander-icon">{icon}</span>
        <span className="expander-title">{title}</span>
        <motion.span
          className="expander-chevron"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="expander-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <div className="expander-inner">
              {/* Effektstärke Badge */}
              {section.effectSize && (
                <EffectSizeBadge 
                  value={section.effectSize.value}
                  stars={section.effectSize.stars}
                  label={section.effectSize.label}
                />
              )}

              {/* Content */}
              <div className="content-text">
                {renderContent(content)}
              </div>

              {/* Pro-Tip */}
              {section.proTip && <ProTipBox tip={section.proTip} />}

              {/* Studie */}
              {section.study && (
                <StudyHighlight 
                  authors={section.study.authors}
                  year={section.study.year}
                  finding={section.study.finding}
                />
              )}

              {/* Fun Fact */}
              {section.funFact && (
                <FunFactHighlight 
                  emoji={section.funFact.emoji}
                  text={section.funFact.text}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Info/Warning/Success Box
const ContentBox: React.FC<{
  section: ContentSection;
  index: number;
}> = ({ section, index }) => {
  const typeStyles = {
    info: { icon: 'ℹ️', className: 'box-info' },
    success: { icon: '✅', className: 'box-success' },
    warning: { icon: '⚠️', className: 'box-warning' },
  };

  const style = typeStyles[section.type as keyof typeof typeStyles] || typeStyles.info;

  // Einfaches Markdown-Rendering
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      line = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      line = line.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      
      if (line.startsWith('- ')) {
        return <li key={i} dangerouslySetInnerHTML={{ __html: line.substring(2) }} />;
      }
      if (line.startsWith('|')) {
        return null; // Tabellen separat behandeln
      }
      if (line.trim() === '') return <div key={i} className="spacer" />;
      return <p key={i} dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  // Tabellen extrahieren und rendern
  const renderTable = (text: string) => {
    const lines = text.split('\n');
    const tableLines = lines.filter(l => l.startsWith('|'));
    
    if (tableLines.length < 2) return null;
    
    const headers = tableLines[0].split('|').filter(Boolean).map(h => h.trim());
    const rows = tableLines.slice(2).map(row => 
      row.split('|').filter(Boolean).map(cell => cell.trim())
    );

    return (
      <table className="content-table">
        <thead>
          <tr>
            {headers.map((h, i) => <th key={i}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => <td key={j} dangerouslySetInnerHTML={{ __html: cell }} />)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const hasTable = section.content.includes('|');

  return (
    <motion.div
      className={`content-box ${style.className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="content-box-header">
        <span className="content-box-icon">{style.icon}</span>
        <h3>{section.title}</h3>
      </div>
      <div className="content-box-body">
        {renderContent(section.content)}
        {hasTable && renderTable(section.content)}
        
        {/* Studie Highlight */}
        {section.study && (
          <StudyHighlight 
            authors={section.study.authors}
            year={section.study.year}
            finding={section.study.finding}
          />
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// Main Component
// ============================================
export const WerkzeugeTutorial: React.FC<WerkzeugeTutorialProps> = ({ 
  ageGroup, 
  onComplete 
}) => {
  const content = WERKZEUGE_CONTENT[ageGroup];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [currentTechnique, setCurrentTechnique] = useState(1);

  // Techniken sind sections mit type='expander'
  const techniques = useMemo(() => 
    content.explanation.sections.filter(s => s.type === 'expander'),
    [content]
  );

  const nonTechniques = useMemo(() =>
    content.explanation.sections.filter(s => s.type !== 'expander'),
    [content]
  );

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
    
    // Update current technique für Progress
    const techniqueIndex = techniques.findIndex((_, i) => i === index);
    if (techniqueIndex !== -1) {
      setCurrentTechnique(techniqueIndex + 1);
    }
  };

  // Intro Markdown rendern
  const renderIntro = (text: string) => {
    return text.split('\n').map((line, i) => {
      line = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      line = line.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  return (
    <div className="werkzeuge-tutorial">
      {/* Header */}
      <motion.header 
        className="tutorial-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-decoration">
          <span className="header-icon">🛠️</span>
        </div>
        <h1>{content.title}</h1>
        <div className="header-subtitle">
          Evidenzbasierte Lernstrategien für maximalen Erfolg
        </div>
      </motion.header>

      {/* Intro */}
      <motion.section 
        className="tutorial-intro"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {renderIntro(content.explanation.intro)}
      </motion.section>

      {/* Non-Technique Sections (Info/Warning/Success Boxes) */}
      <section className="content-boxes">
        {nonTechniques.map((section, index) => (
          <ContentBox key={index} section={section} index={index} />
        ))}
      </section>

      {/* Progress Indicator */}
      <ProgressIndicator current={currentTechnique} total={techniques.length} />

      {/* Technique Cards */}
      <section className="technique-cards">
        {techniques.map((section, index) => (
          <AnimatedExpander
            key={index}
            title={section.title}
            content={section.content}
            isExpanded={expandedIndex === index}
            onToggle={() => handleToggle(index)}
            gradient={TECHNIQUE_GRADIENTS[index % TECHNIQUE_GRADIENTS.length]}
            icon={TECHNIQUE_ICONS[index % TECHNIQUE_ICONS.length]}
            index={index}
            section={section}
          />
        ))}
      </section>

      {/* Summary */}
      {content.summary && (
        <motion.section 
          className="tutorial-summary"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="summary-icon">🎯</div>
          <h2>Zusammenfassung</h2>
          <p>{content.summary}</p>
          
          {onComplete && (
            <motion.button
              className="complete-button"
              onClick={onComplete}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Tutorial abschließen ✓
            </motion.button>
          )}
        </motion.section>
      )}
    </div>
  );
};

export default WerkzeugeTutorial;
