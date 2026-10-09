import React, { useEffect, useState } from 'react';

const eventTime = new Date('2026-10-23T00:00:00+05:30').getTime();
const getTimeLeft = () => {
  const distance = Math.max(0, eventTime - Date.now());
  return {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };
};

const Countdown = () => {
  const [time, setTime] = useState(getTimeLeft);
  useEffect(() => {
    const timer = window.setInterval(() => setTime(getTimeLeft()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <section className="countdown" aria-label="Countdown to JARVIS Symposium 2026">
      <div className="countdown-inner"><p className="mono">THE SYSTEM GOES LIVE IN</p>
        <div className="countdown-units">{Object.entries(time).map(([unit, value], i) => <React.Fragment key={unit}>{i > 0 && <span className="countdown-separator">:</span>}<div><span className="countdown-number">{String(value).padStart(2, '0')}</span><span className="countdown-label mono">{unit.toUpperCase()}</span></div></React.Fragment>)}</div>
      </div>
      <span className="countdown-date mono">23—10—2026</span>
    </section>
  );
};

export default Countdown;
