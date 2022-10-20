import * as React from "react";
import { styled } from "@mui/system";
import TabsUnstyled from "@mui/base/TabsUnstyled";
import TabsListUnstyled from "@mui/base/TabsListUnstyled";
import { buttonUnstyledClasses } from "@mui/base/ButtonUnstyled";
import TabUnstyled, { tabUnstyledClasses } from "@mui/base/TabUnstyled";
import { GroupPermissionsDetails } from "../../../../types/permission";
import { Chip } from "@mui/material";

interface StyledTabsProps {
  userPermissions: GroupPermissionsDetails[];
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
    color: #007aff;
  }

  &.${buttonUnstyledClasses.disabled} {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabsList = styled(TabsListUnstyled)(`
  min-width: 400px;
  margin-top:10px;
  background-color: #fff ;
  border-radius: 12px;
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  `);

const StyledTabs: React.FC<StyledTabsProps> = ({ userPermissions }) => {
  const [filteredPermission, setFilteredPermission] = React.useState<any[]>([]);
  React.useEffect(() => {
    getUniquePermissionNames();
  }, [userPermissions]);

  const getUniquePermissionNames = () => {
    console.log(userPermissions);
    const uniquePermissions: string[] = [];
    userPermissions.forEach((group) => {
      group.permissions.forEach((item) => {
        uniquePermissions.push(item.name);
      });
    });
    setFilteredPermission([...Array.from(new Set(uniquePermissions))]);
  };

  const displayGroup = (tag: any) => {
    const uniquePermissions: string[] = [];

    if (tag === "overall") {
      getUniquePermissionNames();
    } else {
      userPermissions.forEach((group_permissions) => {
        if (group_permissions.groupName === tag) {
          group_permissions.permissions.forEach((permission) => {
            uniquePermissions.push(permission.name);
          });
        }
      });
      setFilteredPermission([...uniquePermissions]);
      console.log(filteredPermission);
    }
    return;
  };

  return (
    <TabsUnstyled defaultValue={0}>
      <TabsList>
        {userPermissions.length && (
          <Tab onClick={() => displayGroup("overall")}>Overall Permissions</Tab>
        )}
        {userPermissions.map((item) => (
          <Tab onClick={() => displayGroup(item.groupName)}>
            {item.groupName}
          </Tab>
        ))}
      </TabsList>
      <div id="permission-list">
        {filteredPermission?.map((permission) => {
          return <Chip id="item" label={permission} />;
        })}
      </div>
    </TabsUnstyled>
  );
};

export default StyledTabs;
