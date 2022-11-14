import React, { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider, FieldValues } from "react-hook-form";
import {
  Box,
  Button,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  GET_GROUPS,
  GET_GROUP_PERMISSIONS,
} from "../../../groups/services/queries";
import { ApolloError, useQuery } from "@apollo/client";
import FormInputText from "../../../../components/inputText";
import { ChecklistComponent } from "../../../../components/checklist/CheckList";
import { GET_USER, GET_USER_PERMISSIONS } from "../../services/queries";
import { Group, Permission, User } from "../../../../types/user";
import "./styles.css";
import apolloClient from "../../../../services/apolloClient";
import PermissionTabs from "../../../../components/tabs/PermissionTabs";
import { Entity } from "../../../../types/generic";
import { EntityPermissionsDetails } from "../../../../types/permission";
import { AddUserformSchema, EditUserformSchema } from "../../userSchema";
import FilterChips from "../../../../components/filter-chips/FilterChips";
import {
  apiRequestAtom,
  toastMessageAtom,
} from "../../../../states/apiRequestState";
import { useRecoilState } from "recoil";

interface UserProps {
  isEdit?: boolean;
  updateUser?: (
    inputs: FieldValues,
    userGroups: Group[],
    userPermissions: Permission[]
  ) => void;
  createUser?: (
    inputs: FieldValues,
    userGroups: Group[],
    userPermissions: Permission[]
  ) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component={"span"}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const UserForm = (props: UserProps) => {
  const { isEdit, updateUser, createUser } = props;

  const userformSchema = isEdit ? EditUserformSchema : AddUserformSchema;

  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [groupPermissions, setGroupPermissions] = useState<
    EntityPermissionsDetails[]
  >([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    []
  );
  const [toastMessage, setToastMessage] = useRecoilState(toastMessageAtom);
  const [apiSuccess, setApiSuccess] = useRecoilState(apiRequestAtom);

  const handleClick = (permission: Permission) => {
    if (
      selectedPermissions.some(
        (selected_permission) => selected_permission.id === permission.id
      )
    ) {
      setSelectedPermissions(
        selectedPermissions.filter(
          (selected_permission) => selected_permission.id !== permission.id
        )
      );
    } else setSelectedPermissions([...selectedPermissions, permission]);
  };

  useEffect(() => {
    if (
      groupPermissions.length === 0 ||
      allGroups.length === userGroups.length
    ) {
      userGroups.forEach((group: Group) => {
        handlePermissions(group);
      });
    }
  }, [userGroups]);

  const handlePermissions = async (group: Group) => {
    const response = await apolloClient.query({
      query: GET_GROUP_PERMISSIONS,
      variables: {
        id: group.id,
      },
    });
    if (response) {
      if (!groupPermissions.some((permission) => permission.id === group.id))
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
    onError: (error: ApolloError) => {
      setToastMessage(error.message);
      setApiSuccess(false);
    },
  });

  const { loading } = useQuery(GET_USER, {
    skip: !id,
    variables: { id: id },
    onCompleted: (data) => {
      setUser(data?.getUser);
      setUserGroups(data?.getUser.groups);
    },
    onError: (error: ApolloError) => {
      setToastMessage(error.message);
      setApiSuccess(false);
    },
    fetchPolicy: "network-only",
  });

  useQuery(GET_USER_PERMISSIONS, {
    skip: !id,
    variables: { id: id },
    onCompleted: (data) => {
      setSelectedPermissions(data?.getUserPermissions);
    },
    onError: (error: ApolloError) => {
      setToastMessage(error.message);
      setApiSuccess(false);
    },
    fetchPolicy: "network-only",
  });

  const methods = useForm({
    resolver: yupResolver(userformSchema),
  });

  const { handleSubmit } = methods;

  const onSubmitForm = (inputs: FieldValues) => {
    if (updateUser) updateUser(inputs, userGroups, selectedPermissions);
    else if (createUser) createUser(inputs, userGroups, selectedPermissions);
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

  const [value, setValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
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
              </div>
            )}
          </div>
        </form>
      </FormProvider>

      <div>
        <Box>
          <Box
            sx={{ borderBottom: 1, borderColor: "divider", display: "flex" }}
          >
            <Tabs value={value} onChange={handleTabChange}>
              <Tab label="Groups" />
              <Tab label="Permissions" />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <div id="groups-permissions">
              <div id="user-groups">
                <ChecklistComponent
                  name="Select Groups"
                  mapList={groupData?.getGroups}
                  currentCheckedItems={userGroups}
                  onChange={handleChange}
                />
              </div>
              <Divider orientation="vertical" flexItem sx={{ marginLeft: 2 }} />
              <div id="user-groups">
                <Grid item xs={10} lg={6.7} sx={{ paddingLeft: 5 }}>
                  <div className="header">
                    Permissions summary of selected roles
                  </div>
                  <PermissionTabs permissions={groupPermissions} />
                </Grid>
              </div>
            </div>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <FilterChips
              selectedPermissions={selectedPermissions}
              handleClick={handleClick}
            />
          </TabPanel>
        </Box>
      </div>
    </div>
  );
};

export default UserForm;
