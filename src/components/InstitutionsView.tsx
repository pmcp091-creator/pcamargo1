import React, { useState } from 'react';
import { InstitutionProfile } from '../types/schedule';
import { copyToClipboard } from '../utils/clipboard';
import { 
  Building2, Edit2, Trash2, Plus, AlertTriangle, Info, Check, 
  Copy, Zap, Wifi, WifiOff, Tv, Monitor, Search, Sparkles, MapPin, 
  BatteryCharging, Clock, Users, X
} from 'lucide-react';

interface Props {
  institutions: InstitutionProfile[];
  isAdmin: boolean;
  onUpdateInstitution: (updated: InstitutionProfile) => void;
  onDeleteInstitution: (id: string) => void;
  onAddInstitution?: (newInst: InstitutionProfile) => void;
  onSelectInstitutionForFilter?: (name: string) => void;
}

export const InstitutionsView: React.FC<Props> = ({
  institutions,
  isAdmin,
  onUpdateInstitution,
  onDeleteInstitution,
  onAddInstitution,
  onSelectInstitutionForFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('Todos');
  const [editingInst, setEditingInst] = useState<InstitutionProfile | null>(null);
  const [deletingInst, setDeletingInst] = useState<InstitutionProfile | null>(null);
  const [copiedDane, setCopiedDane] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Nuevo formulario de institución
  const [newInstForm, setNewInstForm] = useState<Partial<InstitutionProfile>>({
    name: '',
    shortName: '',
    municipality: 'Uribia',
    daneCode: '',
    campuses: ['Sede Principal'],
    shifts: ['Mañana (6:00 a.m. - 12:00 m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: true,
      hasScreensOrProjectors: true,
      hasComputersOrTablets: true,
      capacity: '35 personas',
      generalConditions: ''
    },
    specialAlerts: []
  });

  const handleCopyLink = async (daneCode: string) => {
    const directUrl = `${window.location.origin}${window.location.pathname}?inst=${encodeURIComponent(daneCode)}`;
    const success = await copyToClipboard(directUrl);
    if (success) {
      setCopiedDane(daneCode);
      setTimeout(() => {
        setCopiedDane(null);
      }, 2500);
    }
  };

  // Filtrado
  const filteredInstitutions = institutions.filter(inst => {
    const matchesMuni = selectedMunicipality === 'Todos' || inst.municipality === selectedMunicipality;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesMuni;
    const matchesText = 
      (inst.name || '').toLowerCase().includes(q) ||
      (inst.shortName || '').toLowerCase().includes(q) ||
      (inst.daneCode || '').toLowerCase().includes(q) ||
      (inst.campuses || []).some(c => c.toLowerCase().includes(q)) ||
      (inst.infrastructure?.generalConditions || '').toLowerCase().includes(q);
    return matchesMuni && matchesText;
  });

  // Guardar edición
  const handleSaveEdit = () => {
    if (editingInst) {
      onUpdateInstitution(editingInst);
      setEditingInst(null);
    }
  };

  // Guardar nueva
  const handleCreateNew = () => {
    if (!newInstForm.name) return;
    const id = `inst-${(newInstForm.municipality || 'uribia').toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const complete: InstitutionProfile = {
      id,
      name: newInstForm.name,
      shortName: newInstForm.shortName || newInstForm.name,
      municipality: (newInstForm.municipality as any) || 'Uribia',
      daneCode: newInstForm.daneCode || `DANE-${Date.now().toString().slice(-6)}`,
      campuses: newInstForm.campuses || ['Sede Principal'],
      shifts: newInstForm.shifts || ['Mañana'],
      infrastructure: newInstForm.infrastructure || {
        hasPower: true,
        hasInternet: false,
        hasScreensOrProjectors: false,
        hasComputersOrTablets: false,
        capacity: '30 personas',
        generalConditions: ''
      },
      specialAlerts: newInstForm.specialAlerts || []
    };
    if (onAddInstitution) {
      onAddInstitution(complete);
    }
    setShowAddModal(false);
  };

  const getMuniBadgeClass = (muni: string) => {
    switch (muni) {
      case 'Manaure':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Riohacha':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      case 'Uribia':
      default:
        return 'bg-amber-100 text-amber-950 border-amber-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo con Buscador y Filtro */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Instituciones & Logística de Terreno
              </h2>
              <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                {institutions.length} Sedes Oficiales
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Fichas técnicas de conectividad, suministro eléctrico, capacidad y condiciones operativas por cada sede en La Guajira. 
              Copie los enlaces directos para rectores y directivos docentes.
            </p>
          </div>

          {isAdmin && onAddInstitution && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" /> Agregar Sede Educativa
            </button>
          )}
        </div>

        {/* Filtros rápidos */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Municipios */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1 uppercase tracking-wider">Municipio:</span>
            {['Todos', 'Manaure', 'Riohacha', 'Uribia'].map(muni => {
              const count = muni === 'Todos' 
                ? institutions.length 
                : institutions.filter(i => i.municipality === muni).length;
              const isSelected = selectedMunicipality === muni;
              return (
                <button
                  key={muni}
                  onClick={() => setSelectedMunicipality(muni)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isSelected 
                      ? 'bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {muni} <span className="text-[10px] opacity-75 font-normal">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Buscador */}
          <div className="relative sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por colegio, DANE o sede..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-amber-400 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grilla Oficial de las 12 Instituciones Educativas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredInstitutions.map(inst => {
          const infra = inst.infrastructure || {
            hasPower: true,
            hasInternet: false,
            hasScreensOrProjectors: false,
            hasComputersOrTablets: false,
            capacity: '30 personas',
            generalConditions: ''
          };

          const isGuarerapu = inst.id.includes('guarerapu') || inst.name.toLowerCase().includes('guarerapu');
          const isChonKay = inst.name.toLowerCase().includes('chon-kay');
          const isDenzilSabatino = inst.name.toLowerCase().includes('sabatino');
          const isApaimana = inst.name.toLowerCase().includes('apaimana');
          const isWalakaly = inst.name.toLowerCase().includes('walakaly');
          const isJaipa = inst.name.toLowerCase().includes('jaipa');
          const isYotojoroin = inst.name.toLowerCase().includes('yotojoroin');

          const alerts = inst.specialAlerts || [];

          return (
            <div 
              key={inst.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              {/* Header de la Tarjeta */}
              <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800 bg-linear-to-b from-slate-50/50 dark:from-slate-800/40 to-white dark:to-slate-900">
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Badge Municipio */}
                    <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-md border ${getMuniBadgeClass(inst.municipality)}`}>
                      {inst.municipality}
                    </span>

                    {/* Badge DANE */}
                    <span className="text-[10px] font-mono font-bold bg-slate-900 dark:bg-slate-800 text-amber-400 px-2 py-0.5 rounded-md shadow-xs border border-transparent dark:border-slate-700">
                      DANE: {inst.daneCode || 'Sin DANE'}
                    </span>
                  </div>

                  {/* Acciones de Edición (Exclusivo Coordinador) */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingInst(inst)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Editar ficha institucional"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingInst(inst)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                        title="Eliminar institución"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Nombre de la Institución */}
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug tracking-tight">
                  {inst.name}
                </h3>

                {/* Sede y Jornada */}
                <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="truncate font-medium">
                      {inst.campuses && inst.campuses.length > 0 ? inst.campuses.join(', ') : 'Sede Principal'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="truncate text-slate-600 dark:text-slate-300">
                      {inst.shifts && inst.shifts.length > 0 ? inst.shifts[0] : 'Jornada Ordinaria'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cuerpo de la Tarjeta: Infraestructura y Condiciones */}
              <div className="p-5 space-y-4 grow">
                {/* Grilla de 4 Badges de Infraestructura Técnica */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                    Infraestructura Técnica
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* 1. Energía */}
                    {isGuarerapu || !infra.hasPower ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <BatteryCharging className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span className="truncate text-[11px]">🚫 Sin Energía (Cargar!)</span>
                      </div>
                    ) : infra.hasSolarPanels ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="truncate text-[11px]">☀️ Paneles Solares</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate text-[11px]">⚡ Energía Red</span>
                      </div>
                    )}

                    {/* 2. Internet */}
                    {infra.hasInternet ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate text-[11px]">🌐 Internet OK</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <WifiOff className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                        <span className="truncate text-[11px]">🌐 Sin Internet / Baja</span>
                      </div>
                    )}

                    {/* 3. Proyección */}
                    {infra.hasScreensOrProjectors ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <Tv className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="truncate text-[11px]">📺 Pantalla/TV</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <Tv className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="truncate text-[11px]">🚫 Sin Pantalla</span>
                      </div>
                    )}

                    {/* 4. Equipamiento */}
                    {infra.hasComputersOrTablets ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <Monitor className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="truncate text-[11px]">💻 Sala Digital</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <Monitor className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="truncate text-[11px]">💻 Sin Equipos</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Capacidad y Notas de Terreno */}
                <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">Capacidad:</strong> {infra.capacity || 'Estándar de aula'}
                    </div>
                  </div>
                  {infra.generalConditions && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      {infra.generalConditions}
                    </div>
                  )}
                </div>

                {/* Tarjetas de Alertas Condicionales Resaltadas */}
                {alerts.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {alerts.map((alert, aIdx) => {
                      const isCrit = alert.level === 'critical' || isGuarerapu;
                      const isWarn = alert.level === 'warning' || (!isCrit && alert.level !== 'info');
                      return (
                        <div 
                          key={aIdx}
                          className={`p-3 rounded-xl border text-xs leading-relaxed ${
                            isCrit 
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-950 dark:text-rose-200'
                              : isWarn
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200'
                              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-950 dark:text-blue-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold mb-1">
                            <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isCrit ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`} />
                            <span className="text-[11px]">⚠️ {alert.title}</span>
                          </div>
                          {alert.dates && (
                            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                              📅 {alert.dates}
                            </div>
                          )}
                          <p className="text-[11px] opacity-90">
                            {alert.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pie de Tarjeta: Botón Copiar Link Consulta */}
              <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850/40">
                <button
                  type="button"
                  onClick={() => handleCopyLink(inst.daneCode || inst.id)}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer ${
                    copiedDane === (inst.daneCode || inst.id)
                      ? 'bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none'
                      : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                  }`}
                  title="Copiar enlace directo para rectores y directivos docentes"
                >
                  {copiedDane === (inst.daneCode || inst.id) ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>¡Enlace Copiado al Portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>📋 Copiar Link de Consulta</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Editar Institución (Solo Coordinador) */}
      {editingInst && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Editar Ficha Institucional</h3>
              <button 
                onClick={() => setEditingInst(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Nombre Oficial</label>
                <input
                  type="text"
                  value={editingInst.name}
                  onChange={e => setEditingInst({ ...editingInst, name: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Código DANE</label>
                  <input
                    type="text"
                    value={editingInst.daneCode || ''}
                    onChange={e => setEditingInst({ ...editingInst, daneCode: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Municipio</label>
                  <select
                    value={editingInst.municipality}
                    onChange={e => setEditingInst({ ...editingInst, municipality: e.target.value as any })}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Uribia">Uribia</option>
                    <option value="Riohacha">Riohacha</option>
                    <option value="Manaure">Manaure</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Capacidad Estimada</label>
                <input
                  type="text"
                  value={editingInst.infrastructure?.capacity || ''}
                  onChange={e => setEditingInst({
                    ...editingInst,
                    infrastructure: { ...editingInst.infrastructure, capacity: e.target.value }
                  })}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                  placeholder="Ej. 35 personas por aula"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Condiciones Logísticas y Técnicas</label>
                <textarea
                  value={editingInst.infrastructure?.generalConditions || ''}
                  onChange={e => setEditingInst({
                    ...editingInst,
                    infrastructure: { ...editingInst.infrastructure, generalConditions: e.target.value }
                  })}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-xl text-xs text-slate-900 dark:text-white h-24 focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              {/* Switches de Infraestructura */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Equipamiento y Servicios</label>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingInst.infrastructure?.hasPower || false}
                      onChange={e => setEditingInst({
                        ...editingInst,
                        infrastructure: { ...editingInst.infrastructure, hasPower: e.target.checked }
                      })}
                      className="accent-amber-500 rounded"
                    />
                    <span>Energía de Red</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingInst.infrastructure?.hasInternet || false}
                      onChange={e => setEditingInst({
                        ...editingInst,
                        infrastructure: { ...editingInst.infrastructure, hasInternet: e.target.checked }
                      })}
                      className="accent-amber-500 rounded"
                    />
                    <span>Internet Funcional</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingInst.infrastructure?.hasScreensOrProjectors || false}
                      onChange={e => setEditingInst({
                        ...editingInst,
                        infrastructure: { ...editingInst.infrastructure, hasScreensOrProjectors: e.target.checked }
                      })}
                      className="accent-amber-500 rounded"
                    />
                    <span>Pantalla / Proyector</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingInst.infrastructure?.hasComputersOrTablets || false}
                      onChange={e => setEditingInst({
                        ...editingInst,
                        infrastructure: { ...editingInst.infrastructure, hasComputersOrTablets: e.target.checked }
                      })}
                      className="accent-amber-500 rounded"
                    />
                    <span>Computadores / Tablets</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setEditingInst(null)} 
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveEdit} 
                className="px-4 py-2 text-xs bg-amber-400 hover:bg-amber-500 font-bold rounded-xl text-slate-950 shadow-xs"
              >
                Guardar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {deletingInst && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 bg-rose-100 dark:bg-rose-950/60 rounded-xl">
                <AlertTriangle className="w-6 h-6 shrink-0" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">¿Estás seguro?</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Confirmación de eliminación</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ¿Estás seguro de que deseas eliminar la institución <strong>"{deletingInst.name}"</strong>? 
              Esta acción no se puede deshacer y desvinculará sus actividades en el cronograma general.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button 
                id="btn-cancel-delete-inst"
                onClick={() => setDeletingInst(null)} 
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                id="btn-confirm-delete-inst"
                onClick={() => {
                  onDeleteInstitution(deletingInst.id);
                  setDeletingInst(null);
                }} 
                className="px-3.5 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Institución (Coordinador) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Nueva Sede Educativa</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={newInstForm.name}
                  onChange={e => setNewInstForm({ ...newInstForm, name: e.target.value })}
                  placeholder="Ej. I.E. Nueva Colombia"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Código DANE</label>
                  <input
                    type="text"
                    value={newInstForm.daneCode}
                    onChange={e => setNewInstForm({ ...newInstForm, daneCode: e.target.value })}
                    placeholder="12 dígitos"
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Municipio</label>
                  <select
                    value={newInstForm.municipality}
                    onChange={e => setNewInstForm({ ...newInstForm, municipality: e.target.value as any })}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Uribia">Uribia</option>
                    <option value="Riohacha">Riohacha</option>
                    <option value="Manaure">Manaure</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Condiciones Generales</label>
                <textarea
                  value={newInstForm.infrastructure?.generalConditions || ''}
                  onChange={e => setNewInstForm({
                    ...newInstForm,
                    infrastructure: { ...newInstForm.infrastructure, generalConditions: e.target.value }
                  })}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-xl h-20 text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                  placeholder="Observaciones de acceso, electricidad, etc."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                Cancelar
              </button>
              <button 
                onClick={handleCreateNew}
                className="px-4 py-2 text-xs bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-xs"
              >
                Crear Institución
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
