import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@apollo/client";

import {
  UPDATE_USER,
  UPDATE_USER_GROUPS,
  UPDATE_USER_PERMISSIONS,
} from "../../services/mutations";
import UserForm from "./UserForm";
import "./styles.css";
import { Group, Permission } from "../../../../types/user";
import { FieldValues } from "react-hook-form";

const EditUser: React.FC = () => {
  const { id } = useParams();
  const [updateUser, { error: userUpdateError }] = useMutation(UPDATE_USER);
  const [updateUserGroups, { error: groupUpdateError }] =
    useMutation(UPDATE_USER_GROUPS);
  const [updateUserPermissions, { error: permissionUpdateError }] = useMutation(
    UPDATE_USER_PERMISSIONS
  );
  const navigate = useNavigate();

  const onUpdateUser = (
    inputs: FieldValues,
    userGroups: Group[],
    selectedPermissions: Permission[]
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
          permissions: selectedPermissions.map((permission) => permission.id),
        },
      },
      onCompleted: () => {
        if (!userUpdateError && !groupUpdateError && !permissionUpdateError)
          navigate("/home/users", {
            state: { message: "User has been successfully updated" },
          });
      },
    });
  };

  return <UserForm isEdit updateUser={onUpdateUser} />;
};

export default EditUser;
