import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";

import "./styles.css";

import Profile from "./Profile";

const UserDetails = () => {
  const navigate = useNavigate();

  const onBackNavigation = (e: React.MouseEvent<HTMLElement>) => {
    navigate("/home/users");
  };

  return (
    <div className="cntr">
      <div className="user-details">
        <div className="user-details-header">
          <div className="user-details-title">USER DETAILS</div>
          <IconButton onClick={onBackNavigation}>
            <ArrowBackIcon />
          </IconButton>
        </div>
        <div>
          <Profile />
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
