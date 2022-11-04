import { useEffect, useState } from "react";

import { useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { FieldValues } from "react-hook-form";

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
import { GET_GROUP_PERMISSIONS, GET_GROUP_ROLES } from "../../services/queries";
import { ChecklistComponent } from "../../../../components/checklist/CheckList";
import { Role } from "../../../../types/role";
import apolloClient from "../../../../services/apolloClient";
import PermissionTabs from "../../../../components/tabs/PermissionTabs";
import FilterChips from "../../../../components/filter-chips/FilterChips";
import { Permission } from "../../../../types/user";
import { Entity, EntityPermissionsDetails } from "../../../../types/generic";

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

  const [value, setValue] = useState(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<EntityPermissionsDetails[]>(
    []
  );
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [status, setStatus] = useState<boolean>(false);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    []
  );

  const [updateGroup, { data: updatedGroupData }] = useMutation(UPDATE_GROUP);
  const [createGroup, { data: createdGroupData }] = useMutation(CREATE_GROUP);
  const [updateGroupRoles, { data: updatedGroupRolesData }] =
    useMutation(UPDATE_GROUP_ROLES);
  const [updateGroupPermissions, { data: updatedGroupPermissionsData }] =
    useMutation(UPDATE_GROUP_PERMISSIONS);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const { data: roleData } = useQuery(GET_ROLES, {
    onCompleted: (data) => {
      setAllRoles(data?.getRoles);
    },
  });

  const { loading: groupRolesloading } = useQuery(GET_GROUP_ROLES, {
    skip: !id,
    variables: { id: id },
    onCompleted: (data) => {
      setRoles([...roles, ...data.getGroupRoles]);
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

  const removeItem = (item: string) => {
    setRoles(roles.filter((role: Role) => role.id !== item));
    setPermissions(
      permissions.filter(
        (permission: EntityPermissionsDetails) => permission.id !== item
      )
    );
  };

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    item?: Entity
  ) => {
    const value = event.target.value;

    if (event.target.checked) {
      if (value === "all") {
        setSelectAll(true);
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
        setSelectAll(false);
        setRoles([]);
        setPermissions([]);
        return;
      }
      removeItem(item?.id as string);
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
    if (createdGroupData || updatedGroupData)
      if (updatedGroupRolesData && updatedGroupPermissionsData) {
        navigate("/home/groups", {
          state: {
            message: createdGroupData
              ? "Group has been successfully created"
              : "Group has been successfully updated",
          },
        });
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
        input: inputs,
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
    if (permissions.length === 0 || selectAll)
      roles.forEach((role) => handlePermissions(role));
  }, [roles]);

  useEffect(() => {
    if (allRoles?.length === roles?.length) {
      setSelectAll(true);
    } else setSelectAll(false);
  }, [allRoles, roles]);

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
        setPermissions((previousState) => [
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
      <GroupForm createGroup={onCreateGroup} editGroup={onEditGroup} />
      <div>
        <Box sx={{ borderBottom: 1, borderColor: "divider", display: "flex" }}>
          <Tabs value={value} onChange={handleChange}>
            <Tab
              label="Roles"
              sx={{ textTransform: "none", fontSize: "18px" }}
            />
            <Tab
              label="Permissions"
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
              {!groupRolesloading && (
                <ChecklistComponent
                  mapList={roleData?.getRoles}
                  currentCheckedItems={roles}
                  name="Select roles"
                  onChange={onChange}
                  selectAll={selectAll}
                />
              )}
            </Grid>
            <Divider orientation="vertical" flexItem sx={{ marginLeft: 2 }} />
            <Grid item xs={10} lg={6.7} sx={{ paddingLeft: 5 }}>
              <div className="header">
                Permissions summary of selected roles
              </div>
              <PermissionTabs permissions={permissions} />
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <FilterChips
            selectedPermissions={selectedPermissions}
            handleClick={handleClick}
          />
        </TabPanel>
      </div>
    </div>
  );
};

export default CreateOrEditGroup;
