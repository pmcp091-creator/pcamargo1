import React from 'react';
import { SessionsTableView, SessionsTableViewProps } from './SessionsTableView';
import { TableView, TableViewProps } from './TableView';

export type OfficialMatrixViewProps = SessionsTableViewProps;

export const OfficialMatrixView: React.FC<OfficialMatrixViewProps> = (props) => {
  return <SessionsTableView {...props} />;
};

export { SessionsTableView, TableView };
export default OfficialMatrixView;
