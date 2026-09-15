import React from 'react';
import { PrintScheduleView, PrintScheduleViewProps } from './PrintScheduleView';
import { TrainingSession, BrandingSettings } from '../types/schedule';

export interface PrintSectionsConfig {
  header: boolean;
  dashboardKpis: boolean;
  territorialCharts: boolean;
  scheduleGrid: boolean;
  signatures: boolean;
}

export interface PrintViewProps {
  sessions: TrainingSession[];
  branding: BrandingSettings;
  onBack: () => void;
  onExportHTML?: () => void;
  onExportExcel?: (selectedInsts?: string[]) => void;
  paperFormat?: 'letter' | 'legal';
  paperOrientation?: 'portrait' | 'landscape';
  sectionsConfig?: PrintSectionsConfig;
  restrictedInstName?: string | null;
  selectedInstitution?: string;
  selectedMunicipality?: string;
  selectedModality?: string;
}

export const PrintView: React.FC<PrintViewProps> = (props) => {
  const mappedSectionsConfig = {
    header: props.sectionsConfig ? props.sectionsConfig.header : true,
    dashboardKpis: props.sectionsConfig ? props.sectionsConfig.dashboardKpis : true,
    alliesLogos: true,
    scheduleGrid: props.sectionsConfig ? props.sectionsConfig.scheduleGrid : true,
    signatureBlock: props.sectionsConfig ? props.sectionsConfig.signatures : true,
    footer: true,
  };

  return (
    <PrintScheduleView
      sessions={props.sessions}
      allSessions={props.sessions}
      branding={props.branding}
      selectedInstitution={props.selectedInstitution || props.restrictedInstName || 'all'}
      selectedMunicipality={props.selectedMunicipality || 'all'}
      selectedModality={props.selectedModality || 'all'}
      onBack={props.onBack}
      onExportHTML={props.onExportHTML}
      onExportExcel={props.onExportExcel}
      paperFormat={props.paperFormat}
      paperOrientation={props.paperOrientation}
      sectionsConfig={mappedSectionsConfig}
      restrictedInstName={props.restrictedInstName}
    />
  );
};

export { PrintScheduleView };
export default PrintView;
