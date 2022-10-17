import React from "react";
import { useRecoilState } from "recoil";
import { useMutation, useQuery } from "@apollo/client";
import { GridColumns } from "@mui/x-data-grid";
import { Chip } from "@mui/material";
import { GET_USERS, GET_USER_GROUPS } from "./services/queries";
import { DELETE_USER } from "./services/mutations";
import { userListAtom } from "../../states/userStates";
import TableList from "../../components/table/Table";
import { useNavigate } from "react-router-dom";

const Users: React.FC = () => {
  useMutation(DELETE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });

  const [userList, setUserList] = useRecoilState(userListAtom);
  const navigate = useNavigate();
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
      width: 300,
      headerClassName: "user-list-header",
      headerAlign: "left",
    },
    {
      field: "groups",
      headerName: "Member Of",
      headerClassName: "user-list-header",
      flex: 1,
      renderCell: (params) => <ShowGroupList {...params} />,
      headerAlign: "center",
    },
  ];

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
      />
    </>
  );
};

const ShowGroupList = (props: any) => {
  const { row } = props;
  const [groupList, setGroupList] = React.useState([]);

  useQuery(GET_USER_GROUPS, {
    variables: {
      id: row.id,
    },
    onCompleted: (data) => {
      setGroupList(data?.getUserGroups);
    },
  });

  return (
    <>
      {groupList?.map((group: any) => (
        <Chip label={group?.name} key={group?.id} />
      ))}
    </>
  );
};

export default Users;
