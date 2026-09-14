import React from 'react';
import { X, CheckCircle2, WifiOff, Printer, Sparkles, Building2, ShieldCheck, Heart } from 'lucide-react';

interface PedroGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PedroGuideModal: React.FC<PedroGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-6 border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-lg">
              <Heart className="w-5 h-5 text-pink-300 fill-pink-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold">
                Guía de Entrega: Pedro para Andrés Fernández (The Biz Nation)
              </h3>
              <p className="text-xs text-blue-200">
                PWA de Gestión del Cronograma de Formaciones • Vocación que Transforma
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700 leading-relaxed">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 font-medium">
            <p>
              <strong>¡Hola Andrés!</strong> Sé lo apretados que son tus tiempos coordinando las instituciones educativas, los facilitadores y las reuniones de directivos. Como ingeniero de sistemas de tu equipo, diseñé esta herramienta pensando exclusivamente en hacerte la vida fácil, rápida y libre de estrés.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              ¿Qué puedes hacer con esta aplicación?
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <WifiOff className="w-4 h-4 text-emerald-600" />
                  Funciona 100% Sin Internet (Offline)
                </div>
                <p className="text-[11px] text-slate-600">
                  Cuando viajes a Uribia, Mayapo o zonas rurales sin señal, la app sigue abriendo, guardando cambios y funcionando en tu celular o portátil.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Espacios Listos para Uribia
                </div>
                <p className="text-[11px] text-slate-600">
                  Dejé guardados los espacios en estado <strong>PDTE</strong> para <em>Jaipa</em> y <em>Yotojoroin</em>. Con el botón <strong>&quot;Asignar Instituciones Pendientes&quot;</strong> las acomodas en 2 clics tras tus llamadas del fin de semana.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Validador de la Regla de Oro
                </div>
                <p className="text-[11px] text-slate-600">
                  El sistema vigila que nunca programes más de 2 instituciones presenciales el mismo día en Uribia. Si hay un cruce, te avisa en rojo de inmediato.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Printer className="w-4 h-4 text-slate-800" />
                  Imprimir y Exportar a Excel
                </div>
                <p className="text-[11px] text-slate-600">
                  Con un solo clic puedes imprimir el cronograma con membrete oficial (Logo 1 y Logo 2) o descargarlo en Excel compatible con tildes para enviarlo a los directivos.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
            <div className="font-bold">Recordatorios Logísticos Clave de la Matriz:</div>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              <li><strong>Guarerapu #3:</strong> El container no tiene energía eléctrica; recordar al facilitador llevar baterías de respaldo. Pausa del 13 al 26 de octubre por semanas culturales.</li>
              <li><strong>Walakaly #2:</strong> Encuentro Étnico 17 y 18 de septiembre (días no lectivos).</li>
              <li><strong>Chonkay:</strong> Intervenciones formativas articuladas a las horas de Ética y Competencias Ciudadanas.</li>
              <li><strong>Denzil Sabatinos:</strong> Jornada de fines de semana para ciclos 4 y 6 en condición de vulnerabilidad; llevar material impreso.</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
            >
              ¡Entendido, vamos a trabajar!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
