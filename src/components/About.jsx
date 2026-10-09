import React from 'react';

const About = () => (
  <section id="about" className="section about-section" aria-labelledby="about-title">
    <div className="section-inner about-grid">
      <div className="about-copy">
        <p className="section-kicker mono"><span>01</span> / ABOUT JARVIS</p>
        <h2 id="about-title" className="display-heading">WHERE IDEAS<br/><span>MEET</span> INTELLIGENCE<span className="heading-period">.</span></h2>
        <p className="body-copy">JARVIS Symposium 2026 brings students together to explore artificial intelligence, data science, and the ideas shaping tomorrow. Built by the Department of Artificial Intelligence and Data Science Engineering at Er. Perumal Manimekalai College of Engineering, it is a day to learn, share, and experiment.</p>
        <div className="about-stamp mono">JARVIS.EXE <span>— READY</span></div>
      </div>
      <div className="spec-sheet">
        <div className="spec-top mono"><span>EVENT_SPECIFICATION</span><span>01—04</span></div>
        <dl>
          <div><dt>EVENT</dt><dd>JARVIS SYMPOSIUM 2026</dd></div>
          <div><dt>ORGANIZER</dt><dd>DEPARTMENT OF AI &amp; DATA SCIENCE ENGINEERING</dd></div>
          <div><dt>DATE</dt><dd>23 OCTOBER 2026</dd></div>
          <div><dt>LOCATION</dt><dd>PMC TECH, HOSUR</dd></div>
          <div><dt>THEME</dt><dd>AI FOR A BETTER TOMORROW</dd></div>
        </dl>
        <div className="spec-bottom mono"><span>PMC TECH / HOSUR</span><span>DESIGNATION / 2026</span></div>
      </div>
    </div>
  </section>
);

export default About;
