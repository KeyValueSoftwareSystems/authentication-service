import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
import { useMutation, useQuery } from "@apollo/client";
import { Avatar, Chip } from "@mui/material";
import { GridColumns } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import CircleIcon from "@mui/icons-material/Circle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Tooltip } from "@mui/material";

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

  const setItemList = (data: any) => {
    setUserList(data.getUsers);
  };

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
      headerName: "Groups",
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
    {
      field: "status",
      headerName: "Status",
      flex: 0.2,
      renderCell: (params) => (
        <div className="access-column">
          <CheckAccess {...params} />
        </div>
      ),
      headerAlign: "center",
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
        setItemList={setItemList}
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

const CheckAccess = (props: any) => {
  const { row } = props;

  const onCopyInviteLink = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    const inviteLink = `${process.env.REACT_APP_BASE_URL}/#/confirmpassword?token=${props.row.inviteToken}`;
    navigator.clipboard.writeText(inviteLink);
  };

  return (
    <div className="toggle">
      {row.status !== "INVITED" && (
        <div className="switch">
          <Chip
            icon={
              <CircleIcon
                sx={{ width: "9px", marginLeft: "18px !important" }}
                id={
                  row.status === "ACTIVE" ? "active-circle" : "inactive-circle"
                }
              />
            }
            sx={{
              marginLeft: "24px !important",
              borderRadius: "5px !important",
              width: "21px",
              height: "21px",
            }}
            id={row.status === "ACTIVE" ? "active" : "inactive"}
          />
          {row.status === "ACTIVE" ? (
            <div id="enabled-text">Active</div>
          ) : (
            <div id="enabled-text">Inactive</div>
          )}
        </div>
      )}
      <div className="invited-switch">
        {row.status === "INVITED" && (
          <>
            <Chip
              label="Invited"
              className="pending"
              sx={{
                height: "36px",
                width: "107px",
                borderRadius: "5px",
                fontWeight: "600",
              }}
            />
            <Tooltip
              title="Copy Invite Link"
              onClick={onCopyInviteLink}
              sx={{ cursor: "pointer" }}
            >
              <ContentCopyIcon fontSize="small" htmlColor="#01579B" />
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
};

export default Users;
