import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, MapPin, Search } from 'lucide-react';
import { Centre } from '../types/index';

interface CentrePickerProps {
  centres: Centre[];
  value: string;
  onChange: (centreId: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  helper?: string;
}

export const CentrePicker: React.FC<CentrePickerProps> = ({
  centres,
  value,
  onChange,
  label = 'Procurement Centre',
  placeholder = 'Search centre by name, district or PIN...',
  disabled = false,
  helper,
}) => {
  const safeCentres = Array.isArray(centres) ? centres : [];
  const selected = safeCentres.find((c) => c.id === value) || null;
  const [query, setQuery] = useState(selected?.name || '');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(selected?.name || '');
  }, [selected?.id, selected?.name]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const results = useMemo(() => {
    const q = (selected && query.trim() === selected.name.trim() ? '' : query).trim().toLowerCase();
    const filtered = q
      ? safeCentres.filter((c) =>
          [c.name, c.state, c.district, c.pinCode, c.address].some((v) => String(v || '').toLowerCase().includes(q)),
        )
      : safeCentres;
    return [...filtered].sort((a, b) =>
      a.state.localeCompare(b.state, undefined, { sensitivity: 'base' }) ||
      a.district.localeCompare(b.district, undefined, { sensitivity: 'base' }) ||
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );
  }, [centres, query]);

  const choose = (centre: Centre) => {
    onChange(centre.id);
    setQuery(centre.name);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      {label && <label className="block text-xs font-bold text-stone-700 mb-1">{label}</label>}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400 pointer-events-none" />
        <input
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value) onChange('');
          }}
          onFocus={(e) => { e.currentTarget.select(); setOpen(true); }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2 border border-stone-300 rounded-lg text-xs font-medium bg-white disabled:bg-stone-50 disabled:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
        />
        <ChevronDown className={`absolute right-3 top-2.5 w-4 h-4 text-stone-400 pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && !disabled && (
        <div className="absolute z-[9999] mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-xl">
          {results.length === 0 ? (
            <div className="p-4 text-xs text-stone-500 text-center">No procurement centre found for this search.</div>
          ) : (
            results.map((centre) => (
              <button
                key={centre.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(centre)}
                className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 border-b border-stone-100 last:border-0 flex items-start gap-2"
              >
                <span className="mt-0.5 text-emerald-700"><MapPin className="w-4 h-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-bold text-stone-900 text-xs truncate">{centre.name}</span>
                    {centre.id === value && <Check className="w-4 h-4 text-emerald-700 shrink-0" />}
                  </span>
                  <span className="block text-[11px] text-stone-500 mt-0.5">{centre.district}, {centre.state} • PIN {centre.pinCode}</span>
                  <span className="block text-[10px] text-stone-400 mt-0.5">{centre.address}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {helper && <p className="text-[10px] text-stone-500 mt-1">{helper}</p>}
      {!disabled && safeCentres.length > 0 && <p className="text-[10px] text-stone-400 mt-1">{safeCentres.length} centre{centres.length === 1 ? '' : 's'} available</p>}
    </div>
  );
};
