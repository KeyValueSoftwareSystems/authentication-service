import React, { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider, FieldValues } from "react-hook-form";
import { Box, Button, Divider, Grid, Tab } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  GET_GROUPS,
  GET_GROUP_PERMISSIONS,
} from "../../../groups/services/queries";
import { useQuery } from "@apollo/client";
import FormInputText from "../../../../components/inputText";
import { ChecklistComponent } from "../../../../components/checklist/CheckList";
import { GET_USER } from "../../services/queries";
import { Group, Permission, User } from "../../../../types/user";
import "./styles.css";
import apolloClient from "../../../../services/apolloClient";
import PermissionTabs from "../../../../components/tabs/PermissionTabs";
import { EntityPermissionsDetails } from "../../../../types/generic";
import FilterChips from "../../../../components/filter-chips/FilterChips";

const UserForm = (props: any) => {
  const { isEdit, updateUser, createUser, userformSchema, currentGroups, currentPermissions } =
    props;

  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [userPermissions, setUserPermissions] = useState<
    EntityPermissionsDetails[]
  >([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    []
  );

  const handleClick = (permission: Permission) => {
    if (selectedPermissions.map((permission)=>permission.id).includes(permission.id)){
      console.log(permission.name)
      setSelectedPermissions(
        selectedPermissions.filter(
          (selected_permission) => selected_permission.id !== permission.id
        )
      )}
    else setSelectedPermissions([...selectedPermissions, permission]);
  };

  useEffect(() => {
    if (id) {
      currentGroups.forEach((group: Group) => {
        handlePermissions(group);
      });
      setUserGroups(currentGroups);
      setSelectedPermissions(currentPermissions)
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
      ? updateUser(inputs, userGroups, selectedPermissions)
      : createUser(inputs, userGroups, selectedPermissions);
  };

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
          setSelectAll(true);
        } else {
          setUserGroups([...userGroups, group]);
        }
        handlePermissions(group);
      }
    } else {
      if (value === "all") {
        setUserGroups([]);
        setUserPermissions([]);
        setSelectAll(false);
      }
      removeGroup(group);
    }
  };

  const onBackNavigation = () => {
    navigate("/home/users");
  };

  const [value, setValue] = useState<string>("");

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
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

      <div id="groups-permissions">
        <Box sx={{ width: "100%", typography: "body1" }}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList onChange={handleTabChange}>
                <Tab label="Groups" value="groups" />
                <Tab label="Permissions" value="permissions" />
              </TabList>
            </Box>
            <TabPanel value="groups" id="groups-permissions">
              <div id="add-items">
                <ChecklistComponent
                  name="Select Groups"
                  mapList={groupData?.getGroups}
                  currentCheckedItems={userGroups}
                  onChange={handleChange}
                  selectAll={selectAll}
                />
              </div>
              <Divider orientation="vertical" flexItem sx={{ marginLeft: 2 }} />
              <div id="add-items">
                <Grid item xs={10} lg={6.7} sx={{ paddingLeft: 5 }}>
                  <div className="header">
                    Permissions summary of selected roles
                  </div>
                  <PermissionTabs permissions={userPermissions} />
                </Grid>
              </div>
            </TabPanel>
            <TabPanel value="permissions">
              <FilterChips
                selectedPermissions={selectedPermissions}
                handleClick={handleClick}
              />
            </TabPanel>
          </TabContext>
        </Box>
      </div>
    </div>
  );
};

export default UserForm;
