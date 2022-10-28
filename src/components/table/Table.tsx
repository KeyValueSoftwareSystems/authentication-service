import { DataGrid, GridActionsCellItem, GridColumns } from "@mui/x-data-grid";
import { FC } from "react";
import { Tooltip } from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useMutation } from "@apollo/client";

import { TableProps } from "./types";
import TableToolBar from "../table-toolbar/TableToolBar";
import "./styles.css";

const TableList: FC<TableProps> = ({
  rows,
  columns,
  text,
  onAdd,
  onEdit,
  buttonLabel,
  searchLabel,
  deleteMutation,
  refetchQuery,
  handleRowClick,
}) => {
  const [deleteItem] = useMutation(deleteMutation, {
    refetchQueries: [{ query: refetchQuery }],
  });

  const action_column: GridColumns = [
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      headerClassName: "table-list-header",
      flex: 0.3,
      cellClassName: "actions",
      headerAlign: "center",
      getActions: ({ id }) => {
        return [
          <Tooltip title="Edit" arrow placement="top">
            <GridActionsCellItem
              icon={
                <EditOutlinedIcon
                  onClick={() => {
                    onEdit(id);
                  }}
                />
              }
              label="Edit"
              className="edit"
              onClick={() => onEdit(id)}
            />
          </Tooltip>,
          <Tooltip title="Delete" arrow placement="top">
            <GridActionsCellItem
              icon={<DeleteOutlinedIcon className="delete" />}
              label="Delete"
              className="delete"
              onClick={() => {
                deleteItem({
                  variables: {
                    id: id,
                  },
                });
              }}
            />
          </Tooltip>,
        ];
      },
    },
  ];

  const final_columns = [...columns, ...action_column];

  return (
    <div className="table-component">
      <div className="table-toolbar" style={{ border: "none" }}>
        <TableToolBar
          text={text}
          buttonLabel={buttonLabel}
          searchLabel={searchLabel}
          onAdd={onAdd}
        />
      </div>
      <div className="table-listing-items">
        <DataGrid
          rows={rows}
          columns={final_columns}
          style={{
            borderRadius: "0px 0px 5px 5px",
          }}
          disableSelectionOnClick
          onRowClick={handleRowClick}
          disableColumnMenu
        />
      </div>
    </div>
  );
};
export default TableList;
