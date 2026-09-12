import React, { useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, Volume2, VolumeX, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type ChatMessage = { id: string; sender: 'user' | 'assistant'; text: string; time: string };

type QuickQuestion = { label: string; answerEn: string; answerHi: string };

export const KisanSahayak: React.FC = () => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const questions: QuickQuestion[] = language === 'hi'
    ? [
        { label: 'स्लॉट कैसे बुक करें?', answerHi: 'Centres & Booking खोलें → State और District चुनें → केंद्र चुनें → फसल, मात्रा, तारीख और समय चुनें → Confirm & Generate Token दबाएं।', answerEn: '' },
        { label: 'टोकन कैसे ट्रैक करें?', answerHi: 'Track Booking खोलें और अपना PX टोकन डालें। आपको स्थिति, आपसे आगे के किसान और अनुमानित प्रतीक्षा समय दिखेगा।', answerEn: '' },
        { label: 'कौन से दस्तावेज चाहिए?', answerHi: 'किसान पंजीकरण/पहचान, मान्य ID, बैंक विवरण और बुकिंग टोकन साथ रखें। स्थानीय नियमों के अनुसार अतिरिक्त दस्तावेज मांगे जा सकते हैं।', answerEn: '' },
        { label: 'नया केंद्र कैसे चुनें?', answerHi: 'Farmer Desk → My Profile में State और District बदलें, फिर Preferred Procurement Centre चुनकर Save Changes दबाएं।', answerEn: '' },
        { label: 'प्रोफ़ाइल कैसे बदलें?', answerHi: 'Farmer Desk → My Profile में नाम, मोबाइल, गांव और location बदलकर Save Changes दबाएं।', answerEn: '' },
        { label: 'शिकायत कैसे दर्ज करें?', answerHi: 'Support पेज खोलें और ऑनलाइन grievance ticket दर्ज करें। जरूरत होने पर 1800-180-1551 पर संपर्क करें।', answerEn: '' },
        { label: 'कतार कैसे चलती है?', answerHi: 'Staff टोकन को Waiting → Called/Processing → Completed क्रम में अपडेट करता है।', answerEn: '' },
        { label: 'केंद्र बंद हो तो क्या करें?', answerHi: 'दूसरे उपलब्ध केंद्र/समय की जांच करें या Support से संपर्क करें।', answerEn: '' },
      ]
    : [
        { label: 'How do I book a slot?', answerEn: 'Open Centres & Booking → select State and District → choose a centre → select crop, quantity, date and time → press Confirm & Generate Token.', answerHi: '' },
        { label: 'How do I track my token?', answerEn: 'Open Track Booking and enter your PX token. You will see the status, farmers ahead and estimated waiting time.', answerHi: '' },
        { label: 'What documents are required?', answerEn: 'Carry your farmer registration/identity, valid ID, bank details and booking token. Local rules may require additional documents.', answerHi: '' },
        { label: 'How do I choose a new centre?', answerEn: 'Go to Farmer Desk → My Profile, change State and District, select Preferred Procurement Centre and press Save Changes.', answerHi: '' },
        { label: 'How do I edit my profile?', answerEn: 'Go to Farmer Desk → My Profile, edit your name, mobile, village and location, then press Save Changes.', answerHi: '' },
        { label: 'How do I raise a complaint?', answerEn: 'Open Support and submit an online grievance ticket. You can also contact 1800-180-1551.', answerHi: '' },
        { label: 'How does the queue work?', answerEn: 'Staff move tokens through Waiting → Called/Processing → Completed.', answerHi: '' },
        { label: 'What if my centre is closed?', answerEn: 'Check another available centre/time or contact Support.', answerHi: '' },
      ];

  const welcome = language === 'hi'
    ? 'नमस्ते! मैं किसान सहायक हूँ। नीचे दिए गए सवालों में से चुनें। यह एक जानकारी आधारित static help assistant है।'
    : 'Hello! I am Kisan Sahayak. Choose a question below. This is a static information-based help assistant.';

  useEffect(() => {
    setMessages([{ id: 'welcome', sender: 'assistant', text: welcome, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  }, [language, welcome]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const addAnswer = (question: QuickQuestion) => {
    const text = language === 'hi' ? question.answerHi : question.answerEn;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { id: `q-${Date.now()}`, sender: 'user', text: question.label, time: now }, { id: `a-${Date.now()}`, sender: 'assistant', text, time: now }]);
  };

  const sendTyped = () => {
    const value = input.trim().toLowerCase();
    if (!value) return;
    setInput('');
    const match = questions.find((q) => q.label.toLowerCase().split(' ').some((word) => word.length > 3 && value.includes(word)));
    if (match) addAnswer(match);
    else {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const fallback = language === 'hi'
        ? 'कृपया नीचे दिए गए 8 सवालों में से कोई एक चुनें ताकि आपको सही जानकारी तुरंत मिल सके।'
        : 'Please choose one of the 8 questions below so I can give you the correct information instantly.';
      setMessages((prev) => [...prev, { id: `q-${Date.now()}`, sender: 'user', text: input, time: now }, { id: `a-${Date.now()}`, sender: 'assistant', text: fallback, time: now }]);
    }
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(text); u.lang = language === 'hi' ? 'hi-IN' : 'en-IN'; u.onend = () => setSpeaking(false); setSpeaking(true); window.speechSynthesis.speak(u);
  };

  return <>
    <button type="button" onClick={() => setOpen((v) => !v)} className="fixed bottom-5 right-5 z-40 bg-emerald-800 text-white px-4 py-3 rounded-full shadow-2xl border-2 border-amber-400 flex items-center gap-2 font-bold text-xs">
      <MessageCircle className="w-5 h-5 text-amber-300" /> Kisan Sahayak <span className="w-2 h-2 rounded-full bg-amber-300" />
    </button>

    {open && <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[600px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
      <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-full bg-emerald-700 border border-amber-400 flex items-center justify-center"><Bot className="w-5 h-5 text-amber-300" /></div><div><b className="block font-serif">Kisan Sahayak</b><span className="text-[10px] text-emerald-200">Static Help • No external AI</span></div></div>
        <button type="button" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto bg-stone-50 p-3 space-y-3">
        {messages.map((m) => <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[84%] rounded-2xl px-3 py-2.5 text-xs ${m.sender === 'user' ? 'bg-emerald-700 text-white' : 'bg-white border border-stone-200 text-stone-800'}`}><p className="whitespace-pre-line">{m.text}</p><div className="flex items-center justify-between gap-3 mt-1 text-[9px] opacity-60"><span>{m.time}</span>{m.sender === 'assistant' && <button type="button" onClick={() => speak(m.text)} title="Listen"><Volume2 className="w-3 h-3" /></button>}</div></div></div>)}
        <div ref={endRef} />
      </div>
      <div className="p-2 border-t bg-white flex gap-1.5 overflow-x-auto">
        {questions.map((q) => <button key={q.label} type="button" onClick={() => addAnswer(q)} className="shrink-0 px-2.5 py-1.5 rounded-full border bg-stone-50 hover:bg-emerald-50 text-[10px] font-semibold">{q.label}</button>)}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); sendTyped(); }} className="p-3 border-t bg-white flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={language === 'hi' ? 'सवाल लिखें...' : 'Type a question...'} className="flex-1 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-700/20" />
        <button type="submit" className="bg-emerald-800 text-white p-2.5 rounded-xl"><Send className="w-4 h-4" /></button>
      </form>
      {speaking && <button type="button" onClick={() => speak('')} className="absolute top-4 right-12 text-amber-300"><VolumeX className="w-4 h-4" /></button>}
    </div>}
  </>;
};
