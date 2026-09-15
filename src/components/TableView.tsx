import React from 'react';
import { SessionsTableView, SessionsTableViewProps } from './SessionsTableView';
import { TrainingSession } from '../types/schedule';

export interface TableViewProps {
  sessions: TrainingSession[];
  filteredSessions?: TrainingSession[];
  selectedInstitution?: string;
  setSelectedInstitution?: (inst: string) => void;
  selectedMunicipality?: string;
  setSelectedMunicipality?: (mun: string) => void;
  selectedModality?: string;
  setSelectedModality?: (mod: string) => void;
  selectedAudience?: string;
  setSelectedAudience?: (aud: string) => void;
  setSessions?: React.Dispatch<React.SetStateAction<TrainingSession[]>>;
  onEditSession: (session: TrainingSession) => void;
  onDuplicateSession: (session: TrainingSession) => void;
  onDeleteSession: (id: string) => void;
  onRequestReschedule?: (session: TrainingSession) => void;
  onOpenQuickAssign?: (institutionName?: string) => void;
  onOpenNewSession?: () => void;
  onExportHTML?: () => void;
  onExportExcel?: (selectedInsts?: string[]) => void;
  sessionRole?: 'admin' | 'viewer';
}

export const TableView: React.FC<TableViewProps> = (props) => {
  // Local filter fallback if not passed from parent
  const [localMunicipality, setLocalMunicipality] = React.useState<string>('all');
  const [localInstitution, setLocalInstitution] = React.useState<string>('all');
  const [localModality, setLocalModality] = React.useState<string>('all');
  const [localAudience, setLocalAudience] = React.useState<string>('all');

  const selectedMunicipality = props.selectedMunicipality !== undefined ? props.selectedMunicipality : localMunicipality;
  const setSelectedMunicipality = props.setSelectedMunicipality || setLocalMunicipality;

  const selectedInstitution = props.selectedInstitution !== undefined ? props.selectedInstitution : localInstitution;
  const setSelectedInstitution = props.setSelectedInstitution || setLocalInstitution;

  const selectedModality = props.selectedModality !== undefined ? props.selectedModality : localModality;
  const setSelectedModality = props.setSelectedModality || setLocalModality;

  const selectedAudience = props.selectedAudience !== undefined ? props.selectedAudience : localAudience;
  const setSelectedAudience = props.setSelectedAudience || setLocalAudience;

  const fallbackFilteredSessions = React.useMemo(() => {
    if (props.filteredSessions) return props.filteredSessions;
    return props.sessions.filter(s => {
      const matchInst = selectedInstitution === 'all' || s.institution === selectedInstitution;
      const matchMun = selectedMunicipality === 'all' || s.municipality === selectedMunicipality;
      const matchMod = selectedModality === 'all' || s.modality === selectedModality;
      const matchAud = selectedAudience === 'all' || s.targetAudience === selectedAudience;
      return matchInst && matchMun && matchMod && matchAud;
    });
  }, [props.filteredSessions, props.sessions, selectedInstitution, selectedMunicipality, selectedModality, selectedAudience]);

  return (
    <SessionsTableView
      sessions={props.sessions}
      filteredSessions={props.filteredSessions || fallbackFilteredSessions}
      selectedInstitution={selectedInstitution}
      setSelectedInstitution={setSelectedInstitution}
      selectedMunicipality={selectedMunicipality}
      setSelectedMunicipality={setSelectedMunicipality}
      selectedModality={selectedModality}
      setSelectedModality={setSelectedModality}
      selectedAudience={selectedAudience}
      setSelectedAudience={setSelectedAudience}
      sessionRole={props.sessionRole}
      onEditSession={props.onEditSession}
      onDuplicateSession={props.onDuplicateSession}
      onDeleteSession={props.onDeleteSession}
      onRequestReschedule={props.onRequestReschedule}
      onOpenQuickAssign={props.onOpenQuickAssign ? () => props.onOpenQuickAssign!() : undefined}
      onOpenNewSession={props.onOpenNewSession}
      onExportHTML={props.onExportHTML}
      onExportExcel={props.onExportExcel ? () => props.onExportExcel!() : undefined}
    />
  );
};

export { SessionsTableView };
export default TableView;
