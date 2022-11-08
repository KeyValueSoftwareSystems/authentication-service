import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
import { useMutation, useQuery } from "@apollo/client";
import { Avatar } from "@mui/material";
import { GridColumns } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

import { GET_USERS } from "./services/queries";
import "./styles.css";
import { DELETE_USER } from "./services/mutations";
import { userListAtom } from "../../states/userStates";
import TableList from "../../components/table/Table";
import TableChipElement from "../../components/table-chip-element";
import { stringAvatar } from "../../utils/table";
import "./components/create-edit-user/styles.css";
import { UserPermissionsAtom } from "../../states/permissionsStates";

const Users: React.FC = () => {
  const [isAddVerified, setAddVerified] = React.useState(false);
  const [userPermissions] = useRecoilState(UserPermissionsAtom);
  const [userList, setUserList] = useRecoilState(userListAtom);
  const navigate = useNavigate();

  useMutation(DELETE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });

  useQuery(GET_USERS, {
    onCompleted: (data) => {
      setUserList(data?.getUsers);
    },
    fetchPolicy: "network-only",
  });

  const onEdit = (id: any) => {
    navigate(`/home/users/add/${id}`);
  };

  const onAdd = () => {
    navigate(`/home/users/add`);
  };

  useEffect(() => {
    userPermissions.map((item: any) => {
      if (item?.name.includes("create-user")) {
        setAddVerified(true);
      }
    });
  }, []);

  const columns: GridColumns = [
    {
      field: "firstName",
      headerName: "User",
      width: 320,
      headerClassName: "user-list-header",
      headerAlign: "left",
      renderCell: (params) => (
        <div className="username-column">
          <GetFullName {...params} />
        </div>
      ),
    },
    {
      field: "groups",
      headerName: "Member Of",
      headerClassName: "user-list-header",
      flex: 0.5,
      renderCell: (params) => (
        <div className="group-list">
          <TableChipElement
            rowItems={params}
            columnName="groups"
            defaultSize={6}
          />
        </div>
      ),
      headerAlign: "left",
      sortable: false,
    },
  ];

  const onUserClick = (params: any) => {
    navigate(`./${params.id}`);
  };

  return (
    <>
      <TableList
        rows={userList}
        columns={columns}
        text="All Users"
        onAdd={onAdd}
        onEdit={onEdit}
        entity="User"
        buttonLabel="Add User"
        searchLabel="Search User"
        deleteMutation={DELETE_USER}
        refetchQuery={GET_USERS}
        handleRowClick={onUserClick}
        editPermission="edit-user"
        deletePermission="delete-user"
        isAddVerified={!isAddVerified}
      />
    </>
  );
};

const GetFullName = (props: any) => {
  const { row } = props;
  return (
    <>
      <Avatar
        {...stringAvatar(`${row.firstName} ${row.lastName}`?.toUpperCase())}
        className="avatar"
      />
      <div>
        <div className="fullname">{`${row.firstName} ${row.lastName}`}</div>
        <div className="email">{row.email}</div>
      </div>
    </>
  );
};

export default Users;
