import React from "react";
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

const Users: React.FC = () => {
  const [userList, setUserList] = useRecoilState(userListAtom);

  const navigate = useNavigate();

  useMutation(DELETE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });

  useQuery(GET_USERS, {
    onCompleted: (data) => {
      setUserList(data?.getUsers);
    },
  });

  const onEdit = (id: any) => {
    navigate(`/home/users/add/${id}`);
  };

  const onAdd = () => {
    navigate(`/home/users/add`);
  };

  const columns: GridColumns = [
    {
      field: "firstName",
      headerName: "User",
      width: 320,
      headerClassName: "user-list-header",
      headerAlign: "center",
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
          <TableChipElement rowItems={params} columnName="groups" />
        </div>
      ),
      headerAlign: "center",
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
        buttonLabel="Add User"
        searchLabel="Search User"
        deleteMutation={DELETE_USER}
        refetchQuery={GET_USERS}
        handleRowClick={onUserClick}
      />
    </>
  );
};

const GetFullName = (props: any) => {
  const { row } = props;
  let fullName = row.firstName.concat(" ", row.lastName);
  return (
    <>
      <Avatar {...stringAvatar(fullName)} className="avatar" />
      <div>
        <div className="fullname">{fullName}</div>
        <div className="email">{row.email}</div>
      </div>
    </>
  );
};

export default Users;
