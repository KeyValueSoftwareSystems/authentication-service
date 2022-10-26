import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";

import {
  UPDATE_USER,
  UPDATE_USER_GROUPS,
  UPDATE_USER_PERMISSIONS,
} from "../../services/mutations";
import { GET_USER_GROUPS, GET_USER_PERMISSIONS } from "../../services/queries";
import { EditUserformSchema } from "../../userSchema";
import UserForm from "./UserForm";
import "./styles.css";
import { Group, Permission } from "../../../../types/user";

const EditUser: React.FC = () => {
  const { id } = useParams();
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    []
  );

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
      const groupList = data?.getUserGroups.map((group: any) => group);
      setUserGroups(groupList);
    },
  });

  useQuery(GET_USER_PERMISSIONS, {
    variables: { id },
    onCompleted: (data) => {
      const permissionList = data?.getUserPermissions;
      setSelectedPermissions(permissionList);
    },
  });

  const onUpdateUser = (inputs: any, userGroups: Group[]) => {
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
          permissions: selectedPermissions.map((permission) => permission.id),
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
      currentGroups={userGroups}
      currentPermissions={selectedPermissions}
    />
  );
};

export default EditUser;
