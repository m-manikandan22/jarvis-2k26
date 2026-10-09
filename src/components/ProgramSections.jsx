import React from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

export const Workshop = () => (
  <section id="workshop" className="workshop-section" aria-labelledby="workshop-title">
    <div className="workshop-inner section-inner">
      <div className="workshop-mark mono"><span className="ms-mark"><i/><i/><i/><i/></span> MICROSOFT / AI WORKSHOP</div>
      <div className="workshop-layout">
        <div>
          <p className="section-kicker mono light-kicker"><span>03</span> / WORKSHOP</p>
          <h2 id="workshop-title">BUILD.<br/>LEARN.<br/><span>EXPLORE.</span></h2>
        </div>
        <div className="workshop-note">
          <p className="workshop-label mono">MICROSOFT<br/>AI WORKSHOP</p>
          <p>Make room for new tools, practical exploration, and fresh ways to think about AI.</p>
          <p className="workshop-status">DETAILS / TO BE ANNOUNCED</p>
        </div>
      </div>
      <div className="workshop-grid-mark" aria-hidden="true"/>
    </div>
  </section>
);

export const PaperPresentation = ({ onRegisterClick }) => (
  <section id="paper" className="section paper-section" aria-labelledby="paper-title">
    <div className="section-inner paper-layout">
      <div>
        <p className="section-kicker mono"><span>04</span> / PAPER PRESENTATION</p>
        <h2 id="paper-title" className="paper-title">IDEAS<br/>DESERVE TO<br/><span>BE HEARD.</span></h2>
      </div>
      <div className="paper-aside">
        <div className="paper-rule"/>
        <p className="paper-lede">Research. Innovation. A point of view.</p>
        <p className="body-copy">Bring your ideas in artificial intelligence, data science, machine learning, and emerging technology to the JARVIS stage.</p>
        <div className="topic-list mono">
          <span>AI</span>
          <span>DATA SCIENCE</span>
          <span>MACHINE LEARNING</span>
          <span>GENERATIVE AI</span>
        </div>
        <button className="button button-outline" onClick={onRegisterClick}>PRESENT YOUR IDEA <ArrowRight size={18}/></button>
      </div>
    </div>
  </section>
);

const coordinators = [
  { role: 'STUDENT COORDINATOR', name: 'M. MANIKANDAN', phone: '9345386032', tone: 'blue' },
  { role: 'STUDENT COORDINATOR', name: 'B. THARUN BALA', phone: '6379320029', tone: 'orange' },
  { role: 'STAFF COORDINATOR', name: 'S. SURYA', title: 'AP / AI & DS', tone: 'blue' },
  { role: 'CONVENER', name: 'DR. J. GUL SHAIRA BANU', title: 'HOD / AI & DS', tone: 'orange' },
  { role: 'PATRON', name: 'DR. A. SENTHIL KUMAR', title: 'PRINCIPAL', tone: 'blue' },
];

export const Coordinators = () => (
  <section id="team" className="section team-section" aria-labelledby="team-title">
    <div className="section-inner">
      <div className="section-heading-row">
        <div>
          <p className="section-kicker mono"><span>05</span> / PEOPLE BEHIND IT</p>
          <h2 id="team-title" className="section-title">THE<br/><span>COORDINATORS.</span></h2>
        </div>
        <p className="section-intro">The people bringing JARVIS 2026 to life.</p>
      </div>
      <div className="coordinator-grid">
        {coordinators.map((person, index) => (
          <article className={`coordinator-card ${person.tone}`} key={person.name}>
            <span className="coordinator-index mono">0{index + 1} / {person.role}</span>
            <div className="coordinator-initial" aria-hidden="true">{person.name.replace('DR. ', '').slice(0, 1)}</div>
            <h3>{person.name}</h3>
            <p className="mono coordinator-role">{person.title || person.role}</p>
            {person.phone && (
              <a href={`tel:+91${person.phone}`} className="coordinator-phone mono">+91 {person.phone}</a>
            )}
          </article>
        ))}
      </div>
    </div>
  </section>
);

export const Registration = ({ onRegisterClick }) => (
  <section id="register" className="registration-section" aria-labelledby="register-title">
    <div className="registration-inner section-inner">
      <p className="section-kicker mono light-kicker"><span>06</span> / REGISTRATION</p>
      <div className="registration-layout">
        <h2 id="register-title" className="registration-title">
          READY TO<br/><span>ENTER THE</span><br/><span className="section-kicker mono">SYNCHRONIZE</span>
        </h2>
        <div className="registration-side">
          <div className="date-stamp">
            <b>23</b>
            <span className="mono">OCT<span>2026</span></span>
          </div>
          <p>Meet us at PMC Tech, Hosur.</p>
          <p className="mono" style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1rem' }}>Registration Fee: ₹200 per head</p>
          <button className="button button-light" onClick={onRegisterClick}>REGISTER NOW <ArrowRight size={18}/></button>
        </div>
        <div className="registration-bottom mono">
          <span>AI FOR A BETTER TOMORROW</span>
          <span>23.10.2026 <ArrowUpRight size={14}/></span>
        </div>
      </div>
    </div>
  </section>
);
