import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { GET_ROLE_PERMISSIONS } from "../../services/queries";
import { ChecklistComponent } from "../../../../components/checklist/CheckList";
import { GET_PERMISSIONS } from "../../../permissions/services/queries";
import {
  CREATE_ROLE,
  UPDATE_ROLE,
  UPDATE_ROLE_PERMISSIONS,
} from "../../services/mutations";
import RoleForm from "./RoleForm";
import "./styles.css";
import { Permission } from "../../../../types/user";
import { FieldValues } from "react-hook-form";

const CreateOrEditRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);

  const [createRole, { data: createdRoleData }] = useMutation(CREATE_ROLE);
  const [updateRole, { data: updatedRoleData }] = useMutation(UPDATE_ROLE);
  const [updateRolePermissions, { data: updatedRolePermissionsData }] =
    useMutation(UPDATE_ROLE_PERMISSIONS);

  const { data: permissionsData } = useQuery(GET_PERMISSIONS, {
    onCompleted: (data) => {
      const permissions = data?.getPermissions.map(
        (permission: any) => permission
      );
      setAllPermissions([...permissions]);
    },
  });

  const { loading } = useQuery(GET_ROLE_PERMISSIONS, {
    skip: !id,
    variables: { id: id },
    onCompleted: (data) => {
      const permissions = data?.getRolePermissions?.map(
        (permission: any) => permission
      );
      setRolePermissions([...permissions]);
    },
  });

  const removeItem = (item: Permission) => {
    const newPermissions: Permission[] = rolePermissions.filter(
      (e: Permission) => e !== item
    );
    setRolePermissions(newPermissions);
  };

  const onChange = (event: any, item?: any) => {
    const value = event.target.value;
    if (event.target.checked) {
      if (value === "all") {
        setRolePermissions(allPermissions);
        return;
      } else {
        setRolePermissions([...rolePermissions, item]);
      }
    } else {
      if (value === "all") {
        setRolePermissions([]);
        return;
      }
      removeItem(item);
    }
  };

  useEffect(() => {
    if (createdRoleData)
      updateRolePermissions({
        variables: {
          id: createdRoleData?.createRole?.id,
          input: {
            permissions: rolePermissions.map((permission) => permission.id),
          },
        },
        onCompleted: () => navigate("/home/roles"),
      });
  }, [createdRoleData]);

  useEffect(() => {
    if (updatedRoleData && updatedRolePermissionsData) navigate("/home/roles");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedRoleData, updatedRolePermissionsData]);

  const onCreateRole = (inputs: FieldValues) => {
    createRole({ variables: { input: inputs } });
  };

  const onEditRole = (inputs: FieldValues) => {
    updateRole({ variables: { id: id, input: inputs } });
    updateRolePermissions({
      variables: {
        id: id,
        input: {
          permissions: rolePermissions.map((permission) => permission.id),
        },
      },
    });
  };

  return (
    <div className="roleContainer">
      <RoleForm createRole={onCreateRole} editRole={onEditRole} />
      <div className="role-permissions">
        <div className="permission-header"> Permissions</div>
        {!loading && (
          <ChecklistComponent
            mapList={permissionsData?.getPermissions}
            name="Select Permissions"
            onChange={onChange}
            currentCheckedItems={rolePermissions}
          />
        )}
      </div>
    </div>
  );
};

export default CreateOrEditRole;
