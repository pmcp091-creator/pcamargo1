import React, { useState, useEffect } from 'react';
import { 
  TrainingSession, 
  Municipality, 
  TargetAudience, 
  TrainingType, 
  Modality, 
  ScheduleStatus, 
  Frequency,
  InstitutionProfile
} from '../types/schedule';
import { X, Save, AlertTriangle, Clock, MapPin, Building2, BookOpen, Plus, Check, Calendar, Trash2 } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: TrainingSession, newInstitution?: InstitutionProfile) => void;
  onDelete?: (id: string) => void;
  editingSession: TrainingSession | null;
  institutions: InstitutionProfile[];
  allSessions: TrainingSession[];
  initialDate?: string;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const DEFAULT_TRAINING_TYPES: string[] = [
  'Competencias Técnicas',
  'Habilidades Blandas',
  'Formación Docente',
  'Microlearning',
  'Transición Energética',
  'Inducción / Sensibilización'
];

const DEFAULT_SHIFTS: string[] = [
  'Mañana (6:00 a.m. - 12:00 m.)',
  'Vespertina (12:00 m. - 6:00 p.m.)',
  'Jornada Única (7:00 a.m. - 3:00 p.m.)',
  'Sabatina (7:00 a.m. - 4:00 p.m.)',
  'Contrajornada (1:00 p.m. - 5:00 p.m.)'
];

const DEFAULT_GRADES: string[] = [
  'Grado 9° (Competencias Técnicas)',
  'Grado 10° (Habilidades Blandas)',
  'Grado 11° (Habilidades Blandas)',
  'Ciclo 4 (Sabatino - Competencias Técnicas)',
  'Ciclo 6 (Sabatino - Habilidades Blandas)',
  'Docentes (Cuerpo Pedagógico)'
];

