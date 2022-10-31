import React, { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider, FieldValues } from "react-hook-form";
import { Button, Divider, Grid } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  GET_GROUPS,
  GET_GROUP_PERMISSIONS,
} from "../../../groups/services/queries";
import { useQuery } from "@apollo/client";
import FormInputText from "../../../../components/inputText";
import { ChecklistComponent } from "../../../../components/checklist/CheckList";
import { GET_USER } from "../../services/queries";
import { Group, User } from "../../../../types/user";
import "./styles.css";
import apolloClient from "../../../../services/apolloClient";
import PermissionTabs from "../../../../components/tabs/PermissionTabs";
import { Entity } from "../../../../types/generic";
import { GroupPermissionsDetails } from "../../../../types/permission";
import { AddUserformSchema, EditUserformSchema } from "../../userSchema";

interface UserProps {
  isEdit?: boolean;
  updateUser?: (
    inputs: FieldValues,
    userGroups: Group[],
    groupPermissions: GroupPermissionsDetails[]
  ) => void;
  createUser?: (
    inputs: FieldValues,
    userGroups: Group[],
    groupPermissions: GroupPermissionsDetails[]
  ) => void;
  currentGroups?: Group[];
}

const UserForm = (props: UserProps) => {
  const { isEdit, updateUser, createUser, currentGroups } = props;

  const userformSchema = isEdit ? EditUserformSchema : AddUserformSchema;

  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [groupPermissions, setGroupPermissions] = useState<
    GroupPermissionsDetails[]
  >([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (currentGroups) {
      currentGroups.forEach((group: Group) => {
        handlePermissions(group);
      });
      setUserGroups(currentGroups);
    }
  }, [currentGroups]);

  const handlePermissions = async (group: Group) => {
    const response = await apolloClient.query({
      query: GET_GROUP_PERMISSIONS,
      variables: {
        id: group.id,
      },
    });
    if (response) {
      setGroupPermissions((previousState) => [
        ...previousState,
        {
          id: group.id,
          name: group.name,
          permissions: response?.data?.getGroupPermissions,
        },
      ]);
    }
  };

  const { data: groupData } = useQuery(GET_GROUPS, {
    onCompleted: (data) => {
      const groups = data?.getGroups.map((group: Group) => group);
      setAllGroups([...groups]);
    },
  });

  const { loading } = useQuery(GET_USER, {
    skip: !id,
    variables: { id: id },
    onCompleted: (data) => {
      setUser(data?.getUser);
    },
  });

  const methods = useForm({
    resolver: yupResolver(userformSchema),
  });

  const { handleSubmit } = methods;

  const onSubmitForm = (inputs: FieldValues) => {
    if (updateUser) updateUser(inputs, userGroups, groupPermissions);
    else if (createUser) createUser(inputs, userGroups, groupPermissions);
  };

  const removeGroup = (group: Group) => {
    setUserGroups(
      userGroups.filter((groupDetails) => groupDetails.id !== group.id)
    );
    setGroupPermissions(
      groupPermissions.filter((permission) => permission.id !== group.id)
    );
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    group?: Entity
  ) => {
    const value = event.target.value;
    if (event.target.checked) {
      if (value === "all") {
        setUserGroups(allGroups);
        allGroups.forEach((group) => {
          handlePermissions(group);
        });
      } else {
        if (group) {
          setUserGroups([...userGroups, group]);
          handlePermissions(group);
        }
      }
    } else {
      if (value === "all") {
        setUserGroups([]);
        setGroupPermissions([]);
      }
      if (group) removeGroup(group);
    }
  };

  const onBackNavigation = () => {
    navigate("/home/users");
  };

  return (
    <div id="page">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div id="fixed">
            <div id="back-page" onClick={onBackNavigation}>
              <ArrowBackIcon id="arrowicon" />
              Users
            </div>

            <div id="title">
              <legend id="bold">{isEdit ? "Modify user" : "Add user"}</legend>
              <div id="add-cancel">
                <Button variant="text" onClick={onBackNavigation}>
                  Cancel
                </Button>
                <Button id="add" type="submit" variant="outlined">
                  {isEdit ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </div>

          <div id="inputs">
            {!loading && (
              <div id="form-row">
                <FormInputText
                  name="firstName"
                  label="First name*"
                  type="text"
                  className="fields"
                  defaultText={user?.firstName}
                />
                <FormInputText
                  name="middleName"
                  label="Middle name"
                  type="text"
                  className="fields"
                  defaultText={user?.middleName}
                />
                <FormInputText
                  name="lastName"
                  label="Last Name*"
                  type="type"
                  className="fields"
                  defaultText={user?.lastName}
                />
              </div>
            )}
            {!isEdit && (
              <div id="form-row">
                <FormInputText
                  name="email"
                  label="Email*"
                  type="text"
                  className="fields"
                />
                <FormInputText
                  name="phone"
                  label="Phone Number"
                  type="text"
                  className="fields"
                />
                <FormInputText
                  name="password"
                  label="Password*"
                  type="password"
                  className="fields"
                  autoComplete="new-password"
                />
              </div>
            )}
          </div>
        </form>
      </FormProvider>

      <div className="userGroups"> {"Groups & Permissions"}</div>

      <div id="groups-permissions">
        <ChecklistComponent
          name="Select Groups"
          mapList={groupData?.getGroups}
          currentCheckedItems={userGroups}
          onChange={handleChange}
        />

        <Divider orientation="vertical" flexItem sx={{ marginLeft: 2 }} />
        <div id="add-items">
          <Grid item xs={10} lg={6.7} sx={{ paddingLeft: 5 }}>
            <div className="header">Permissions summary of selected roles</div>
            <PermissionTabs permissions={groupPermissions} />
          </Grid>
        </div>
      </div>
      {/* <div id="add-items">
          <span>Permissions</span>
          <PermissionTabs permissions={groupPermissions} />
        </div> */}
    </div>
  );
};

export default UserForm;
