import { useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { RoleDetailsAtom } from "../../../../states/roleStates";
import { RolePermissionsAtom } from "../../../../states/permissionsStates";
import "../../styles.css";
import { GET_ROLE, GET_ROLE_PERMISSIONS } from "../../services/queries";

const RoleDetails: React.FC = () => {
  const { id } = useParams();
  const [role, setRole] = useRecoilState(RoleDetailsAtom);
  const [permissions, setPermissions] = useRecoilState(RolePermissionsAtom);
  const navigate = useNavigate();

  useQuery(GET_ROLE, {
    variables: { id },
    onCompleted: (data) => {
      setRole(data?.getRole);
    },
  });

  useQuery(GET_ROLE_PERMISSIONS, {
    variables: { id },
    onCompleted: (data) => {
      setPermissions(data?.getRolePermissions);
    },
  });

  return (
    <div id="group-details">
      <div id="back-page">
        <ArrowBackIcon
          id="arrowicon"
          onClick={() => {
            navigate("/home/groups");
          }}
        />
        Roles
      </div>
      <legend id="group-title"> {role.name} </legend>
      <div id="rolesandpermissions">
        <div id="roles">
          <legend id="bold"> Role Permissions </legend>
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

export default RoleDetails;
