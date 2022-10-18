
import { useMutation } from "@apollo/client";
import { Outlet, Navigate, useNavigate, NavLink } from "react-router-dom";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import Diversity3OutlinedIcon from "@mui/icons-material/Diversity3Outlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Button } from "@mui/material";

import { LOGO_URL } from "../../config";
import CustomerAuth from "../../services/auth";
import "./styles.css";
import { LOGOUT } from "../auth/services/mutations";


const HomePage = () => {
  const navigate = useNavigate();

  const [logout] = useMutation(LOGOUT, {
    onCompleted: () => {
      CustomerAuth.clearTokens();
      navigate("/login");
    },
  });

  const onLogout = () => {
    logout();
  };
  return (
    <>
      <div className="wrapperContainer">
        <div className="navBar">
          <div className="navLogo">
            <img alt="logo" src={LOGO_URL} />
          </div>
          <div className="logout">
            <Button
              variant="outlined"
              onClick={onLogout}
              sx={{ textTransform: "none" }}
            >
              Logout
            </Button>
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
        </div>
      </div>
    </>
  );
};

export default HomePage;
