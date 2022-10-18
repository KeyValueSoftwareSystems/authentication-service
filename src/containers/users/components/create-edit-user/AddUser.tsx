import React, { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";

import {
  CREATE_USER,
  UPDATE_USER_GROUPS,
  UPDATE_USER_PERMISSIONS,
} from "../../services/mutations";
import "./styles.css";
import UserForm from "./UserForm";
import { AddUserformSchema } from "../../userSchema";
import { getUniquePermissions } from "../../../../utils/permissions";
import { GroupPermissionsDetails } from "../../../../types/permission";
import { FieldValues } from "react-hook-form";

const AddUser: React.FC = () => {
  const navigate = useNavigate();

  const [userPermissions,setUserPermissions] = useState<GroupPermissionsDetails[]>([]);
  const [userGroupIds, setUserGroupIds] = useState<string[]>([]);

  const [createUser, { error: createUserError, data }] =
    useMutation(CREATE_USER);
  const [updateUserGroups, { error: groupUpdateError }] =
    useMutation(UPDATE_USER_GROUPS);
  const [updateUserPermissions, { error: permissionUpdateError }] = useMutation(
    UPDATE_USER_PERMISSIONS
  );

  useEffect(() => {
    if (data) updateUserInfo();
  }, [data]);


  const onCreateUser = (inputs: FieldValues,userGroupIds:string[],userPermissions:GroupPermissionsDetails[]) => {
    createUser({
      variables: {
        input: inputs,
      },
    });
    setUserPermissions(userPermissions);
    setUserGroupIds(userGroupIds);
  };

  const updateUserInfo = () => {
    updateUserGroups({
      variables: {
        id: data?.passwordSignup.id,
        input: {
          groups: userGroupIds,
        },
      },
    });

    updateUserPermissions({
      variables: {
        id: data?.passwordSignup.id,
        input: {
          permissions: getUniquePermissions(userPermissions),
        },
      },

      onCompleted: () => {
        if (!createUserError && !groupUpdateError && !permissionUpdateError)
          navigate("/home/users");
      },
    });
  };


  return (
    <UserForm
      createUser={onCreateUser}
      userformSchema={AddUserformSchema}
    />
  );
};

export default AddUser;
