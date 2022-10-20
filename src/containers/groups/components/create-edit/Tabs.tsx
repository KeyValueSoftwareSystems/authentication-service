import * as React from "react";
import { styled } from "@mui/system";
import TabsUnstyled from "@mui/base/TabsUnstyled";
import TabsListUnstyled from "@mui/base/TabsListUnstyled";
import TabPanelUnstyled from "@mui/base/TabPanelUnstyled";
import { buttonUnstyledClasses } from "@mui/base/ButtonUnstyled";
import TabUnstyled, { tabUnstyledClasses } from "@mui/base/TabUnstyled";
import { RolePermissionsDetails } from "../../../../types/permission";
import { getOverallPermissions } from "../../../../utils/permissions";
import { Chip } from "@mui/material";

interface StyledTabsProps {
  permissions: RolePermissionsDetails[];
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
  }

  &:focus {
    color: #fff;
  }

  &.${tabUnstyledClasses.selected} {
    background-color: aliceBlue;
    color: black;
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
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  align-content: space-between;
  `);

const StyledTabs: React.FC<StyledTabsProps> = ({ permissions }) => {
  console.log(permissions);

  // const getOverallPermissionsValues = () => {
  //   return getOverallPermissions(permissions).map((permission) => {
  //     <Chip>{permission}</Chip>;
  //   });
  // };

  return (
    <TabsUnstyled defaultValue={0}>
      <TabsList>
        {permissions.length && <Tab>Overall Permissions</Tab>}
        {permissions.map((item) => (
          <Tab>{item.roleName}</Tab>
        ))}
      </TabsList>
      <TabPanel value={0}>{}</TabPanel>
      <TabPanel value={1}>Profile page</TabPanel>
      <TabPanel value={2}>Language page</TabPanel>
    </TabsUnstyled>
  );
};

export default StyledTabs;
