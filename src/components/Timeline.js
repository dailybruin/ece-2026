import React, { useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from '../shared/hooks'; // Adjust path as needed
import './Timeline.css';

const MILESTONES = [
  { year: "2023", title: "Founded", desc: "Where the story starts. The horizontal strip begins pinned right here as you start scrolling through our history." },
  { year: "2024", title: "First Milestone", desc: "As you keep scrolling down, the strip slides left and the timeline track below dynamically fills toward this peg." },
  { year: "2025", title: "Rapid Growth", desc: "Each milestone peg pops active right as its corresponding card takes center stage in the viewport." },
  { year: "2026", title: "Present Day", desc: "The final card enters full frame, completing the line fill and concluding our timeline track perfectly." }
];

// Progress thresholds for lighting up the timeline pegs
const PEG_THRESHOLDS_DESKTOP = [0, 0.28, 0.62, 0.95];
const PEG_THRESHOLDS_MOBILE = [0, 0.22, 0.55, 0.88];

function Timeline() {
  const { width } = useWindowDimensions();
  const sectionRef = useRef(null);
  const pinWrapRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const isMobile = width <= 700;

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const sectionRect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      const totalScrollableDistance = sectionHeight - viewportHeight;
      const currentScrollProgress = -sectionRect.top;

      let currentProgress = currentScrollProgress / totalScrollableDistance;
      currentProgress = Math.max(0, Math.min(1, currentProgress));
      
      setProgress(currentProgress);

      // Apply physical moving transformations ONLY on desktop view layout
      if (!isMobile && pinWrapRef.current) {
        const maxTranslate = pinWrapRef.current.scrollWidth - window.innerWidth;
        const currentTranslate = currentProgress * maxTranslate;
        pinWrapRef.current.style.transform = `translateX(-${currentTranslate}px)`;
      } else if (isMobile && pinWrapRef.current) {
        // Reset horizontal transforms cleanly when sizing back down to mobile sizes
        pinWrapRef.current.style.transform = 'none';
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isMobile]);

  const activeThresholds = isMobile ? PEG_THRESHOLDS_MOBILE : PEG_THRESHOLDS_DESKTOP;

  return (
    <section id="sectionPin" className={isMobile ? "mobile-mode" : "desktop-mode"} ref={sectionRef}>
      <div className="pin-wrap-sticky">
        
        {/* The Card view wrapper layout container */}
        <div className="pin-wrap" ref={pinWrapRef}>
          {MILESTONES.map((item, idx) => {
            // In mobile vertical sticky mode, we calculate which card is active based on current progress
            const cardActiveRange = 1 / MILESTONES.length;
            const isCardActive = isMobile && (progress >= idx * cardActiveRange && progress < (idx + 1) * cardActiveRange);
            
            return (
              <div className={`card ${isCardActive ? 'active-card' : ''}`} key={idx}>
                <div className="year">{item.year}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Dynamic Interactive Progress Track Component UI Layer */}
        <div className="timeline-track">
          <div 
            className="timeline-fill" 
            style={isMobile ? { height: `${progress * 100}%`, width: '100%' } : { width: `${progress * 100}%` }}
          />
          {MILESTONES.map((item, idx) => {
            const isActive = progress >= activeThresholds[idx];
            return (
              <div className={`peg peg--${idx + 1} ${isActive ? 'active' : ''}`} key={idx}>
                <span className="peg-label">{item.year}</span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default Timeline;