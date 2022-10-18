import { useState } from "react";

import { useQuery } from "@apollo/client";

import { styled, Box, Paper, Grid, Divider, Link, Chip } from "@mui/material";

import {
  GET_USER,
  GET_USER_GROUPS,
  GET_USER_PERMISSIONS,
} from "../../services/queries";
import { User, Group, Permission } from "../../../../types/user";
import { useParams } from "react-router-dom";
import "./styles.css";

const Item = styled(Paper)(() => ({
  backgroundColor: "#fff",
  textAlign: "center",
}));

const Profile = () => {
  const { id } = useParams();

  const [user, setUser] = useState<User>();
  const [userGroups, setUserGroups] = useState<Group[]>();
  const [userPermissions, setUserPermissions] = useState<Permission[]>();

  useQuery(GET_USER, {
    variables: { id: id },
    onCompleted: (data) => {
      setUser(data?.getUser);
    },
  });

  useQuery(GET_USER_GROUPS, {
    variables: { id: id },
    onCompleted: (data) => {
      setUserGroups(data?.getUserGroups);
    },
  });

  useQuery(GET_USER_PERMISSIONS, {
    variables: { id: id },
    onCompleted: (data) => {
      setUserPermissions(data?.getUserPermissions);
    },
  });

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
              <div style={{ fontWeight: 600 }}>Contact No:</div>
              <div>{user?.phone}</div>
            </div>
            <Divider flexItem />
            <div className="contact">
              <div style={{ fontWeight: 600 }}>Status:</div>
              {/* To integrate with status api */}
              <Chip
                label={"Active"}
                sx={{ fontSize: "20px", background: "#D3F4BE" }}
              />
            </div>
            <Divider
              flexItem
              className="divider-horizontal"
              sx={{ marginTop: 1 }}
            />
          </Item>
        </Grid>
        <Divider
          orientation="vertical"
          flexItem
          light
          className="divider-vertical"
        />
        <Grid item sm={10} md={7}>
          <Item className="grid-item2" elevation={0}>
            <div className="user-groups">
              <div>Groups</div>
              <div className="items">
                {userGroups?.map((group, index) => (
                  <Chip label={group?.name} className="chip" key={index} />
                ))}
              </div>
            </div>
            <Divider flexItem />
            <div className="user-permissions">
              <div>Permissions</div>
              <div className="items">
                {userPermissions?.map((permission, index) => (
                  <Chip label={permission?.name} key={index} className="chip" />
                ))}
              </div>
            </div>
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
