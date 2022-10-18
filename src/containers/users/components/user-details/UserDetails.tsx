import { useState, FC } from "react";

import { Tabs, Tab, Box, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import "./styles.css";

import Profile from "./Profile";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: FC<TabPanelProps> = (props: TabPanelProps) => {
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
};

const UserDetails = () => {
  const [value, setValue] = useState(0);
  const navigate = useNavigate();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const onBackNavigation = (e: any) => {
    navigate("/home/users");
  };

  return (
    <div className="cntr">
      <div className="user-details">
        <div className="back-arrow" onClick={onBackNavigation}>
          <ArrowBackIcon />
        </div>
        <Box className="tabs">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={value} onChange={handleChange}>
              <Tab label="User Details" />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <Profile />
          </TabPanel>
        </Box>
      </div>
    </div>
  );
};

export default UserDetails;
