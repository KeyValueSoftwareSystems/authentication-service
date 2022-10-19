import React from "react";
import { useRecoilState } from "recoil";
import { useMutation, useQuery } from "@apollo/client";
import { GridColumns, GridRowId, GridRowParams } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

import "./groups.css";
import { DELETE_GROUP } from "../../services/mutations";
import { GET_GROUPS, GET_GROUP_ROLES } from "../../services/queries";
import TableList from "../../../../components/table";
import { groupListAtom } from "../../../../states/groupStates";
import TableChipElement from "../../../../components/table-chip-element";


const GroupList: React.FC = () => {
  const navigate = useNavigate();

  useMutation(DELETE_GROUP, {
    refetchQueries: [{ query: GET_GROUPS }],
  });
  const [groupList, setGroupList] = useRecoilState(groupListAtom);

  useQuery(GET_GROUPS, {
    onCompleted: (data) => {
      setGroupList(data?.getGroups);
    },
  });

  const columns: GridColumns = [
    {
      field: "name",
      headerName: "Groups",
      headerClassName: "user-list-header",
      headerAlign: "left",
      width: 280,
    },
    {
      field: "roles",
      headerName: "Roles",
      headerClassName: "user-list-header",
      flex: 1,
      renderCell: (params) => (
        <TableChipElement
          props={params}
          query={GET_GROUP_ROLES}
          element="group"
        />
      ),
      headerAlign: "center",
    },
  ];

  const onGroupClick = (params:GridRowParams) => {
    navigate(`./${params.id}`);
  };

  const onAddGroup = () => {
    navigate("add");
  };

  const onEditGroup = (id: GridRowId) => {
    navigate(`edit/${id}`);
  };

  return (
    <>
      <TableList
        rows={groupList}
        columns={columns}
        text="All Groups"
        buttonLabel="Add Group"
        searchLabel="Search Group"
        deleteMutation={DELETE_GROUP}
        refetchQuery={GET_GROUPS}
        onAdd={onAddGroup}
        onEdit={onEditGroup}
        handleRowClick={onGroupClick}
      />
    </>
  );
};
export default GroupList;
