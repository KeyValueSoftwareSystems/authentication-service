import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
import { ApolloError, useQuery } from "@apollo/client";
import { GridColumns, GridRowId } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

import "./roles.css";
import { GET_ROLES } from "../../services/queries";
import { DELETE_ROLE } from "../../services/mutations";
import { RolesListAtom } from "../../../../states/roleStates";
import TableList from "../../../../components/table";
import { UserPermissionsAtom } from "../../../../states/permissionsStates";
import TableChipElement from "../../../../components/table-chip-element";
import {
  apiRequestAtom,
  toastMessageAtom,
} from "../../../../states/apiRequestState";

const Roles: React.FC = () => {
  const navigate = useNavigate();

  const [isAddVerified, setAddVerified] = React.useState(false);
  const [userPermissions] = useRecoilState(UserPermissionsAtom); // eslint-disable-next-line
  const [toastMessage, setToastMessage] = useRecoilState(toastMessageAtom); // eslint-disable-next-line
  const [apiSuccess, setApiSuccess] = useRecoilState(apiRequestAtom);

  const [roleList, setRoleList] = useRecoilState(RolesListAtom);
  useQuery(GET_ROLES, {
    onCompleted: (data) => {
      setRoleList(data?.getRoles);
    },
    onError: (error: ApolloError) => {
      setToastMessage(error.message);
      setApiSuccess(false);
    },
    fetchPolicy: "network-only",
  });

  const setItemList = (data: any) => {
    setRoleList(data.getRoles);
  };
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

  useEffect(() => {
    // eslint-disable-next-line
    userPermissions.map((item: any) => {
      if (item?.name.includes("create-roles")) {
        setAddVerified(true);
      }
    }); // eslint-disable-next-line
  }, []);

  return (
    <>
      <TableList
        rows={roleList}
        columns={columns}
        text="All Roles"
        buttonLabel="Add Role"
        searchLabel="Search Role"
        setItemList={setItemList}
        entity="Role"
        deleteMutation={DELETE_ROLE}
        refetchQuery={GET_ROLES}
        onAdd={onAddRole}
        onEdit={onEditRole}
        editPermission="edit-roles"
        deletePermission="delete-roles"
        isAddVerified={!isAddVerified}
      />
    </>
  );
};

export default Roles;
