import React from "react";
import { useRecoilState } from "recoil";
import { useMutation, useQuery } from "@apollo/client";
import { GridColumns } from "@mui/x-data-grid";
import "./roles.css";
import { GET_ROLES } from "./services/queries";
import { DELETE_ROLE } from "./services/mutations";
import { RolesListAtom } from "../../states/roleStates";
import TableList from "../../components/table";

const Roles: React.FC = () => {
  useMutation(DELETE_ROLE, {
    refetchQueries: [{ query: GET_ROLES }],
  });
  const [roleList, setRoleList] = useRecoilState(RolesListAtom);
  useQuery(GET_ROLES, {
    onCompleted: (data) => {
      setRoleList(data?.getRoles);
    },
  });
  const columns: GridColumns = [
    {
      field: "name",
      headerName: "Role",
      width: 900,
      headerClassName: "user-list-header",
      headerAlign: "left",
    },
  ];

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
      />
    </>
  );
};

export default Roles;
