import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
import { ApolloError, useMutation, useQuery } from "@apollo/client";
import { GridColumns, GridRowId, GridRowParams } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

import "./styles.css";
import { DELETE_GROUP } from "../../services/mutations";
import { GET_GROUPS } from "../../services/queries";
import TableList from "../../../../components/table";
import { groupListAtom } from "../../../../states/groupStates";
import TableChipElement from "../../../../components/table-chip-element";
import { UserPermissionsAtom } from "../../../../states/permissionsStates";
import AvatarList from "../../../../components/avatar-list/AvatarList";
import {
  apiRequestAtom,
  toastMessageAtom,
} from "../../../../states/apiRequestState";

const GroupList: React.FC = () => {
  const navigate = useNavigate();

  const [isAddVerified, setAddVerified] = React.useState(false);
  const [userPermissions] = useRecoilState(UserPermissionsAtom);
  const [apiSuccess, setApiSuccess] = useRecoilState(apiRequestAtom);
  const [toastMessage, setToastMessage] = useRecoilState(toastMessageAtom);
  const [groupList, setGroupList] = useRecoilState(groupListAtom);

  useQuery(GET_GROUPS, {
    onCompleted: (data) => {
      setGroupList(data?.getGroups);
    },
    onError: (error: ApolloError) => {
      setToastMessage(error.message);
      setApiSuccess(false);
    },
    fetchPolicy: "network-only",
  });

  const columns: GridColumns = [
    {
      field: "name",
      headerName: "Group",
      headerClassName: "user-list-header",
      headerAlign: "left",
      width: 280,
    },
    {
      field: "roles",
      headerName: "Roles",
      headerClassName: "user-list-header",
      flex: 0.6,
      renderCell: (params) => (
        <div className="role-list">
          <TableChipElement
            rowItems={params}
            columnName="roles"
            defaultSize={5}
          />
        </div>
      ),
      headerAlign: "left",
      sortable: false,
    },
    {
      field: "users",
      headerName: "Members",
      headerClassName: "user-list-header",
      flex: 0.5,
      renderCell: (params) => (
        <div className="role-list">
          <AvatarList {...params} />
        </div>
      ),
      headerAlign: "left",
      sortable: false,
    },
  ];

  const onGroupClick = (params: GridRowParams) => {
    navigate(`./${params.id}`);
  };

  const onAddGroup = () => {
    navigate("add");
  };

  const onEditGroup = (id: GridRowId) => {
    navigate(`edit/${id}`);
  };

  useEffect(() => {
    userPermissions.map((item: any) => {
      if (item?.name.includes("create-groups")) {
        setAddVerified(true);
      }
    });
  }, []);

  const setItemList = (data: any) => {
    setGroupList(data.getGroups);
  };

  return (
    <>
      <TableList
        rows={groupList}
        columns={columns}
        text="All Groups"
        buttonLabel="Add Group"
        searchLabel="Search Group"
        setItemList={setItemList}
        entity="Group"
        deleteMutation={DELETE_GROUP}
        refetchQuery={GET_GROUPS}
        onAdd={onAddGroup}
        onEdit={onEditGroup}
        handleRowClick={onGroupClick}
        editPermission="edit-groups"
        deletePermission="delete-groups"
        isAddVerified={!isAddVerified}
      />
    </>
  );
};
export default GroupList;
