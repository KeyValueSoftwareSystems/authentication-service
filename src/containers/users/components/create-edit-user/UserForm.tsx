import React, { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "./styles.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider, FieldValues } from "react-hook-form";
import { Box, Button, Chip, Tab } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  GET_GROUPS,
  GET_GROUP_PERMISSIONS,
} from "../../../groups/services/queries";
import { useLazyQuery, useQuery } from "@apollo/client";
import FormInputText from "../../../../components/inputText";
import { ChecklistComponent } from "../../../../components/checklist/CheckList";
import {
  GroupPermissionsDetails,
  Permission,
} from "../../../../types/permission";
import { GET_USER } from "../../services/queries";
import { Group, User } from "../../../../types/user";

const UserForm = (props: any) => {
  const {
    isEdit,
    updateUser,
    createUser,
    userformSchema,
    currentGroupIDs,
    currentUserPermissions,
  } = props;

  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();
  const [userGroupIds, setUserGroupIds] = useState<String[]>([]);
  const [userPermissions, setUserPermissions] = useState<
    GroupPermissionsDetails[]
  >([]);
  const [groupList, setGroupList] = useState<Group[]>([]);

  useEffect(() => {
    if (currentUserPermissions) setUserPermissions(currentUserPermissions);
  }, [currentUserPermissions]);

  const { loading } = useQuery(GET_USER, {
    skip: !id,
    variables: { id: id },
    onCompleted: (data) => {
      setUser(data?.getUser);
    },
  });

  useQuery(GET_GROUPS, {
    onCompleted: (data) => {
      setGroupList(data?.getGroups);
    },
  });

  useEffect(() => {
    if (isEdit) setUserGroupIds(currentGroupIDs);
  }, [isEdit, currentGroupIDs]);

  const methods = useForm({
    resolver: yupResolver(userformSchema),
  });

  const { handleSubmit } = methods;

  const onSubmitForm = (inputs: FieldValues) => {
    isEdit
      ? updateUser(inputs, userGroupIds, userPermissions)
      : createUser(inputs, userGroupIds, userPermissions);
  };

  const [getGroupPermissionsData] = useLazyQuery(GET_GROUP_PERMISSIONS);

  const removeGroup = (group: string) => {
    setUserGroupIds(userGroupIds.filter((groupId) => groupId !== group));
    setUserPermissions(
      userPermissions.filter((permission) => permission.groupId !== group)
    );
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    group: Group
  ) => {
    if (event.target.checked) {
      setUserGroupIds([...userGroupIds, group.id]);

      getGroupPermissionsData({
        variables: { id: group.id },
        fetchPolicy: "no-cache",
        onCompleted: (data) => {
          setUserPermissions([
            ...userPermissions,
            { groupId: group.id, permissions: data?.getGroupPermissions },
          ]);
        },
      });
    } else {
      removeGroup(group.id);
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

      {/* <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tab
          label="Groups & Permissions"
          sx={{
            textTransform: "none",
            color: " rgb(23, 119, 240);",
            fontWeight: "bolder",
          }}
        />
      </Box> */}

      <div className="userGroups"> {"Groups & Permissions"}</div>

      <div id="groups-permissions">
        <ChecklistComponent
          name="Select Groups"
          mapList={groupList}
          currentCheckedItems={currentGroupIDs}
          onChange={handleChange}
        />

        <div id="add-items">
          <div id="permission-header">
            <div> Permissions </div>
          </div>
          <div>
            {userPermissions?.map((group: GroupPermissionsDetails) => {
              return (
                <div key={group.groupId} id="permission-list">
                  {group?.permissions.map((permission: Permission) => {
                    return (
                      <Chip
                        id="item"
                        key={permission.id}
                        label={permission.name}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
