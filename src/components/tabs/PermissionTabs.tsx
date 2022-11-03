import * as React from "react";
import { styled } from "@mui/system";
import TabsUnstyled from "@mui/base/TabsUnstyled";
import TabsListUnstyled from "@mui/base/TabsListUnstyled";
import TabPanelUnstyled from "@mui/base/TabPanelUnstyled";
import { buttonUnstyledClasses } from "@mui/base/ButtonUnstyled";
import TabUnstyled, { tabUnstyledClasses } from "@mui/base/TabUnstyled";
import { Chip } from "@mui/material";

import { getOverallPermissions } from "../../utils/permissions";
import "./styles.css";
import { EntityPermissionsDetails } from "../../types/generic";
import { Permission } from "../../types/user";

interface StyledTabsProps {
  permissions: EntityPermissionsDetails[];
}

const Tab = styled(TabUnstyled)`
  font-family: IBM Plex Sans, sans-serif;
  color: black;
  cursor: pointer;
  font-size: 14px;
  font-weight: 400;
  background-color: #dcdcdc;
  padding: 10px 12px;
  margin: 6px 6px;
  border: none;
  border-radius: 7px;
  display: flex;
  justify-content: center;

  &:hover {
    background-color: #00bfff;
    color: #fff;
  }

  &:focus {
    color: #fff;
  }

  &.${tabUnstyledClasses.selected} {
    background-color: #00bfff;
    color: #fff;
  }

  &.${buttonUnstyledClasses.disabled} {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabPanel = styled(TabPanelUnstyled)(`
  width: 100%;
  font-family: IBM Plex Sans, sans-serif;
  font-size: 0.875rem;
  padding: 20px 12px;
  opacity: 0.6;
  `);

const TabsList = styled(TabsListUnstyled)(`
  min-width: 400px;
  background-color: #fff ;
  border-radius: 12px;
  display: flex;
  flex-wrap: wrap;
  `);

const PermissionTabs: React.FC<StyledTabsProps> = ({ permissions }) => {
  const [currentTab, setCurrentTab] = React.useState<any>(0);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: any
  ) => {
    setCurrentTab(value);
  };

  const getOverallPermissionsValues = () => {
    return (
      <div id="permission-list">
        {getOverallPermissions(permissions)?.map((permission) => (
          <Chip label={permission} className="permission-chip" />
        ))}
      </div>
    );
  };

  const getPermissionsValues = (permissions: Permission[]) => {
    return (
      <div id="permission-list">
        {permissions.map((p: Permission) => (
          <Chip label={p?.name} className="permission-chip" />
        ))}
      </div>
    );
  };
  return (
    <TabsUnstyled defaultValue={0} value={currentTab} onChange={handleChange}>
      <TabsList>
        {permissions.length && <Tab>Overall Permissions</Tab>}
        {permissions.map((item) => (
          <Tab>{item.name}</Tab>
        ))}
      </TabsList>
      <TabPanel value={0}>{getOverallPermissionsValues()}</TabPanel>
      {permissions.map((p, index) => (
        <TabPanel value={index + 1}>
          {getPermissionsValues(p?.permissions)}
        </TabPanel>
      ))}
    </TabsUnstyled>
  );
};

export default PermissionTabs;
