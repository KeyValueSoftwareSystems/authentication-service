import React, { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider, FieldValues } from "react-hook-form";
import { Box, Button, Chip, Divider, Grid, Tab } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  GET_GROUPS,
  GET_GROUP_PERMISSIONS,
} from "../../../groups/services/queries";
import { useLazyQuery, useQuery } from "@apollo/client";
import FormInputText from "../../../../components/inputText";
import { ChecklistComponent } from "../../../../components/checklist/CheckList";
import { GET_USER } from "../../services/queries";
import { Group, User } from "../../../../types/user";
import "./styles.css";
import apolloClient from "../../../../services/apolloClient";
import PermissionTabs from "../../../../components/tabs/PermissionTabs";
import { EntityPermissionsDetails } from "../../../../types/generic";

const UserForm = (props: any) => {
  const { isEdit, updateUser, createUser, userformSchema, currentGroups } =
    props;

  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [userPermissions, setUserPermissions] = useState<
    EntityPermissionsDetails[]
  >([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (id) {
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
      const currentPermissions = userPermissions;
      if (
        !currentPermissions.some((permission) => permission.id === group.id)
      ) {
        currentPermissions.push({
          id: group.id,
          name: group.name,
          permissions: response?.data?.getGroupPermissions,
        });
      }
      setUserPermissions([...currentPermissions]);
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

  useEffect(() => {
    if (isEdit) setUserGroups(currentGroups);
  }, [isEdit, currentGroups]);

  const methods = useForm({
    resolver: yupResolver(userformSchema),
  });

  const { handleSubmit } = methods;

  const onSubmitForm = (inputs: FieldValues) => {
    isEdit
      ? updateUser(inputs, userGroups, userPermissions)
      : createUser(inputs, userGroups, userPermissions);
  };

  const [getGroupPermissionsData] = useLazyQuery(GET_GROUP_PERMISSIONS);

  const removeGroup = (group: Group) => {
    setUserGroups(
      userGroups.filter((groupDetails) => groupDetails.id !== group.id)
    );
    setUserPermissions(
      userPermissions.filter((permission) => permission.id !== group.id)
    );
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    group: Group
  ) => {
    const value = event.target.value;

    if (event.target.checked) {
      if (event.target.checked) {
        if (value === "all") {
          setUserGroups(allGroups);
          allGroups.forEach((group) => {
            handlePermissions(group);
          });
        } else {
          setUserGroups([...userGroups, group]);
        }
        getGroupPermissionsData({
          variables: { id: group.id },
          fetchPolicy: "no-cache",
          onCompleted: (data) => {
            setUserPermissions([
              ...userPermissions,
              {
                id: group.id,
                name: group.name,
                permissions: data?.getGroupPermissions,
              },
            ]);
          },
        });
      }
    } else {
      if (value === "all") {
        setUserGroups([]);
        setUserPermissions([]);
      }
      removeGroup(group);
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
                  {/* <Link  to="/home/users"> */}
                  Cancel
                  {/* </Link> */}
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
            <PermissionTabs permissions={userPermissions} />
          </Grid>
          </div>
        </div>
        {/* <div id="add-items">
          <span>Permissions</span>
          <PermissionTabs permissions={userPermissions} />
        </div> */}
      </div>

  );
};

export default UserForm;
