import { useState } from "react";

import { useQuery } from "@apollo/client";

import {
  styled,
  Box,
  Paper,
  Grid,
  Divider,
  Link,
  Chip,
  List,
  ListItem,
} from "@mui/material";

import {
  GET_USER,
  GET_USER_GROUPS,
  GET_USER_PERMISSIONS,
} from "../../services/queries";
import { User, Group, Permission } from "../../../../types/user";

const Item = styled(Paper)(() => ({
  backgroundColor: "#fff",
  textAlign: "center",
}));

const Profile = () => {
  const [user, setUser] = useState<User>();
  const [userGroups, setUserGroups] = useState<Group[]>();
  const [userPermissions, setUserPermissions] = useState<Permission[]>();

  const { data, loading, refetch } = useQuery(GET_USER, {
    //Replace with userId
    variables: { id: "324a43e0-e919-4394-b171-a8a2e3c72807" },
    onCompleted: (data) => {
      setUser(data?.getUser);
    },
  });

  const {
    data: groupsData,
    loading: groupsLoading,
    refetch: groupsRefetch,
  } = useQuery(GET_USER_GROUPS, {
    //Replace with userId
    variables: { id: "324a43e0-e919-4394-b171-a8a2e3c72807" },
    onCompleted: (data) => {
      setUserGroups(data?.getUserGroups);
    },
  });

  const {
    data: permissionsData,
    loading: permissionsLoading,
    refetch: permissionsRefetch,
  } = useQuery(GET_USER_PERMISSIONS, {
    //Replace with userId
    variables: { id: "324a43e0-e919-4394-b171-a8a2e3c72807" },
    onCompleted: (data) => {
      setUserPermissions(data?.getUserPermissions);
    },
  });

  const testRoles = ["admin", "test", "dev"];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2} className="grid">
        <Grid item sm={12} md={4}>
          <Item elevation={0} className="grid-item1">
            <div className="box1">
              <div className="box2">
                <div className="name">
                  {`${user?.firstName}
                   ${user?.middleName || ""} 
                  ${user?.lastName || ""}`}
                </div>
                <Link underline="none" className="link">
                  {user?.email}
                </Link>
              </div>
            </div>
            <Divider flexItem />
            <div className="contact">
              <div>Contact No:</div>
              <div>{user?.phone}</div>
            </div>
          </Item>
        </Grid>
        <Divider orientation="vertical" flexItem light />
        <Grid item sm={10} md={7}>
          <Item className="grid-item2" elevation={0}>
            <div className="roles">
              <div>Roles</div>
              <div className="items">
                {testRoles.map((role, index) => (
                  <Chip
                    label={role}
                    sx={{ marginRight: 2, marginBottom: 1 }}
                    key={index}
                    color="primary"
                  />
                ))}
              </div>
            </div>
            <Divider flexItem />
            <div className="group-permissions">
              <div>Role Groups</div>
              <div className="items">
                {userGroups?.map((group, index) => (
                  <Chip
                    label={group?.name}
                    sx={{ marginRight: 2, marginBottom: 1 }}
                    key={index}
                    color="primary"
                  />
                ))}
              </div>
            </div>
            <Divider flexItem />
            <div className="group-permissions">
              <div>Permissions</div>
              <div className="items">
                <List sx={{ listStyleType: "disc", paddingLeft: 2 }}>
                  {userPermissions?.map((permission, index) => (
                    <ListItem
                      sx={{
                        display: "list-item",
                      }}
                      key={index}
                    >
                      {permission?.name}
                    </ListItem>
                  ))}
                </List>
              </div>
            </div>
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
