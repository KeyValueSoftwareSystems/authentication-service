import { useEffect, useState } from "react";

import { useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { FieldValues } from "react-hook-form";
import { useRecoilState, useRecoilValue } from "recoil";
import { Box, Tab, Tabs, Typography, Grid, Divider } from "@mui/material";

import {
  GET_ROLES,
  GET_ROLE_PERMISSIONS,
} from "../../../roles/services/queries";
import {
  CREATE_GROUP,
  UPDATE_GROUP,
  UPDATE_GROUP_PERMISSIONS,
  UPDATE_GROUP_ROLES,
} from "../../services/mutations";

import "./styles.css";
import GroupForm from "./GroupForm";
import { GET_GROUP, GET_GROUP_PERMISSIONS } from "../../services/queries";
import { ChecklistComponent } from "../../../../components/checklist/CheckList";
import { Role } from "../../../../types/role";
import apolloClient from "../../../../services/apolloClient";
import PermissionTabs from "../../../../components/tabs/PermissionTabs";
import { Entity, EntityPermissionsDetails } from "../../../../types/generic";
import FilterChips from "../../../../components/filter-chips/FilterChips";
import { Permission, User } from "../../../../types/user";
import { Group } from "../../../../types/group";
import { allUsersAtom } from "../../../../states/userStates";
import UserCard from "./Usercard";
import {
  apiRequestAtom,
  toastMessageAtom,
} from "../../../../states/apiRequestState";

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

const CreateOrEditGroup = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [apiSuccess, setApiSuccess] = useRecoilState(apiRequestAtom);
  const [toastMessage, setToastMessage] = useRecoilState(toastMessageAtom);
  const [value, setValue] = useState(0);
  const [group, setGroup] = useState<Group>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [entityPermissions, setEntityPermissions] = useState<
    EntityPermissionsDetails[]
  >([]);
  const [users, setUsers] = useState<User[]>([]);

  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const allUsers = useRecoilValue(allUsersAtom);
  const [status, setStatus] = useState<boolean>(false);

  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    []
  );

  const [updateGroup, { data: updatedGroupData }] = useMutation(UPDATE_GROUP, {
    onError: () => {
      setApiSuccess(false);
      setToastMessage("The request could not be processed");
    },
  });
  const [createGroup, { data: createdGroupData }] = useMutation(CREATE_GROUP, {
    onError: () => {
      setApiSuccess(false);
      setToastMessage("The request could not be processed");
    },
  });
  const [updateGroupRoles, { data: updatedGroupRolesData }] = useMutation(
    UPDATE_GROUP_ROLES,
    {
      onError: () => {
        setApiSuccess(false);
        setToastMessage("The request could not be processed");
      },
    }
  );
  const [updateGroupPermissions, { data: updatedGroupPermissionsData }] =
    useMutation(UPDATE_GROUP_PERMISSIONS, {
      onError: () => {
        setApiSuccess(false);
        setToastMessage("The request could not be processed");
      },
    });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const { data: roleData } = useQuery(GET_ROLES, {
    onCompleted: (data) => {
      setAllRoles(data?.getRoles);
    },
  });

  const { loading } = useQuery(GET_GROUP, {
    skip: !id,
    fetchPolicy: "network-only",
    variables: { id: id },
    onCompleted: (data) => {
      setGroup(data?.getGroup);
      setRoles([...roles, ...data?.getGroup?.roles]);
      setUsers([...users, ...data?.getGroup?.users]);
    },
  });

  useQuery(GET_GROUP_PERMISSIONS, {
    skip: !id,
    variables: { id },
    onCompleted: (data) => {
      const permissionList = data?.getGroupPermissions;
      setSelectedPermissions(permissionList);
    },
  });

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

  const removeItem = ({
    roleId,
    userId,
  }: {
    roleId?: string;
    userId?: string;
  }) => {
    if (roleId) {
      setRoles(roles.filter((role: Role) => role.id !== roleId));
      setEntityPermissions(
        entityPermissions.filter(
          (entityObj: EntityPermissionsDetails) => entityObj.id !== roleId
        )
      );
    }

    if (userId) {
      setUsers(users.filter((user: User) => user.id !== userId));
    }
  };

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    item?: Entity
  ) => {
    const value = event.target.value;

    if (event.target.checked) {
      if (value === "all") {
        setRoles(allRoles);
        return;
      }
      if (item) {
        handlePermissions(item);
        if (roles[0] === null) {
          setRoles([item]);
        } else {
          setRoles([...roles, item]);
        }
      }
    } else {
      if (value === "all") {
        setRoles([]);
        setEntityPermissions([]);
        return;
      }
      removeItem({ roleId: item?.id as string });
    }
  };

  const onChangeUsers = (
    event: React.ChangeEvent<HTMLInputElement>,
    item: User
  ) => {
    const value = event.target.value;

    if (event.target.checked) {
      if (value === "all") {
        setUsers(allUsers);
        return;
      }
      if (users[0] === null) {
        setUsers([item]);
      } else {
        setUsers([...users, item]);
      }
    } else {
      if (value === "all") {
        setUsers([]);
        return;
      }
      removeItem({ userId: item?.id as string });
    }
  };

  const onCreateGroup = (inputs: FieldValues) => {
    createGroup({
      variables: {
        input: inputs,
      },
    });
  };

  useEffect(() => {
    if (createdGroupData) {
      updateGroup({
        variables: {
          id: createdGroupData?.createGroup?.id,
          input: { users: users.map((user) => user.id) },
        },
      });

      updateGroupRoles({
        variables: {
          id: createdGroupData?.createGroup?.id,
          input: { roles: roles.map((role) => role.id) },
        },
      });

      updateGroupPermissions({
        variables: {
          id: createdGroupData?.createGroup?.id,
          input: {
            permissions: selectedPermissions.map((permission) => permission.id),
          },
        },
      });
    }
  }, [createdGroupData]);

  useEffect(() => {
    if ((createdGroupData && updatedGroupData) || updatedGroupData) {
      if (updatedGroupRolesData && updatedGroupPermissionsData) {
        navigate("/home/groups");
        setApiSuccess(true);
        createdGroupData
          ? setToastMessage("Group has been successfully created")
          : setToastMessage("Group has been successfully updated");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    createdGroupData,
    updatedGroupData,
    updatedGroupRolesData,
    updatedGroupPermissionsData,
  ]);

  const onEditGroup = (inputs: FieldValues) => {
    updateGroup({
      variables: {
        id: id,
        input: { name: inputs.name, users: users.map((user) => user.id) },
      },
    });

    updateGroupRoles({
      variables: {
        id: id,
        input: { roles: roles.map((role) => role.id) },
      },
    });

    updateGroupPermissions({
      variables: {
        id: id,
        input: {
          permissions: selectedPermissions.map((permission) => permission.id),
        },
      },
    });
  };

  useEffect(() => {
    if (
      (entityPermissions.length === 0 && !status) ||
      allRoles?.length === roles?.length
    ) {
      roles.forEach((role) => handlePermissions(role));
    }
  }, [roles]);

  const handlePermissions = async (role: Role) => {
    setStatus(true);
    try {
      const response = await apolloClient.query({
        query: GET_ROLE_PERMISSIONS,
        variables: {
          id: role.id,
        },
      });
      if (response?.data?.getRolePermissions) {
        if (!entityPermissions.some((entityObj) => entityObj.id === role.id))
          setEntityPermissions((previousState) => [
            ...previousState,
            {
              id: role.id,
              name: role.name,
              permissions: response?.data?.getRolePermissions,
            },
          ]);
      }
    } finally {
      setStatus(false);
    }
  };
  return (
    <div className="access-settings">
      {!loading && (
        <GroupForm
          name={group?.name as string}
          createGroup={onCreateGroup}
          editGroup={onEditGroup}
        />
      )}
      <div>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            width: "98.7%",
          }}
        >
          <Tabs value={value} onChange={handleChange}>
            <Tab
              label="Roles"
              sx={{ textTransform: "none", fontSize: "18px" }}
            />
            <Tab
              label="Permissions"
              sx={{ textTransform: "none", fontSize: "18px" }}
            />
            <Tab
              label="Members"
              sx={{ textTransform: "none", fontSize: "18px" }}
            />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Grid container spacing={1} width="100%">
            <Grid item xs={10} lg={5}>
              <div>
                <div className="header">Roles</div>
              </div>
              {!loading && (
                <ChecklistComponent
                  mapList={roleData?.getRoles}
                  currentCheckedItems={roles}
                  name="Select roles"
                  onChange={onChange}
                />
              )}
            </Grid>
            <Divider orientation="vertical" flexItem sx={{ marginLeft: 2 }} />
            <Grid item xs={10} lg={6.7} sx={{ paddingLeft: 5 }}>
              <div className="header">
                Permissions summary of selected roles
              </div>
              <PermissionTabs permissions={entityPermissions} />
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <FilterChips
            selectedPermissions={selectedPermissions}
            handleClick={handleClick}
          />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <div className="add-members">
            <Grid container spacing={1} width="100%">
              <Grid item xs={10} lg={5}>
                <ChecklistComponent
                  mapList={allUsers}
                  currentCheckedItems={users}
                  name="Select members"
                  onChange={onChangeUsers}
                />
              </Grid>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ marginRight: 2 }}
              />
              <Grid item xs={10} lg={6.7}>
                <div style={{ fontSize: "16px", marginBottom: "10px" }}>
                  Group Members:
                </div>
                <div className="user-cards">
                  {users.map((user, index) => (
                    <UserCard
                      user={user}
                      onRemoveUser={removeItem}
                      key={index}
                    />
                  ))}
                </div>
              </Grid>
            </Grid>
          </div>
        </TabPanel>
      </div>
    </div>
  );
};

export default CreateOrEditGroup;
