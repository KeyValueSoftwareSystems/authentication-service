import { useEffect, useState } from "react";

import { useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { FieldValues } from "react-hook-form";

import { Box, Tab, Tabs, Typography, Grid, Divider, Chip } from "@mui/material";

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
import { GET_GROUP_ROLES } from "../../services/queries";
import { getUniquePermissions } from "../../../../utils/permissions";
import { ChecklistComponent } from "../../../../components/checklist/CheckList";
import {
  Permission,
  RolePermissionsDetails,
} from "../../../../types/permission";
import { Role } from "../../../../types/role";
import apolloClient from "../../../../services/apolloClient";

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
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<RolePermissionsDetails[]>([]);
  const [allRoles, setAllRoles] = useState<string[]>([]);
  const [status, setStatus] = useState<boolean>(false);
  const [selectAll, setSelectAll] = useState<boolean>(false);

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
      const roleIds = data?.getRoles.map((role: Role) => role.id);
      setAllRoles([...roleIds]);
    },
  });

  const { loading: groupRolesloading } = useQuery(GET_GROUP_ROLES, {
    skip: !id,
    variables: { id: id },
    onCompleted: (data) => {
      const groupRoleIds = data?.getGroupRoles?.map((item: Role) => item.id);
      setRoles([...roles, ...groupRoleIds]);
    },
  });

  const removeItem = (item: string) => {
    const itemIndex = roles.findIndex((e: string) => e === item);
    setRoles([...roles.slice(0, itemIndex), ...roles.slice(itemIndex + 1)]);
    const permissionIndex = permissions.findIndex(
      (e: RolePermissionsDetails) => e.roleId === item
    );
    setPermissions([
      ...permissions.slice(0, permissionIndex),
      ...permissions.slice(permissionIndex + 1),
    ]);
  };

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    item?: Role
  ) => {
    const value = event.target.value;

    if (event.target.checked) {
      if (value === "all") {
        setSelectAll(true);
        setRoles(allRoles);
        return;
      }
      handlePermissions(item?.id as string);
      if (roles[0] === null) {
        setRoles([item?.id as string]);
      } else {
        setRoles([...roles, item?.id as string]);
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
          input: { roles: roles },
        },
      });

      updateGroupPermissions({
        variables: {
          id: createdGroupData?.createGroup?.id,
          input: { permissions: getUniquePermissions(permissions) },
        },
      });
    }
  }, [createdGroupData]);

  useEffect(() => {
    if (createdGroupData || updatedGroupData)
      if (updatedGroupRolesData && updatedGroupPermissionsData) {
        navigate("/home/groups");
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
        input: { roles: roles },
      },
    });

    updateGroupPermissions({
      variables: {
        id: id,
        input: { permissions: getUniquePermissions(permissions) },
      },
    });
  };

  useEffect(() => {
    if (permissions.length === 0 || selectAll)
      roles.forEach((role) => handlePermissions(role));
  }, [roles]);

  useEffect(() => {
    if (allRoles.length === roles.length) {
      setSelectAll(true);
    } else setSelectAll(false);
  }, [allRoles, roles]);

  const handlePermissions = async (role: string) => {
    setStatus(true);
    try {
      const response = await apolloClient.query({
        query: GET_ROLE_PERMISSIONS,
        variables: {
          id: role,
        },
      });

      if (response?.data?.getRolePermissions) {
        const currentPermissions = permissions;
        if (
          !currentPermissions.some((permission) => permission.roleId === role)
        ) {
          currentPermissions.push({
            roleId: role as string,
            permissions: response?.data?.getRolePermissions,
          });
          setPermissions([...currentPermissions]);
        }
      }
    } finally {
      setStatus(false);
    }
  };

  return (
    <div className="access-settings">
      <GroupForm createGroup={onCreateGroup} editGroup={onEditGroup} />
      {/* <div>Access Settings and Users</div> */}
      <div>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleChange}>
            <Tab
              label="Roles & Permissions"
              sx={{ textTransform: "none", fontSize: "18px" }}
            />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Grid container spacing={1}>
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
            <Grid item xs={10} lg={6} sx={{ paddingLeft: 5 }}>
              <div className="header">
                Permissions summary of selected roles
              </div>
              <div className="chips">
                {permissions?.map((permission, index) =>
                  permission?.permissions?.map(
                    (item: Permission, index: number) => (
                      <Chip
                        label={item.name}
                        key={index}
                        className="permission-chip"
                      />
                    )
                  )
                )}
              </div>
            </Grid>
          </Grid>
        </TabPanel>
      </div>
    </div>
  );
};

export default CreateOrEditGroup;
