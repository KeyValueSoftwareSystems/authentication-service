import { GridColumns, GridRowId, GridRowParams, GridRowsProp } from "@mui/x-data-grid";
import { DocumentNode } from "graphql";

export interface TableProps {
  rows: GridRowsProp;
  columns: GridColumns;
  buttonLabel: string;
  text: string;
  searchLabel: string;
  deleteMutation: DocumentNode;
  refetchQuery: DocumentNode;
  handleRowClick?: (params: GridRowParams) => void;
  onAdd: () => void;
  onEdit: (id: GridRowId) => void;
}
