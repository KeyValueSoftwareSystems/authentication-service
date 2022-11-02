import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";

import {
  UPDATE_USER,
  UPDATE_USER_GROUPS,
  UPDATE_USER_PERMISSIONS,
} from "../../services/mutations";
import { GET_USER_GROUPS } from "../../services/queries";
import UserForm from "./UserForm";
import { getUniquePermissions } from "../../../../utils/permissions";
import { GroupPermissionsDetails } from "../../../../types/permission";
import "./styles.css";
import { Group } from "../../../../types/user";
import { FieldValues } from "react-hook-form";

const EditUser: React.FC = () => {
  const { id } = useParams();
  const [userGroups, setUserGroups] = useState<Group[]>([]);
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
      const groupList = data?.getUserGroups.map((group: Group) => group);
      setUserGroups(groupList);
    },
  });

  const onUpdateUser = (
    inputs: FieldValues,
    userGroups: Group[],
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
          groups: userGroups.map((group) => group.id),
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
    <UserForm isEdit updateUser={onUpdateUser} currentGroups={userGroups} />
  );
};

export default EditUser;
