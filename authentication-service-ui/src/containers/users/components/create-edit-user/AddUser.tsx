import React, { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";

import {
  CREATE_USER,
  UPDATE_USER_GROUPS,
  UPDATE_USER_PERMISSIONS,
} from "../../services/mutations";
import "./styles.css";
import UserForm from "./UserForm";
import { GroupPermissionsDetails } from "../../../../types/permission";
import { FieldValues } from "react-hook-form";
import { Group, Permission } from "../../../../types/user";
import {
  apiRequestAtom,
  toastMessageAtom,
} from "../../../../states/apiRequestState";

const AddUser: React.FC = () => {
  const navigate = useNavigate();

  const [apiSuccess, setApiSuccess] = useRecoilState(apiRequestAtom);
  const [toastMessage, setToastMessage] = useRecoilState(toastMessageAtom);
  const [userPermissions, setUserPermissions] = useState<
    GroupPermissionsDetails[]
  >([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [createUser, { error: createUserError, data }] = useMutation(
    CREATE_USER,
    {
      onError: () => {
        setApiSuccess(false);
        setToastMessage("The request could not be processed");
      },
    }
  );
  const [updateUserGroups, { error: groupUpdateError }] = useMutation(
    UPDATE_USER_GROUPS,
    {
      onError: () => {
        setApiSuccess(false);
        setToastMessage("The request could not be processed");
      },
    }
  );
  const [updateUserPermissions, { error: permissionUpdateError }] = useMutation(
    UPDATE_USER_PERMISSIONS,
    {
      onError: () => {
        setApiSuccess(false);
        setToastMessage("The request could not be processed");
      },
    }
  );

  useEffect(() => {
    if (data) updateUserInfo();
  }, [data]);

  const onCreateUser = (
    inputs: FieldValues,
    userGroups: Group[],
    selectedPermissions: Permission[]
  ) => {
    createUser({
      variables: {
        input: inputs,
      },
    });
    setUserPermissions(userPermissions);
    setUserGroups(userGroups);
    setPermissions(selectedPermissions.map((permission) => permission.id));
  };

  const updateUserInfo = () => {
    updateUserGroups({
      variables: {
        id: data?.inviteTokenSignup.user.id,
        input: {
          groups: userGroups.map((group) => group.id),
        },
      },
    });

    updateUserPermissions({
      variables: {
        id: data?.inviteTokenSignup.user.id,
        input: {
          permissions: permissions,
        },
      },

      onCompleted: () => {
        if (!createUserError && !groupUpdateError && !permissionUpdateError) {
          navigate("/home/users");
          setApiSuccess(true);
          setToastMessage("User has been successfully created");
        }
      },
    });
  };

  return <UserForm createUser={onCreateUser} />;
};

export default AddUser;
