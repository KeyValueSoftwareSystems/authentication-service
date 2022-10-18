import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";

import {
  UPDATE_USER,
  UPDATE_USER_GROUPS,
  UPDATE_USER_PERMISSIONS,
} from "../../services/mutations";
import { GET_USER_GROUPS } from "../../services/queries";
import { EditUserformSchema } from "../../userSchema";
import UserForm from "./UserForm";
import { GET_GROUP_PERMISSIONS } from "../../../groups/services/queries";
import { getUniquePermissions } from "../../../../utils/permissions";
import { GroupPermissionsDetails } from "../../../../types/permission";
import "./styles.css";

const EditUser: React.FC = () => {
  const { id } = useParams();

  const [userPermissions, setUserPermissions] = useState<
    GroupPermissionsDetails[]
  >([]);
  const [selectedGroupIds, setUserGroupIds] = useState<string[]>([]);

  const [updateUser, { error: userUpdateError }] = useMutation(UPDATE_USER);
  const [updateUserGroups, { error: groupUpdateError }] =
    useMutation(UPDATE_USER_GROUPS);
  const [updateUserPermissions, { error: permissionUpdateError }] = useMutation(
    UPDATE_USER_PERMISSIONS
  );
  const navigate = useNavigate();

  useQuery(GET_USER_GROUPS, {
    variables: { id },
    onCompleted: (data) => {
      const groupIds = data?.getUserGroups.map((group: any) => group.id);
      setUserGroupIds(groupIds);
    },
  });

  const [getData] = useLazyQuery(GET_GROUP_PERMISSIONS);

  useEffect(() => {
    selectedGroupIds.forEach((group) => {
      getData({
        variables: { id: group },
        fetchPolicy: "no-cache",
        onCompleted: (data) => {
          setUserPermissions([
            ...userPermissions,
            { groupId: group, permissions: data?.getGroupPermissions },
          ]);
        },
      });
    });
  }, [selectedGroupIds]);

  const onUpdateUser = (
    inputs: any,
    userGroupIds: string[],
    userPermissions: GroupPermissionsDetails[]
  ) => {
    updateUser({
      variables: {
        id: id,
        input: {
          firstName: inputs.firstName,
          middleName: inputs.middleName,
          lastName: inputs.lastName,
        },
      },
    });

    updateUserGroups({
      variables: {
        id: id,
        input: {
          groups: userGroupIds,
        },
      },
    });

    updateUserPermissions({
      variables: {
        id: id,
        input: {
          permissions: getUniquePermissions(userPermissions),
        },
      },
      onCompleted: () => {
        if (!userUpdateError && !groupUpdateError && !permissionUpdateError)
          navigate("/home/users");
      },
    });
  };

  return (
    <UserForm
      isEdit
      updateUser={onUpdateUser}
      userformSchema={EditUserformSchema}
      currentGroupIDs={selectedGroupIds}
      currentUserPermissions={userPermissions}
    />
  );
};

export default EditUser;
