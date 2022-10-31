import React from "react";
import { useRecoilState } from "recoil";
import { useMutation, useQuery } from "@apollo/client";
import { GridColumns, GridRowId, GridRowParams } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

import "./roles.css";
import { GET_ROLES } from "../../services/queries";
import { DELETE_ROLE } from "../../services/mutations";
import { RolesListAtom } from "../../../../states/roleStates";
import TableList from "../../../../components/table";
import TableChipElement from "../../../../components/table-chip-element";

const Roles: React.FC = () => {
  const navigate = useNavigate();

  useMutation(DELETE_ROLE, {
    refetchQueries: [{ query: GET_ROLES }],
  });
  const [roleList, setRoleList] = useRecoilState(RolesListAtom);
  useQuery(GET_ROLES, {
    onCompleted: (data) => {
      setRoleList(data?.getRoles);
    },
    fetchPolicy: "network-only",
  });
  const columns: GridColumns = [
    {
      field: "name",
      headerName: "Role",
      width: 280,
      headerClassName: "user-list-header",
      headerAlign: "left",
    },
    {
      field: "permissions",
      headerName: "Permissions",
      headerClassName: "user-list-header",
      renderCell: (params) => (
        <div className="permission-list">
          <TableChipElement
            rowItems={params}
            columnName="permissions"
            defaultSize={6}
          />
        </div>
      ),
      headerAlign: "left",
      sortable: false,
      flex: 0.7,
    },
  ];

  const onAddRole = () => {
    navigate("add");
  };

  const onEditRole = (id: GridRowId) => {
    navigate(`edit/${id}`);
  };

  const onRoleClick = (params: GridRowParams) => {
    navigate(`./${params.id}`);
  };

  return (
    <>
      <TableList
        rows={roleList}
        columns={columns}
        text="All Roles"
        buttonLabel="Add Role"
        searchLabel="Search Role"
        deleteMutation={DELETE_ROLE}
        refetchQuery={GET_ROLES}
        onAdd={onAddRole}
        onEdit={onEditRole}
        handleRowClick={onRoleClick}
      />
    </>
  );
};

export default Roles;
