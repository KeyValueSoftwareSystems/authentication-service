import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { RoleDetailsAtom } from "../../states/roleStates";
import { RolePermissionsAtom } from "../../states/permissionsStates";
import "../groups/components/create-edit/details/styles.css"
import { GET_ROLE, GET_ROLE_PERMISSIONS } from "./services/queries";
import { Chip } from "@mui/material";

const RoleDetails: React.FC = () => {
  const { id } = useParams();
  const [role, setRole] = useRecoilState(RoleDetailsAtom);
  const [permissions, setPermissions] = useRecoilState(RolePermissionsAtom);

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
      <legend id="group-title"> {role.name} </legend>
      <div id="rolesandpermissions">
        <div id="roles">
          <legend id="bold"> Role Permissions </legend>
          <div id="item-list">
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
