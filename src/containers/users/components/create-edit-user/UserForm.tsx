import React, { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider, FieldValues } from "react-hook-form";
import { Box, Button, Chip, Tab } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  GET_GROUPS,
  GET_GROUP_PERMISSIONS,
} from "../../../groups/services/queries";
import { useLazyQuery, useQuery } from "@apollo/client";
import FormInputText from "../../../../components/inputText";
import { ChecklistComponent } from "../../../../components/checklist/CheckList";
import {
  GroupPermissionsDetails,
} from "../../../../types/permission";
import { GET_USER } from "../../services/queries";
import { Group, User } from "../../../../types/user";
import "./styles.css";
import apolloClient from "../../../../services/apolloClient";

const UserForm = (props: any) => {
  const {
    isEdit,
    updateUser,
    createUser,
    userformSchema,
    currentGroups,
  } = props;

  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();
  // const [userGroupIds, setUserGroupIds] = useState<string[]>([]);
  // const [groupList, setGroupList] = useState<Group[]>([]);

  const [userGroups,setUserGroups]=useState<Group[]>([]);

  const [userPermissions, setUserPermissions] = useState<
    GroupPermissionsDetails[]
  >([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
 
  const [filteredPermission, setFilteredPermission] = useState<any[]>([]);

  useEffect(() => {
    if(id){
    currentGroups.forEach((group: Group) => {
      handlePermissions(group.id);
    });
    setUserGroups(currentGroups);
  }
  }, [currentGroups]);
  

  const handlePermissions = async (group: string) => {
    const response = await apolloClient.query({
      query: GET_GROUP_PERMISSIONS,
      variables: {
        id: group,
      },
    });
    if (response) {
      const currentPermissions = userPermissions;
      if (
        !currentPermissions.some((permission) => permission.groupId === group)
      ) {
        currentPermissions.push({
          groupId: group,
          permissions: response?.data?.getGroupPermissions,
        });
      }
      setUserPermissions([...currentPermissions]);
    }
  };

  const { data: groupData } = useQuery(GET_GROUPS, {
    onCompleted: (data) => {
      const groups = data?.getGroups.map((group: Group) => group);
      setAllGroups([...groups]);
    },
  });

  useEffect(() => {
    getUniquePermissionNames();
  }, [userPermissions]);

  const { loading } = useQuery(GET_USER, {
    skip: !id,
    variables: { id: id },
    onCompleted: (data) => {
      setUser(data?.getUser);
    },
  });

  useEffect(() => {
    if (isEdit) setUserGroups(currentGroups);
  }, [isEdit, currentGroups]);

  const methods = useForm({
    resolver: yupResolver(userformSchema),
  });

  const { handleSubmit } = methods;

  const onSubmitForm = (inputs: FieldValues) => {
    isEdit
      ? updateUser(inputs, userGroups, userPermissions)
      : createUser(inputs, userGroups, userPermissions);
  };

  const [getGroupPermissionsData] = useLazyQuery(GET_GROUP_PERMISSIONS);

  const removeGroup = (group: Group) => {
    setUserGroups(
      userGroups.filter((groupDetails) => groupDetails.id !== group.id)
    );
    setUserPermissions(
      userPermissions.filter((permission) => permission.groupId !== group.id)
    );
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    group: Group
  ) => {
    const value = event.target.value;

    if (event.target.checked) {
      if (event.target.checked) {
        if (value === "all") {
          setUserGroups(allGroups);
          allGroups.forEach((group) => {
            handlePermissions(group.id);
          });
        } else {
          setUserGroups([...userGroups, group]);
        }
        getGroupPermissionsData({
          variables: { id: group.id },
          fetchPolicy: "no-cache",
          onCompleted: (data) => {
            setUserPermissions([
              ...userPermissions,
              { groupId: group.id, permissions: data?.getGroupPermissions },
            ]);
          },
        });
      }
    } else {
      if (value === "all") {
        setUserGroups([]);
        setUserPermissions([]);
      }
      removeGroup(group);
    }
  };

  const getUniquePermissionNames = () => {
    console.log(userPermissions)
    const uniquePermissions: string[] = []
     userPermissions.forEach((group) => 
     {
      group.permissions.forEach((item) => {
        uniquePermissions.push(item.name);
      })
     }
     )
   setFilteredPermission([...Array.from(new Set(uniquePermissions))])
}

  const displayGroup = (tag: any) => {
    const uniquePermissions: string[] = [];

    if (tag === "overall") {
      getUniquePermissionNames();
    }

    else {
      userPermissions.forEach((group_permissions) => {
        if (group_permissions.groupId === tag.id) {
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
    <div id="page">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div id="fixed">
            <div id="back-page">
              <ArrowBackIcon
                id="arrowicon"
                onClick={() => {
                  navigate("/home/users");
                }}
              />
              Users
            </div>

            <div id="title">
              <legend id="bold">{isEdit ? "Modify user" : "Add user"}</legend>
              <div id="add-cancel">
                <Button id="cancel">
                  <Link id="cancel" to="/home/users">
                    Cancel
                  </Link>
                </Button>
                <Button id="add" type="submit">
                  {isEdit ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </div>

          <div id="inputs">
            {!loading && (
              <div id="form-row">
                <FormInputText
                  name="firstName"
                  label="First name*"
                  type="text"
                  className="fields"
                  defaultText={user?.firstName}
                />
                <FormInputText
                  name="middleName"
                  label="Middle name"
                  type="text"
                  className="fields"
                  defaultText={user?.middleName}
                />
                <FormInputText
                  name="lastName"
                  label="Last Name*"
                  type="type"
                  className="fields"
                  defaultText={user?.lastName}
                />
              </div>
            )}
            {!isEdit && (
              <div id="form-row">
                <FormInputText
                  name="email"
                  label="Email*"
                  type="text"
                  className="fields"
                />
                <FormInputText
                  name="phone"
                  label="Phone Number"
                  type="text"
                  className="fields"
                />
                <FormInputText
                  name="password"
                  label="Password*"
                  type="password"
                  className="fields"
                />
              </div>
            )}
          </div>
        </form>
      </FormProvider>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tab
          label="Groups & Permissions"
          sx={{
            textTransform: "none",
            color: " rgb(23, 119, 240);",
            fontWeight: "bolder",
          }}
        />
      </Box>

      <div id="groups-permissions">
        <ChecklistComponent
          name="Select Groups"
          mapList={groupData?.getGroups}
          currentCheckedItems={userGroups}
          onChange={handleChange}
        />

        <div id="add-items">
          <span>Permissions</span>
          <div id="permission-groupwise">
            <Chip
              id="group"
              label="Overall Permissions"
              onClick={(event: any) => displayGroup("overall")}
            />
            {userGroups?.map((group: Group) => {
              return (
                <Chip
                  id="group"
                  key={group.id}
                  label={group.name}
                  onClick={() => displayGroup(group)}
                />
              );
            })}
          </div>
          <div id="permission-list">
            {filteredPermission?.map((permission) => {
              return <Chip id="item" label={permission} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
