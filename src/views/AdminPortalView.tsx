import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Building2, Users, FileCheck, Megaphone, ShieldCheck, Search, Save, UserPlus, UserX, UserCheck, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { Centre, Ticket, Announcement, User } from '../types/index.js';
import { CentrePicker } from '../components/CentrePicker.js';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('paradox_token')}` });

export const AdminPortalView: React.FC = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [tab, setTab] = useState<'analytics' | 'staff' | 'centres' | 'grievances' | 'announcements'>('analytics');
  const [centres, setCentres] = useState<Centre[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [staffSearch, setStaffSearch] = useState('');
  const [centreSearch, setCentreSearch] = useState('');
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', phone: '', email: '', password: '', centreId: '' });
  const [noticeEn, setNoticeEn] = useState('');
  const [noticeHi, setNoticeHi] = useState('');

  const load = async () => {
    setLoading(true);
    const headers = authHeaders();
    try {
      const [s, c, u, ti, an] = await Promise.all([
        fetch('/api/stats'), fetch('/api/centres'), fetch('/api/admin/users', { headers }), fetch('/api/tickets', { headers }), fetch('/api/announcements'),
      ]);
      if (s.ok) setStats(await s.json());
      if (c.ok) { const data = await c.json(); setCentres(Array.isArray(data) ? data : data.centres || []); }
      if (u.ok) {
        const users: User[] = await u.json();
        const staffUsers = users.filter((x) => x.role === 'STAFF');
        setStaff(staffUsers);
        setAssignments(Object.fromEntries(staffUsers.map((x) => [x.id, x.assignedCentreId || ''])));
      }
      if (ti.ok) setTickets(await ti.json());
      if (an.ok) setAnnouncements(await an.json());
    } catch (err: any) { setMessage(err.message || 'Unable to load administration data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user?.id]);

  const saveStaffAssignment = async (staffId: string) => {
    const centreId = assignments[staffId];
    if (!centreId) return setMessage('Select a procurement centre first.');
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/assignment`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ centreId }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to update staff assignment');
      setStaff((prev) => prev.map((s) => s.id === staffId ? data : s));
      setMessage(`Staff assignment updated: ${data.name} → ${data.state}, ${data.district}.`);
    } catch (err: any) { setMessage(err.message || 'Unable to update staff assignment.'); }
  };

  const addStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/staff', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(newStaff) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to add staff');
      setStaff((prev) => [data, ...prev]);
      setAssignments((prev) => ({ ...prev, [data.id]: data.assignedCentreId || '' }));
      setNewStaff({ name: '', phone: '', email: '', password: '', centreId: '' });
      setShowAddStaff(false);
      setMessage(`New staff added successfully: ${data.name}.`);
    } catch (err: any) { setMessage(err.message || 'Unable to add staff.'); }
  };

  const changeStaffStatus = async (staffId: string, active: boolean) => {
    const action = active ? 'reactivate' : 'remove this staff member from active duty';
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ active }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to change staff status');
      setStaff((prev) => prev.map((s) => s.id === staffId ? data : s));
      setAssignments((prev) => ({ ...prev, [staffId]: data.assignedCentreId || '' }));
      setMessage(active ? `${data.name} is active again.` : `${data.name} has been removed from active duty and unassigned.`);
    } catch (err: any) { setMessage(err.message || 'Unable to change staff status.'); }
  };

  const deleteStaff = async (staffId: string, name: string) => {
    if (!window.confirm(`Permanently delete ${name}'s staff account? Use this only when the account should no longer exist.`)) return;
    try {
      const res = await fetch(`/api/admin/staff/${staffId}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to delete staff');
      setStaff((prev) => prev.filter((s) => s.id !== staffId));
      setMessage(`${name}'s staff account was deleted.`);
    } catch (err: any) { setMessage(err.message || 'Unable to delete staff.'); }
  };

  const updateCentre = async (id: string, patch: any) => {
    const res = await fetch(`/api/admin/centres/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(patch) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Unable to update centre');
    setCentres((prev) => prev.map((c) => c.id === id ? data : c));
  };

  const resolveTicket = async (id: string) => {
    const res = await fetch(`/api/tickets/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ status: 'RESOLVED', resolutionNote: 'Resolved by central administration.' }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) { setTickets((prev) => prev.map((t) => t.id === data.id ? data : t)); setMessage('Grievance marked resolved.'); }
  };

  const publishNotice = async (e: React.FormEvent) => {
    e.preventDefault(); if (!noticeEn.trim()) return;
    const res = await fetch('/api/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ title: noticeEn.trim(), titleHi: noticeHi.trim() || noticeEn.trim(), description: noticeEn.trim(), descriptionHi: noticeHi.trim() || noticeEn.trim(), category: 'Important Notice', priority: 'NORMAL' }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMessage(data.error || 'Unable to publish notice.');
    setAnnouncements((prev) => [data, ...prev]); setNoticeEn(''); setNoticeHi(''); setMessage('Announcement published.');
  };

  const filteredStaff = useMemo(() => staff.filter((s) => `${s.name} ${s.staffId || ''} ${s.phone} ${s.state || ''} ${s.district || ''}`.toLowerCase().includes(staffSearch.toLowerCase())), [staff, staffSearch]);
  const filteredCentres = useMemo(() => centres.filter((c) => `${c.name} ${c.state} ${c.district} ${c.pinCode}`.toLowerCase().includes(centreSearch.toLowerCase())), [centres, centreSearch]);
  const activeStaffCount = staff.filter((s) => s.active !== false).length;

  return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
    <section className="bg-stone-900 text-white rounded-2xl p-6 shadow-xl flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center"><ShieldCheck className="w-8 h-8" /></div><div><div className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">Central Control</div><h1 className="text-2xl font-black font-serif">{t('admin.dashboard')}</h1><p className="text-xs text-stone-300 mt-1">Manage staff, centres, grievances and public notices. Farmer bookings are handled by centre staff.</p></div></section>
    {message && <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2"><span>{message}</span><button className="ml-auto font-bold" onClick={() => setMessage(null)}>Dismiss</button></div>}

    <div className="flex gap-2 overflow-x-auto border-b border-stone-200">{[
      ['analytics', <BarChart3 className="w-4 h-4" />, 'Overview'], ['staff', <Users className="w-4 h-4" />, 'Staff Management'], ['centres', <Building2 className="w-4 h-4" />, 'Centres'], ['grievances', <FileCheck className="w-4 h-4" />, 'Grievances'], ['announcements', <Megaphone className="w-4 h-4" />, 'Announcements'],
    ].map(([id, icon, label]) => <button key={String(id)} onClick={() => setTab(id as any)} className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-1.5 ${tab === id ? 'border-amber-500 text-emerald-900' : 'border-transparent text-stone-500'}`}>{icon}{label}</button>)}</div>

    {loading && <div className="bg-white rounded-xl border p-8 text-center text-sm text-stone-500">Loading central administration data…</div>}
    {!loading && tab === 'analytics' && <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[['Centres', stats?.totalCentres ?? centres.length], ['Open Centres', stats?.openCentres ?? 0], ['Active Staff', activeStaffCount], ['Total Farmers', stats?.totalFarmers ?? 0], ['Completed Bookings', stats?.completedBookings ?? 0], ['Pending Bookings', stats?.pendingBookings ?? 0], ['In Progress', stats?.inProgressBookings ?? 0], ['Open Grievances', stats?.openTickets ?? 0]].map(([label, value]) => <div key={String(label)} className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm"><span className="text-xs text-stone-500">{label}</span><b className="block text-2xl font-black font-mono text-stone-900 mt-1">{Number(value).toLocaleString()}</b></div>)}</div>}

    {!loading && tab === 'staff' && <section className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3"><div><h2 className="text-xl font-bold font-serif">Staff Management</h2><p className="text-xs text-stone-500">Add staff, assign their working centre, remove them from active duty or permanently delete an account.</p></div><div className="flex gap-2"><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" /><input value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)} placeholder="Search staff…" className="w-full pl-9 p-2 border rounded-lg text-xs" /></div><button onClick={() => setShowAddStaff((v) => !v)} className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"><UserPlus className="w-4 h-4" />Add Staff</button></div></div>
      {showAddStaff && <form onSubmit={addStaff} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"><label className="text-xs font-bold">Full Name<input required value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} className="mt-1 w-full p-2 border rounded-lg bg-white font-normal" /></label><label className="text-xs font-bold">Mobile<input required value={newStaff.phone} onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="mt-1 w-full p-2 border rounded-lg bg-white font-normal font-mono" /></label><label className="text-xs font-bold">Email<input type="email" value={newStaff.email} onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} className="mt-1 w-full p-2 border rounded-lg bg-white font-normal" /></label><label className="text-xs font-bold">Temporary Password<input required minLength={6} value={newStaff.password} onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })} className="mt-1 w-full p-2 border rounded-lg bg-white font-normal" /></label><div><CentrePicker centres={centres} value={newStaff.centreId} onChange={(id) => setNewStaff({ ...newStaff, centreId: id })} label="Working Centre" placeholder="Search centre…" /><button type="submit" className="mt-2 w-full px-3 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold">Create Staff Account</button></div></form>}
      {filteredStaff.map((s) => <div key={s.id} className={`bg-white border rounded-2xl p-5 grid lg:grid-cols-[1fr_1.3fr_auto] gap-4 items-end ${s.active === false ? 'opacity-70 bg-stone-50' : ''}`}>
        <div><div className="flex items-center gap-2"><b className="text-sm">{s.name}</b><span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${s.active === false ? 'bg-stone-200 text-stone-600' : 'bg-emerald-100 text-emerald-800'}`}>{s.active === false ? 'INACTIVE' : 'ACTIVE'}</span></div><p className="text-xs text-stone-500 mt-1">Staff ID: {s.staffId || s.id} • {s.phone}</p><p className="text-xs text-stone-500">Current: {s.state || 'Unassigned'}, {s.district || '—'}</p></div>
        <CentrePicker centres={centres} value={assignments[s.id] || ''} onChange={(id) => setAssignments((prev) => ({ ...prev, [s.id]: id }))} label="Assigned Procurement Centre" disabled={s.active === false} placeholder="Search centre, district or PIN…" />
        <div className="flex flex-wrap gap-2 justify-end"><button disabled={s.active === false} onClick={() => saveStaffAssignment(s.id)} className="px-3 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-40"><Save className="w-3.5 h-3.5" />Save</button>{s.active !== false ? <button onClick={() => changeStaffStatus(s.id, false)} className="px-3 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1"><UserX className="w-3.5 h-3.5" />Remove Duty</button> : <button onClick={() => changeStaffStatus(s.id, true)} className="px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" />Reactivate</button>}<button onClick={() => deleteStaff(s.id, s.name)} className="px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold">Delete</button></div>
      </div>)}
      {filteredStaff.length === 0 && <div className="p-8 text-center text-sm text-stone-500 bg-white border rounded-xl">No staff account found.</div>}
    </section>}

    {!loading && tab === 'centres' && <section className="space-y-4"><div className="flex justify-between gap-3 items-center"><div><h2 className="text-xl font-bold font-serif">Centre Control</h2><p className="text-xs text-stone-500">Monitor capacity and centre availability.</p></div><div className="relative w-80 max-w-full"><Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" /><input value={centreSearch} onChange={(e) => setCentreSearch(e.target.value)} placeholder="Search centre…" className="w-full pl-9 p-2 border rounded-lg text-xs" /></div></div><div className="grid md:grid-cols-2 gap-4">{filteredCentres.map((c) => <div key={c.id} className="bg-white border rounded-xl p-4"><div className="flex justify-between gap-2"><div><b className="text-sm">{c.name}</b><p className="text-[11px] text-stone-500">{c.district}, {c.state} • {c.pinCode}</p></div><span className="text-[10px] font-bold px-2 py-1 rounded-full bg-stone-100">{c.status}</span></div><div className="grid grid-cols-3 gap-2 mt-3 text-xs"><span>Capacity <b>{c.capacityPerDay}</b></span><span>Available <b>{c.availableSlots}</b></span><span>Queue <b>{c.currentQueue}</b></span></div><div className="flex gap-2 mt-4"><button onClick={() => updateCentre(c.id, { status: 'OPEN' }).catch((e) => setMessage(e.message))} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold">Open</button><button onClick={() => updateCentre(c.id, { status: 'FULL' }).catch((e) => setMessage(e.message))} className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold">Full</button><button onClick={() => updateCentre(c.id, { status: 'CLOSED' }).catch((e) => setMessage(e.message))} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-800 text-xs font-bold">Close</button></div></div>)}</div></section>}

    {!loading && tab === 'grievances' && <section className="space-y-3">{tickets.filter((x) => x.status !== 'RESOLVED' && x.status !== 'CLOSED').map((x) => <div key={x.id} className="bg-white border rounded-xl p-4 flex flex-col md:flex-row justify-between gap-3"><div><b className="text-sm">{x.ticketId} — {x.subject}</b><p className="text-xs text-stone-500 mt-1">{x.userName} • {x.category} • Priority {x.priority}</p><p className="text-xs mt-2 text-stone-700">{x.description}</p></div><button onClick={() => resolveTicket(x.id)} className="h-fit px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold">Resolve</button></div>)}{tickets.filter((x) => x.status !== 'RESOLVED' && x.status !== 'CLOSED').length === 0 && <div className="bg-white border rounded-xl p-8 text-center text-sm text-stone-500">No open grievances.</div>}</section>}

    {!loading && tab === 'announcements' && <section className="grid lg:grid-cols-2 gap-5"><form onSubmit={publishNotice} className="bg-white border rounded-2xl p-5 space-y-3"><h2 className="font-bold font-serif">Publish Public Notice</h2><input required value={noticeEn} onChange={(e) => setNoticeEn(e.target.value)} placeholder="English notice" className="w-full p-2 border rounded-lg text-xs" /><textarea value={noticeHi} onChange={(e) => setNoticeHi(e.target.value)} placeholder="Hindi notice (optional)" className="w-full p-2 border rounded-lg text-xs min-h-24" /><button className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold">Publish Announcement</button></form><div className="space-y-3">{announcements.map((a) => <div key={a.id} className="bg-white border rounded-xl p-4"><b className="text-sm">{language === 'hi' ? a.titleHi : a.title}</b><p className="text-xs text-stone-500 mt-1">{language === 'hi' ? a.descriptionHi : a.description}</p></div>)}</div></section>}
  </div>;
};