// Helpers de conversión de hora (12h <-> 24h para picker de celular)
const convertTo24Hour = (timeStr: string = ''): string => {
  if (!timeStr) return '07:00';
  const clean = timeStr.trim();
  if (!clean.toUpperCase().includes('AM') && !clean.toUpperCase().includes('PM')) {
    return clean.slice(0, 5);
  }
  const isPM = clean.toUpperCase().includes('PM');
  const numbersOnly = clean.toUpperCase().replace('AM', '').replace('PM', '').trim();
  const parts = numbersOnly.split(':');
  if (parts.length !== 2) return '07:00';
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].padStart(2, '0');
  if (isPM && hours < 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

const convertTo12Hour = (time24: string = ''): string => {
  if (!time24) return '07:00 AM';
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingSession,
  institutions,
  allSessions,
  initialDate
}) => {
  const [formData, setFormData] = useState<Partial<TrainingSession>>({
    municipality: 'Uribia',
    institution: '',
    campus: '',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: '',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Martes'],
    specificDate: '',
    startTime: '07:00 AM',
    endTime: '11:00 AM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grado 9° (Competencias Técnicas)',
    observations: '',
    infrastructureNotes: ''
  });

  // Toggles e inputs para opciones personalizadas
  const [isCustomInst, setIsCustomInst] = useState(false);
  const [customInstName, setCustomInstName] = useState('');

  const [isCustomActivity, setIsCustomActivity] = useState(false);
  const [customActivityName, setCustomActivityName] = useState('');

  const [shiftOptions, setShiftOptions] = useState<string[]>(DEFAULT_SHIFTS);
  const [isCustomShift, setIsCustomShift] = useState(false);
  const [customShiftName, setCustomShiftName] = useState('');

  const [gradeOptions, setGradeOptions] = useState<string[]>(DEFAULT_GRADES);
  const [isCustomGrade, setIsCustomGrade] = useState(false);
  const [customGradeName, setCustomGradeName] = useState('');

  useEffect(() => {
    if (editingSession) {
      setFormData({ 
        ...editingSession,
        specificDate: editingSession.specificDate || editingSession.date || '',
        topic: editingSession.topic || editingSession.trainingType || ''
      });
      
      const instExists = institutions.some(i => i.name.toLowerCase() === (editingSession.institution || '').toLowerCase());
      if (editingSession.institution && !instExists) {
        setIsCustomInst(true);
        setCustomInstName(editingSession.institution);
      } else {
        setIsCustomInst(false);
        setCustomInstName('');
      }

      if (!DEFAULT_TRAINING_TYPES.includes(editingSession.trainingType)) {
        setIsCustomActivity(true);
        setCustomActivityName(editingSession.trainingType);
      } else {
        setIsCustomActivity(false);
        setCustomActivityName('');
      }

      if (editingSession.academicShift && !DEFAULT_SHIFTS.includes(editingSession.academicShift)) {
        setShiftOptions(prev => [...new Set([...prev, editingSession.academicShift!])]);
      }

      if (editingSession.gradeOrCycle && !DEFAULT_GRADES.includes(editingSession.gradeOrCycle)) {
        setGradeOptions(prev => [...new Set([...prev, editingSession.gradeOrCycle!])]);
      }
    } else {
      const targetDate = initialDate || '2026-09-15';
      let derivedDay = 'Martes';
      if (targetDate) {
        const parts = targetDate.split('-');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          const mapDay = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          derivedDay = mapDay[d.getDay()] || 'Martes';
        }
      }

      setFormData({
        id: `sess-${Date.now()}`,
        itemNumber: allSessions.length + 1,
        specificDate: targetDate,
        municipality: 'Uribia',
        institution: institutions[0]?.name || 'Media Luna Jawou - Sede Petsuapa',
        campus: institutions[0]?.campuses?.[0] || 'Sede Petsuapa',
        academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
        targetAudience: 'Estudiantes',
        trainingType: 'Competencias Técnicas',
        modality: 'Presencial',
        status: 'APROBADO',
        daysOfWeek: [derivedDay],
        datesScheduled: {
          september: targetDate ? [targetDate] : ['2026-09-15'],
          october: [],
          november: []
        },
        startTime: '07:00 AM',
        endTime: '11:00 AM',
        durationHours: 4.0,
        frequency: 'Quincenal',
        responsible: 'The Biz Nation',
        gradeOrCycle: 'Grado 9° (Competencias Técnicas)',
        observations: 'Sesión concertada en cronograma general.',
        infrastructureNotes: ''
      });
      setIsCustomInst(false);
      setCustomInstName('');
      setIsCustomActivity(false);
      setCustomActivityName('');
    }
  }, [editingSession, isOpen, allSessions.length, initialDate, institutions]);

  if (!isOpen) return null;

  const availableInstitutions = institutions.filter(
    i => i.municipality === formData.municipality
  );

  const handleMunicipalityChange = (mun: Municipality) => {
    const insts = institutions.filter(i => i.municipality === mun);
    const defaultInst = insts[0]?.name || '';
    const defaultCampus = insts[0]?.campuses?.[0] || '';
    const defaultShift = insts[0]?.shifts?.[0] || 'Mañana (6:00 a.m. - 12:00 m.)';
    const notes = insts[0]?.infrastructure?.generalConditions || '';

    setFormData({
      ...formData,
      municipality: mun,
      institution: defaultInst,
      campus: defaultCampus,
      academicShift: defaultShift,
      infrastructureNotes: notes
    });
    setIsCustomInst(false);
    setCustomInstName('');
  };

  const handleInstitutionChange = (instName: string) => {
    const found = institutions.find(i => i.name === instName);
    setFormData({
      ...formData,
      institution: instName,
      campus: found?.campuses?.[0] || instName,
      academicShift: found?.shifts?.[0] || formData.academicShift,
      infrastructureNotes: found?.infrastructure?.generalConditions || ''
    });
  };

  const handleDateChange = (dateVal: string) => {
    let newDayOfWeek = formData.daysOfWeek;
    if (dateVal) {
      const parts = dateVal.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const mapDay = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const matched = mapDay[d.getDay()];
        if (matched) newDayOfWeek = [matched];
      }
    }
    setFormData({
      ...formData,
      specificDate: dateVal,
      daysOfWeek: newDayOfWeek
    });
  };

  // Manejo de Horas Interactivas con recálculo automático de duración
  const handleStartTimeChange = (val24: string) => {
    const formatted12 = convertTo12Hour(val24);
    const end24 = convertTo24Hour(formData.endTime);
    let diff = formData.durationHours || 4.0;

    const [startH, startM] = val24.split(':').map(Number);
    const [endH, endM] = end24.split(':').map(Number);
    if (!isNaN(startH) && !isNaN(endH)) {
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      if (endMin > startMin) {
        diff = Math.round(((endMin - startMin) / 60) * 10) / 10;
      }
    }

    setFormData({
      ...formData,
      startTime: formatted12,
      durationHours: diff
    });
  };

  const handleEndTimeChange = (val24: string) => {
    const formatted12 = convertTo12Hour(val24);
    const start24 = convertTo24Hour(formData.startTime);
    let diff = formData.durationHours || 4.0;

    const [startH, startM] = start24.split(':').map(Number);
    const [endH, endM] = val24.split(':').map(Number);
    if (!isNaN(startH) && !isNaN(endH)) {
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      if (endMin > startMin) {
        diff = Math.round(((endMin - startMin) / 60) * 10) / 10;
      }
    }

    setFormData({
      ...formData,
      endTime: formatted12,
      durationHours: diff
    });
  };

  const handleAddCustomShift = () => {
    if (customShiftName.trim()) {
      const trimmed = customShiftName.trim();
      setShiftOptions(prev => [...new Set([...prev, trimmed])]);
      setFormData({ ...formData, academicShift: trimmed });
      setCustomShiftName('');
      setIsCustomShift(false);
    }
  };

  const handleAddCustomGrade = () => {
    if (customGradeName.trim()) {
      const trimmed = customGradeName.trim();
      setGradeOptions(prev => [...new Set([...prev, trimmed])]);
      setFormData({ ...formData, gradeOrCycle: trimmed });
      setCustomGradeName('');
      setIsCustomGrade(false);
    }
  };

  const toggleDay = (day: string) => {
    const current = formData.daysOfWeek || [];
    if (current.includes(day)) {
      if (current.length > 1) {
        setFormData({ ...formData, daysOfWeek: current.filter(d => d !== day) });
      }
    } else {
      setFormData({ ...formData, daysOfWeek: [...current, day] });
    }
  };

  // Comprobación de conflictos en Uribia
  const checkConflicts = () => {
    if (formData.municipality !== 'Uribia' || formData.modality !== 'Presencial' || formData.status === 'PDTE') {
      return null;
    }

    if (formData.specificDate) {
      const existingOnDate = allSessions.filter(
        s =>
          s.id !== formData.id &&
          s.municipality === 'Uribia' &&
          s.modality === 'Presencial' &&
          s.status !== 'PDTE' &&
          s.specificDate === formData.specificDate
      );
      const uniqueInstsOnDate = new Set(existingOnDate.map(s => s.institution));
      const chosenInst = isCustomInst ? customInstName : formData.institution;
      if (chosenInst && !uniqueInstsOnDate.has(chosenInst)) {
        uniqueInstsOnDate.add(chosenInst);
      }
      if (uniqueInstsOnDate.size > 2) {
        return `⚠️ Alerta de Capacidad en Uribia: Ya hay ${uniqueInstsOnDate.size} instituciones presenciales para el ${formData.specificDate}. La regla concertada limita a máximo 2 sedes por día.`;
      }
    }
    return null;
  };

  const conflictWarning = checkConflicts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalInstName = isCustomInst ? customInstName.trim() : (formData.institution || '').trim();
    if (!finalInstName) {
      alert('Por favor especifica la institución.');
      return;
    }

    const finalActivity = isCustomActivity ? customActivityName.trim() : (formData.trainingType || '').trim();
    if (!finalActivity) {
      alert('Por favor especifica el tipo de formación.');
      return;
    }

    let newInstProfile: InstitutionProfile | undefined;
    if (isCustomInst) {
      newInstProfile = {
        id: `inst-custom-${Date.now()}`,
        name: finalInstName,
        shortName: finalInstName.length > 25 ? finalInstName.substring(0, 22) + '...' : finalInstName,
        municipality: formData.municipality as Municipality,
        campuses: [formData.campus || finalInstName],
        shifts: [formData.academicShift || 'Mañana (6:00 a.m. - 12:00 m.)'],
        infrastructure: {
          hasPower: true,
          hasInternet: true,
          hasScreensOrProjectors: true,
          hasComputersOrTablets: true,
          capacity: '30 personas',
          generalConditions: formData.infrastructureNotes || 'Nueva institución añadida.'
        },
        specialAlerts: []
      };
    }

    const fullSession: TrainingSession = {
      id: formData.id || `sess-${Date.now()}`,
      itemNumber: formData.itemNumber || allSessions.length + 1,
      specificDate: formData.specificDate || undefined,
      date: formData.specificDate || formData.date,
      specificDates: formData.specificDates,
      municipality: formData.municipality as Municipality,
      institution: finalInstName,
      campus: formData.campus || finalInstName,
      academicShift: formData.academicShift || 'Mañana',
      targetAudience: formData.targetAudience as TargetAudience,
      targetPopulation: formData.targetPopulation || (formData.targetAudience as string),
      trainingType: finalActivity,
      topic: formData.topic || finalActivity,
      modality: formData.modality as Modality,
      status: formData.status as ScheduleStatus,
      daysOfWeek: formData.daysOfWeek || ['Martes'],
      datesScheduled: formData.datesScheduled || {
        september: formData.specificDate ? [formData.specificDate] : ['Por definir'],
        october: [],
        november: [],
        december: []
      },
      startTime: formData.startTime || '07:00 AM',
      endTime: formData.endTime || '11:00 AM',
      durationHours: Number(formData.durationHours) || 4.0,
      frequency: formData.frequency as Frequency,
      responsible: formData.responsible || 'The Biz Nation',
      gradeOrCycle: formData.gradeOrCycle || 'Grado 9°',
      observations: formData.observations || '',
      infrastructureNotes: formData.infrastructureNotes || '',
      lastUpdated: new Date().toISOString()
    };

    onSave(fullSession, newInstProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-6 border border-slate-200">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 rounded-lg text-slate-950">
              <Clock className="w-5 h-5 font-black" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold">
                {editingSession ? 'Modificar Sesión de Formación' : 'Programar Sesión de Formación'}
              </h3>
              <p className="text-xs text-slate-300">Vocación que Transforma • La Guajira</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {conflictWarning && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>{conflictWarning}</div>
            </div>
          )}

          {/* Fecha y Municipio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fecha Específica en Calendario
              </label>
              <input
                type="date"
                value={formData.specificDate || ''}
                onChange={e => handleDateChange(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Municipio / Territorio *
              </label>
              <select
                value={formData.municipality}
                onChange={e => handleMunicipalityChange(e.target.value as Municipality)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-bold"
              >
                <option value="Uribia">Uribia (Alta Guajira)</option>
                <option value="Riohacha">Riohacha (Distrito)</option>
                <option value="Manaure">Manaure</option>
              </select>
            </div>
          </div>

          {/* Institución */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Institución Educativa *</label>
              <button
                type="button"
                onClick={() => setIsCustomInst(!isCustomInst)}
                className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 hover:underline"
              >
                {isCustomInst ? '← Elegir de la lista' : '+ Añadir institución nueva'}
              </button>
            </div>

            {isCustomInst ? (
              <input
                type="text"
                required
                value={customInstName}
                onChange={e => setCustomInstName(e.target.value)}
                placeholder="Nombre de la nueva institución..."
                className="w-full text-xs p-2.5 bg-white border-2 border-amber-500 rounded-lg focus:outline-none font-bold text-slate-900"
              />
            ) : (
              <select
                value={formData.institution}
                onChange={e => handleInstitutionChange(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold"
              >
                {availableInstitutions.map(inst => (
                  <option key={inst.id} value={inst.name}>{inst.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Sede y Jornada Académica Interactiva */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sede Específica / Lugar</label>
              <input
                type="text"
                value={formData.campus || ''}
                onChange={e => setFormData({ ...formData, campus: e.target.value })}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="Ej: Sede Petsuapa, Sede Sabatino..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Jornada Académica *</label>
                <button
                  type="button"
                  onClick={() => setIsCustomShift(!isCustomShift)}
                  className="text-[10px] font-bold text-amber-600 hover:underline"
                >
                  {isCustomShift ? '← Lista' : '+ Otra'}
                </button>
              </div>

              {isCustomShift ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customShiftName}
                    onChange={e => setCustomShiftName(e.target.value)}
                    placeholder="Ej: Nocturna (6:00 - 10:00)"
                    className="flex-1 text-xs p-2 border border-amber-400 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomShift}
                    className="bg-amber-500 text-slate-950 px-2.5 py-1 text-xs font-bold rounded-lg"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <select
                  value={formData.academicShift}
                  onChange={e => setFormData({ ...formData, academicShift: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  {shiftOptions.map(shift => (
                    <option key={shift} value={shift}>{shift}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Actividad / Tipo de Formación */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Actividad / Formación *</label>
              <button
                type="button"
                onClick={() => setIsCustomActivity(!isCustomActivity)}
                className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 hover:underline"
              >
                {isCustomActivity ? '← Elegir de la lista' : '+ Añadir otra actividad'}
              </button>
            </div>

            {isCustomActivity ? (
              <input
                type="text"
                required
                value={customActivityName}
                onChange={e => setCustomActivityName(e.target.value)}
                placeholder="Nombre de la nueva actividad..."
                className="w-full text-xs p-2.5 bg-white border-2 border-amber-500 rounded-lg focus:outline-none font-bold text-slate-900"
              />
            ) : (
              <select
                value={formData.trainingType}
                onChange={e => setFormData({ ...formData, trainingType: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold"
              >
                {DEFAULT_TRAINING_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            )}
          </div>

          {/* Temática o Contenido Específico de la Sesión */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tema o Contenido de la Sesión
            </label>
            <input
              type="text"
              value={formData.topic || ''}
              onChange={e => setFormData({ ...formData, topic: e.target.value })}
              placeholder="Ej: Competencias Técnicas y Transición Energética..."
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Descripción temática visible en la tabla y tarjeta de detalle
            </span>
          </div>

          {/* Audiencia Objetivo y Grado/Ciclo Extensible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Audiencia Objetivo *</label>
              <select
                value={formData.targetAudience}
                onChange={e => setFormData({ ...formData, targetAudience: e.target.value as TargetAudience })}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold"
              >
                <option value="Estudiantes">Estudiantes</option>
                <option value="Docentes">Docentes</option>
                <option value="Estudiantes y Docentes">Estudiantes y Docentes</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Grado / Ciclo *</label>
                <button
                  type="button"
                  onClick={() => setIsCustomGrade(!isCustomGrade)}
                  className="text-[10px] font-bold text-amber-600 hover:underline"
                >
                  {isCustomGrade ? '← Lista' : '+ Añadir grado'}
                </button>
              </div>

              {isCustomGrade ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customGradeName}
                    onChange={e => setCustomGradeName(e.target.value)}
                    placeholder="Ej. 9-03, 10-01, Grado 8° o Ciclo 5"
                    className="flex-1 text-xs p-2 border border-amber-400 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomGrade}
                    className="bg-amber-500 text-slate-950 px-2.5 py-1 text-xs font-bold rounded-lg"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <select
                  value={formData.gradeOrCycle}
                  onChange={e => setFormData({ ...formData, gradeOrCycle: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  {gradeOptions.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Modalidad, Estado y Frecuencia */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Modalidad *</label>
              <select
                value={formData.modality}
                onChange={e => setFormData({ ...formData, modality: e.target.value as Modality })}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold"
              >
                <option value="Presencial">🏛️ Presencial</option>
                <option value="Virtual">💻 Virtual</option>
                <option value="Microlearning">📱 Microlearning</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estado *</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as ScheduleStatus })}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-bold"
              >
                <option value="APROBADO">APROBADO / Concertado</option>
                <option value="POR CONCERTAR">POR CONCERTAR (Pendiente)</option>
                <option value="ROTATIVO">ROTATIVO</option>
                <option value="CANCELADO">CANCELADO / Receso</option>
                <option value="PDTE">PDTE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Frecuencia</label>
              <select
                value={formData.frequency}
                onChange={e => setFormData({ ...formData, frequency: e.target.value as Frequency })}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="Quincenal">Quincenal (Cada 15 días)</option>
                <option value="Semanal">Semanal</option>
                <option value="3 veces/semana (continuo)">3 veces/semana</option>
                <option value="Por Definir">Por Definir</option>
              </select>
            </div>
          </div>

          {/* Horas Interactivas (Tipo Reloj / Alarma de Celular) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ⏰ Hora Inicio *
              </label>
              <input
                type="time"
                step="900"
                value={convertTo24Hour(formData.startTime)}
                onChange={e => handleStartTimeChange(e.target.value)}
                className="w-full text-sm font-black p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-xs"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Formato: {formData.startTime}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ⏰ Hora Fin *
              </label>
              <input
                type="time"
                step="900"
                value={convertTo24Hour(formData.endTime)}
                onChange={e => handleEndTimeChange(e.target.value)}
                className="w-full text-sm font-black p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-xs"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Formato: {formData.endTime}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Duración (Horas)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                value={formData.durationHours || 4}
                onChange={e => setFormData({ ...formData, durationHours: parseFloat(e.target.value) || 4 })}
                className="w-full text-sm font-bold p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Cálculo automático</span>
            </div>
          </div>

          {/* Días de la semana */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Día(s) de la Semana
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map(day => {
                const isSelected = formData.daysOfWeek?.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Condiciones e Infraestructura */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Condiciones Técnicas</label>
              <input
                type="text"
                value={formData.infrastructureNotes || ''}
                onChange={e => setFormData({ ...formData, infrastructureNotes: e.target.value })}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="Ej. Sin energía fija, paneles solares, pantalla..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Observaciones</label>
              <input
                type="text"
                value={formData.observations || ''}
                onChange={e => setFormData({ ...formData, observations: e.target.value })}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="Ej. Material impreso requerido..."
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 mt-4">
            {editingSession && onDelete ? (
              <button
                type="button"
                id="btn-delete-from-modal"
                onClick={() => {
                  onClose();
                  onDelete(editingSession.id);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition cursor-pointer"
                title="Eliminar esta sesión del cronograma"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Sesión</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-cancel-modal"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                id="btn-save-session-modal"
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{editingSession ? 'Guardar Modificaciones' : 'Guardar en Cronograma'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};