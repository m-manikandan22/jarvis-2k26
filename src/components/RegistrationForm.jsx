import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, ArrowRight, ArrowLeft, CreditCard, Users, Trophy } from 'lucide-react';
import { GAS_CONFIG } from '../config/gasConfig';
import { TECHNICAL_EVENTS, NON_TECHNICAL_EVENTS, EVENT_SCHEDULE } from '../config/events.jsx';

const RegistrationForm = ({ onSuccess, setSelectedEvent }) => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeEventTab, setActiveEventTab] = useState('FULL_DAY');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [serverError, setServerError] = useState('');
  const [registrationId, setRegistrationId] = useState('');

  // Payment state
  const [paymentData, setPaymentData] = useState({ totalAmount: null, paymentId: null, loading: false });

  const [formData, setFormData] = useState({
    teamName: '',
    captain: {
      fullName: '',
      collegeName: '',
      department: '',
      yearOfStudy: '1',
      email: '',
      phone: '',
    },
    members: [], // Array of { fullName, collegeName, department, yearOfStudy, email, phone }
    events: [], // { id, session }
    payment: {
      utr: '',
    }
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (section, field, value) => {
    if (section === 'root') {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else if (section === 'captain') {
      setFormData(prev => ({
        ...prev,
        captain: { ...prev.captain, [field]: value }
      }));
    } else if (section === 'member') {
      // handled in handleMemberChange
    }
  };

  const handleMemberChange = (index, field, value) => {
    setFormData(prev => {
      const newMembers = [...prev.members];
      newMembers[index] = { ...newMembers[index], [field]: value };
      return { ...prev, members: newMembers };
    });
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { fullName: '', collegeName: '', department: '', yearOfStudy: '1', email: '', phone: '' }]
    }));
  };

  const removeTeamMember = (index) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  const handleEventToggle = (eventId) => {
    setFormData(prev => {
      const currentEvents = prev.events;
      const eventConfig = EVENT_SCHEDULE[eventId];
      const session = eventConfig.session;
      const exists = currentEvents.find(e => e.id === eventId);

      if (exists) {
        // Unselect if already selected
        return {
          ...prev,
          events: currentEvents.filter(e => e.id !== eventId)
        };
      }

      // Replace any existing event from the same session and add the new one
      const filteredEvents = currentEvents.filter(e => EVENT_SCHEDULE[e.id].session !== session);
      return {
        ...prev,
        events: [...filteredEvents, { id: eventId, session }]
      };
    });
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.teamName.trim()) newErrors.teamName = 'Team name is required';
    } else if (step === 2) {
      const c = formData.captain;
      if (!c.fullName) newErrors.fullName = 'Full name is required';
      if (!c.collegeName) newErrors.collegeName = 'College name is required';
      if (!c.department) newErrors.department = 'Department is required';
      if (!c.email || !/\S+@\S+\.\S+/.test(c.email)) newErrors.email = 'Valid email is required';
      if (!c.phone || !/^[0-9]{10,15}$/.test(c.phone)) newErrors.phone = 'Valid phone is required';
    } else if (step === 3) {
      formData.members.forEach((m, i) => {
        if (!m.fullName) newErrors[`m${i}_name`] = 'Required';
        if (!m.email || !/\S+@\S+\.\S+/.test(m.email)) newErrors[`m${i}_email`] = 'Invalid email';
      });
    } else if (step === 4) {
      if (formData.events.length === 0) newErrors.events = 'Please select at least one event';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = async () => {
    if (!validateStep()) return;

    if (step === 4) {
      // Transition to payment requires fetching total amount from server
      setPaymentData(prev => ({ ...prev, loading: true }));
      try {
        const response = await fetch(GAS_CONFIG.webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
              requestType: 'calculatePayment',
            teamName: formData.teamName,
            events: formData.events,
            captain: formData.captain,
            members: formData.members
          })
        });
        const data = await response.json();
        if (data.status === 'success') {
          setPaymentData({ totalAmount: data.totalAmount, paymentId: data.paymentId, loading: false });
          setStep(5);
        } else {
          setServerError(data.errors?.general || 'Payment calculation failed');
        }
      } catch (err) {
        setServerError('Payment server unavailable. Please try again.');
      }
    } else {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => setStep(prev => prev - 1);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 5) return;
    if (!formData.payment.utr) {
      setServerError('UTR / Transaction Reference is required');
      return;
    }

    setSubmitting(true);
    setServerError('');
    try {
      const response = await fetch(GAS_CONFIG.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          requestType: 'registration',
          teamName: formData.teamName,
          captain: formData.captain,
          members: formData.members,
          events: formData.events,
          payment: {
            paymentId: paymentData.paymentId,
            utr: formData.payment.utr,
          }
        })
      });
      const data = await response.json();

      if (data.status === 'success') {
        setRegistrationId(data.teamId);
        setSubmitted(true);
      } else if (data.errors) {
        setServerError(data.errors.general || 'Registration failed');
      }
    } catch (error) {
      setServerError('Something went wrong. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-neon-cyan/20 text-neon-cyan animate-bounce">
            <CheckCircle2 className="w-16 h-16" />
          </div>
        </div>
        <h2 className="text-3xl font-futuristic font-bold text-white mb-4">Registration Confirmed!</h2>
        <p className="text-gray-400 text-lg mb-4">Your team has been successfully registered for JARVIS 2K26.</p>
        <p className="text-neon-cyan font-mono text-xl mb-10">Team ID: {registrationId}</p>
        <button onClick={onSuccess} className="btn-primary px-10 py-3">Return to Home</button>
      </motion.div>
    );
  }

  const allEvents = [...TECHNICAL_EVENTS.map(e => ({ ...e, cat: 'Tech' })), ...NON_TECHNICAL_EVENTS.map(e => ({ ...e, cat: 'Non-Tech' }))];

  const getEventDetails = (id) => {
    const event = [...TECHNICAL_EVENTS, ...NON_TECHNICAL_EVENTS].find(e => e.id === id);
    const schedule = EVENT_SCHEDULE[id];
    return event ? { ...event, ...schedule } : null;
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`h-1 w-12 rounded-full transition-colors ${step >= i ? 'bg-neon-cyan' : 'bg-white/10'}`} />
          ))}
        </div>
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Step {step} of 5</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.form
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {step === 1 && (
            <div className="space-y-6 text-center py-10">
              <div className="flex justify-center mb-4"><Trophy className="w-12 h-12 text-neon-cyan" /></div>
              <h2 className="text-3xl font-futuristic font-bold text-white">Establish Your Team</h2>
              <div className="max-w-md mx-auto space-y-2">
                <label className="text-sm font-medium text-gray-300 block text-left">Team Name</label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={(e) => handleInputChange('root', 'teamName', e.target.value)}
                  className={`w-full bg-white/5 border ${errors.teamName ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors`}
                  placeholder="e.g. AI Warriors"
                />
                {errors.teamName && <p className="text-red-500 text-xs text-left">{errors.teamName}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-futuristic font-bold text-white">Captain Details</h2>
                <p className="text-gray-400">The primary contact for the team</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 block">Full Name</label>
                  <input type="text" value={formData.captain.fullName} onChange={(e) => handleInputChange('captain', 'fullName', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors" />
                  {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 block">College Name</label>
                  <input type="text" value={formData.captain.collegeName} onChange={(e) => handleInputChange('captain', 'collegeName', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors" />
                  {errors.collegeName && <p className="text-red-500 text-xs">{errors.collegeName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 block">Department</label>
                  <input type="text" value={formData.captain.department} onChange={(e) => handleInputChange('captain', 'department', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors" />
                  {errors.department && <p className="text-red-500 text-xs">{errors.department}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 block">Year of Study</label>
                  <select value={formData.captain.yearOfStudy} onChange={(e) => handleInputChange('captain', 'yearOfStudy', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors appearance-none">
                    <option value="1" className="bg-space-black">1st Year</option>
                    <option value="2" className="bg-space-black">2nd Year</option>
                    <option value="3" className="bg-space-black">3rd Year</option>
                    <option value="4" className="bg-space-black">4th Year</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 block">Email</label>
                  <input type="email" value={formData.captain.email} onChange={(e) => handleInputChange('captain', 'email', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors" />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 block">Phone</label>
                  <input type="tel" value={formData.captain.phone} onChange={(e) => handleInputChange('captain', 'phone', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors" />
                  {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-futuristic font-bold text-white">Assemble Your Team</h2>
                <p className="text-gray-400">Add the other members of your squad</p>
              </div>
              <div className="space-y-4">
                {formData.members.map((m, i) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 relative">
                    <button type="button" onClick={() => removeTeamMember(i)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase">Full Name</label>
                        <input type="text" value={m.fullName} onChange={(e) => handleMemberChange(i, 'fullName', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-cyan transition-colors" />
                        {errors[`m${i}_name`] && <p className="text-red-500 text-xs">{errors[`m${i}_name`]}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase">Email</label>
                        <input type="email" value={m.email} onChange={(e) => handleMemberChange(i, 'email', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-cyan transition-colors" />
                        {errors[`m${i}_email`] && <p className="text-red-500 text-xs">{errors[`m${i}_email`]}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase">College</label>
                        <input type="text" value={m.collegeName} onChange={(e) => handleMemberChange(i, 'collegeName', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-cyan transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase">Dept</label>
                        <input type="text" value={m.department} onChange={(e) => handleMemberChange(i, 'department', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-cyan transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                ))}
                <button type="button" onClick={addTeamMember} className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-gray-500 hover:text-neon-cyan hover:border-neon-cyan transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm">
                  <Users className="w-5 h-5" /> Add Member
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-futuristic font-bold text-white">Select Events</h2>
                <p className="text-gray-400">Choose up to 1 event per category</p>
              </div>

              <div className="flex justify-center gap-2 mb-8">
                {['FULL_DAY', 'MORNING', 'EVENING'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveEventTab(tab)}
                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                      activeEventTab === tab
                      ? 'bg-neon-cyan text-black shadow-neon-cyan'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {allEvents
                  .filter(e => EVENT_SCHEDULE[e.id].session === activeEventTab)
                  .map(e => (
                    <div key={e.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                      <label className="flex items-center gap-4 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-neon-cyan"
                          checked={formData.events.some(sel => sel.id === e.id)}
                          onChange={() => handleEventToggle(e.id)}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white group-hover:text-neon-cyan transition-colors">
                            {EVENT_SCHEDULE[e.id].title}
                          </span>
                          <span className="text-xs text-gray-500">
                            {EVENT_SCHEDULE[e.id].venue}
                          </span>
                        </div>
                      </label>
                      <button
                        type="button"
                        onClick={() => setSelectedEventId(e.id)}
                        className="p-2 text-gray-500 hover:text-neon-cyan transition-colors"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-futuristic font-bold text-white">Finalize Payment</h2>
                <p className="text-gray-400">Complete your registration by entering the transaction UTR</p>
              </div>

              {paymentData.loading ? (
                <div className="py-20 text-center animate-pulse text-neon-cyan font-mono">Calculating Total Amount...</div>
              ) : (
                <div className="max-w-md mx-auto space-y-8">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-4">
                    <CreditCard className="w-12 h-12 text-neon-cyan mx-auto" />
                    <div>
                      <p className="text-gray-400 text-sm uppercase tracking-widest">Total Amount Payable</p>
                      <p className="text-4xl font-futuristic font-bold text-white">₹{paymentData.totalAmount}</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-neon-cyan text-lg">
                      {GAS_CONFIG.upiId || 'your-upi@bank'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 block">UTR / Transaction Reference</label>
                      <input
                        type="text"
                        value={formData.payment.utr}
                        onChange={(e) => setFormData(prev => ({ ...prev, payment: { ...prev.payment, utr: e.target.value } }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                        placeholder="Enter 12-digit UTR number"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-10">
            {step > 1 && (
              <button type="button" onClick={prevStep} className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < 5 ? (
              <button type="button" onClick={nextStep} className="btn-primary px-8 py-3 flex items-center gap-2 ml-auto">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={submitting} className="btn-primary px-12 py-4 text-lg shadow-neon-cyan disabled:opacity-50 ml-auto">
                {submitting ? 'Processing...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </motion.form>
      </AnimatePresence>

      {serverError && (
        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3 justify-center">
          <AlertCircle className="w-4 h-4" /> {serverError}
        </div>
      )}
    </div>
    <AnimatePresence>
      {selectedEventId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEventId(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-space-black border-l border-white/10 z-50 p-8 overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-futuristic font-bold text-white">Event Details</h3>
              <button
                type="button"
                onClick={() => setSelectedEventId(null)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {getEventDetails(selectedEventId) && (
              <div className="space-y-6">
                {(() => {
                  const details = getEventDetails(selectedEventId);
                  return (
                    <>
                      <div className="space-y-2">
                        <h4 className="text-3xl font-futuristic font-bold text-neon-cyan">{details.title}</h4>
                        <p className="text-lg text-gray-300">{details.subtitle}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-sm font-medium text-gray-400 uppercase mb-2">Overview</p>
                        <p className="text-gray-200 leading-relaxed">{details.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-xs font-medium text-gray-400 uppercase mb-1">Session</p>
                          <p className="text-white font-bold">{details.session}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-xs font-medium text-gray-400 uppercase mb-1">Venue</p>
                          <p className="text-white font-bold">{details.venue}</p>
                        </div>
                      </div>

                      {details.placeholders && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-sm font-medium text-gray-400 uppercase mb-2">Quick Info</p>
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                              <span className="text-gray-500">Team Size:</span>
                              <span className="text-gray-200 text-right">{details.placeholders.teamSize}</span>
                              <span className="text-gray-500">Duration:</span>
                              <span className="text-gray-200 text-right">{details.placeholders.duration}</span>
                              <span className="text-gray-500">Rules:</span>
                              <span className="text-gray-200 text-right">{details.placeholders.rules}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </>
  );
};

export default RegistrationForm;
