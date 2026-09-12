import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  FileCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  HelpCircle,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { Ticket } from '../types/index.js';

export const SupportView: React.FC = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // New Ticket Form State
  const [category, setCategory] = useState<string>('Slot Booking Issue');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reply message
  const [replyText, setReplyText] = useState<string>('');
  const [sendingReply, setSendingReply] = useState<boolean>(false);

  const fetchTickets = async () => {
    const token = localStorage.getItem('paradox_token');
    try {
      const res = await fetch('/api/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
        if (data.length > 0 && !selectedTicket) {
          setSelectedTicket(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setSubmitting(true);
    setSuccessMsg(null);
    const token = localStorage.getItem('paradox_token');

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category,
          subject,
          description,
          priority,
          farmerName: user?.name,
          farmerPhone: user?.phone,
        }),
      });

      if (res.ok) {
        const newTicket = await res.json();
        setTickets((prev) => [newTicket, ...prev]);
        setSelectedTicket(newTicket);
        setSubject('');
        setDescription('');
        setSuccessMsg(`Ticket ${newTicket.ticketId} successfully lodged! Our Help Desk will respond shortly.`);
      }
    } catch (err) {
      console.error('Ticket submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || sendingReply) return;

    setSendingReply(true);
    const token = localStorage.getItem('paradox_token');

    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: replyText.trim() }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedTicket(updated);
        setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setReplyText('');
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 1. HEADER & TOLL-FREE CALL CENTRE HERO */}
      <div className="bg-gradient-to-r from-emerald-900 to-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-0.5 rounded-full text-xs font-semibold border border-amber-400/30">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{t('support.callCentreTitle')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif">
            {t('support.title')}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            {t('support.subtitle')}
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-xl p-5 text-center shrink-0 w-full md:w-auto">
          <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold block">
            Toll-Free Kisan Helpline
          </span>
          <a
            href="tel:18001801551"
            className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white hover:text-amber-300 transition block mt-1"
          >
            1800-180-1551
          </a>
          <span className="text-[11px] text-emerald-200 block mt-1">
            {t('support.callCentreTiming')}
          </span>
        </div>
      </div>

      {/* 2. THREE-LEVEL ESCALATION FRAMEWORK NOTICE */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
          {t('support.escalation')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="font-bold text-emerald-900 block">{t('support.level1')}</span>
            <span className="text-stone-600 text-[11px]">Immediate assistance with slot booking, portal navigation & general queries.</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="font-bold text-amber-900 block">{t('support.level2')}</span>
            <span className="text-stone-600 text-[11px]">Direct liaison with assigned Mandi In-Charge for queue priority or physical delay.</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="font-bold text-red-900 block">{t('support.level3')}</span>
            <span className="text-stone-600 text-[11px]">State Marketing Board & Central Admin escalation for MSP payment or quality disputes.</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORK AREA: Lodging Tickets & Conversation Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Lodge New Grievance */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-lg font-bold text-stone-900 font-serif flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-700" />
              <span>{t('support.raiseComplaint')}</span>
            </h2>
            <p className="text-xs text-stone-500">
              Submit your issue to receive a tracked resolution reference.
            </p>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateTicket} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('support.category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              >
                <option value="Slot Booking Issue">{t('support.categories.slotBooking')}</option>
                <option value="Mandi Queue Delay">{t('support.categories.centreQueue')}</option>
                <option value="Weighment & Grading Discrepancy">{t('support.categories.weighment')}</option>
                <option value="Payment / MSP Transfer Issue">{t('support.categories.paymentMsp')}</option>
                <option value="Technical Glitch">{t('support.categories.technical')}</option>
                <option value="Other Inquiry">{t('support.categories.other')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('support.priority')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                      priority === p
                        ? p === 'HIGH'
                          ? 'bg-red-600 text-white border-red-600'
                          : p === 'MEDIUM'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-stone-50 text-stone-600 border-stone-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('support.subject')}
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your grievance..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('support.description')}
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed information, including booking token or mandi name if applicable..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              id="submit-ticket-btn"
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? t('common.loading') : t('support.submitTicket')}</span>
            </button>
          </form>
        </div>

        {/* Right Area: Your Tickets & Conversation Thread */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-stone-900 font-serif flex items-center justify-between">
              <span>{t('support.trackTicket')}</span>
              <span className="text-xs font-mono font-normal text-stone-500">
                {tickets.length} Registered Grievances
              </span>
            </h2>

            {/* Tickets selector pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTicket(t)}
                  className={`px-3 py-2 rounded-xl border text-left shrink-0 transition ${
                    selectedTicket?.id === t.id
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs">{t.ticketId}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="text-[11px] truncate max-w-[140px] opacity-90 mt-0.5">
                    {t.subject}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Ticket Conversation Thread */}
            {selectedTicket ? (
              <div className="border-t border-stone-200 pt-4 space-y-4">
                {/* Meta details */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-stone-500 block text-[10px]">Category & Escalation</span>
                    <span className="font-bold text-stone-900">{selectedTicket.category}</span> •{' '}
                    <span className="text-emerald-800 font-semibold">{selectedTicket.escalationLevel}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-500 block text-[10px]">Assigned Officer</span>
                    <span className="font-bold text-stone-800">{selectedTicket.assignedTo || 'Central Help Desk'}</span>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="space-y-3 max-h-[340px] overflow-y-auto p-1">
                  {selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        msg.senderRole === 'FARMER'
                          ? 'bg-emerald-50 border-emerald-200 ml-4'
                          : 'bg-stone-50 border-stone-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-stone-900">
                          {msg.senderName} ({msg.senderRole})
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-stone-700 leading-relaxed">{msg.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Box */}
                <form onSubmit={handleSendReply} className="flex gap-2 pt-2 border-t border-stone-100">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response to the support officer..."
                    className="flex-1 px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition disabled:opacity-40"
                  >
                    Reply
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-8 text-stone-400 text-xs">
                Select a ticket above or submit a new grievance to initiate tracked support.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
