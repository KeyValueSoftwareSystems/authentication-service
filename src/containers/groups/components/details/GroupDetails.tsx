import { useQuery } from "@apollo/client";
import { Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { groupDetailsAtom } from "../../../../states/groupStates";
import { GroupPermissionsAtom } from "../../../../states/permissionsStates";
import { GroupRolesAtom } from "../../../../states/roleStates";
import {
  GET_GROUP,
  GET_GROUP_PERMISSIONS,
  GET_GROUP_ROLES,
} from "../../services/queries";
import "./styles.css";

const GroupDetails: React.FC = () => {
  const { id } = useParams();
  const [group, setGroup] = useRecoilState(groupDetailsAtom);
  const [roles, setRoles] = useRecoilState(GroupRolesAtom);
  const [permissions, setPermissions] = useRecoilState(GroupPermissionsAtom);
  const navigate = useNavigate();

  useQuery(GET_GROUP, {
    variables: { id },
    onCompleted: (data) => {
      setGroup(data?.getGroup);
    },
  });

  useQuery(GET_GROUP_ROLES, {
    variables: { id },
    onCompleted: (data) => {
      setRoles(data?.getGroupRoles);
    },
  });

  useQuery(GET_GROUP_PERMISSIONS, {
    variables: { id },
    onCompleted: (data) => {
      setPermissions(data?.getGroupPermissions);
    },
  });

  const onBackNavigation = () => {
    navigate("/home/groups");
  };

  return (
    <div id="group-details">
      <div id="back-page" onClick={onBackNavigation}>
        <ArrowBackIcon id="arrowicon" />
        Groups
      </div>
      <legend id="group-title"> {group.name} </legend>
      <div id="rolesandpermissions">
        <div id="roles">
          <legend id="bold"> Group Roles </legend>
          <div id="item-list-details">
            {roles.map((item) => (
              <Chip id="item" key={item.id} label={item.name} />
            ))}
          </div>
        </div>
        <div id="roles">
          <legend id="bold"> Group Permissions </legend>
          <div id="item-list-details">
            {permissions.map((item) => (
              <Chip id="item" key={item.id} label={item.name} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
