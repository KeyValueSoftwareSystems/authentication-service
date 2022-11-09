import { useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import {
  Outlet,
  Navigate,
  useNavigate,
  NavLink,
  useLocation,
} from "react-router-dom";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import Diversity3OutlinedIcon from "@mui/icons-material/Diversity3Outlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useSetRecoilState } from "recoil";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import {
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { useRecoilState } from "recoil";

import { LOGO_URL } from "../../config";
import CustomerAuth from "../../services/auth";
import "./styles.css";
import { LOGOUT } from "../auth/services/mutations";
import { GET_USERS } from "../users/services/queries";
import { allUsersAtom } from "../../states/userStates";
import { currentUserAtom } from "../../states/loginStates";
import { stringAvatar, stringToColor } from "../../utils/table";
import Toast from "../../components/toast";
import { toastMessageAtom } from "../../states/apiRequestState";

const HomePage = () => {
  const [toastMessage, setToastMessage] = useRecoilState(toastMessageAtom);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const navigate = useNavigate();

  const setUsers = useSetRecoilState(allUsersAtom);

  useQuery(GET_USERS, {
    onCompleted: (data) => {
      setUsers(data?.getUsers);
    },
  });
  const [currentUserDetails] = useRecoilState(currentUserAtom);

  const [logout] = useMutation(LOGOUT, {
    onCompleted: () => {
      CustomerAuth.clearTokens();
      navigate("/login");
    },
  });

  const onLogout = () => {
    logout();
  };

  const onCloseToast = () => {
    setToastMessage("");
  };

  return (
    <>
      <div className="wrapperContainer">
        <div className="navBar">
          <div className="navLogo">
            <img alt="logo" src={LOGO_URL} />
          </div>
          <div className="userdetails">
            <Avatar
              {...stringAvatar(
                `${currentUserDetails.firstName} ${currentUserDetails.lastName}`?.toUpperCase()
              )}
            />
            <Tooltip title="Account Details">
              <IconButton className="navbar-avatar" onClick={handleClick}>
                <ArrowDropDownOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              className="menu-styles"
              PaperProps={{
                elevation: 0,
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem>
                <Avatar
                  {...stringAvatar(
                    `${currentUserDetails.firstName} ${currentUserDetails.lastName}`?.toUpperCase()
                  )}
                  sx={{
                    marginLeft: "0px !important",
                    bgcolor: stringToColor(
                      `${currentUserDetails.firstName} ${currentUserDetails.lastName}`?.toUpperCase()
                    ),
                  }}
                />
                <div>
                  <div className="user-name">{`${currentUserDetails.firstName} ${currentUserDetails.lastName}`}</div>
                  <div className="user-email">{currentUserDetails.email}</div>
                </div>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  navigate(`./users/${currentUserDetails.id}`);
                }}
                sx={{ color: "#6d6d6d" }}
              >
                <AccountCircleOutlinedIcon className="details-icon" />
                View Profile
              </MenuItem>
              <MenuItem onClick={onLogout} sx={{ color: "#6d6d6d" }}>
                <LogoutOutlinedIcon className="details-icon" />
                Logout
              </MenuItem>
            </Menu>
          </div>
        </div>

        <div className="body">
          <div className="sideBar">
            <nav>
              <div className="sideBarContainer">
                <NavLink
                  to="/home/users"
                  className={({ isActive }) =>
                    isActive ? "active-text-link" : "text-link"
                  }
                >
                  <PeopleAltOutlinedIcon className="icon" />
                  USERS
                </NavLink>
                <NavLink
                  to="/home/groups"
                  className={({ isActive }) =>
                    isActive ? "active-text-link" : "text-link"
                  }
                >
                  <Diversity3OutlinedIcon className="icon" />
                  GROUPS
                </NavLink>

                <NavLink
                  to="/home/roles"
                  className={({ isActive }) =>
                    isActive ? "active-text-link" : "text-link"
                  }
                >
                  <WorkOutlineOutlinedIcon className="icon" />
                  ROLES
                </NavLink>

                <NavLink
                  to="/home/permissions"
                  className={({ isActive }) =>
                    isActive ? "active-text-link" : "text-link"
                  }
                >
                  <LockOutlinedIcon className="icon" />
                  PERMISSIONS
                </NavLink>
              </div>
            </nav>
          </div>

          <div className="outlet">
            {CustomerAuth?.isAuthenticated ? (
              <Outlet />
            ) : (
              <Navigate replace to="/login" />
            )}
          </div>
          <Toast
            message={toastMessage}
            isOpen={Boolean(toastMessage)}
            handleClose={onCloseToast}
          />
        </div>
      </div>
    </>
  );
};

export default HomePage;
