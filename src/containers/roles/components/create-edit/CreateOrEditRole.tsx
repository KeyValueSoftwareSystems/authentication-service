import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { GET_ROLE_PERMISSIONS } from "../../services/queries";
import {
  CREATE_ROLE,
  UPDATE_ROLE,
  UPDATE_ROLE_PERMISSIONS,
} from "../../services/mutations";
import RoleForm from "./RoleForm";
import "./styles.css";
import { Permission } from "../../../../types/user";
import FilterChips from "../../../../components/filter-chips/FilterChips";
import { FieldValues } from "react-hook-form";

const CreateOrEditRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);

  const handleClick = (permission: Permission) => {
    if (
      rolePermissions.map((permission) => permission.id).includes(permission.id)
    ) {
      setRolePermissions(
        rolePermissions.filter(
          (role_permission) => role_permission.id !== permission.id
        )
      );
    } else setRolePermissions([...rolePermissions, permission]);
  };

  const [createRole, { data: createdRoleData }] = useMutation(CREATE_ROLE);
  const [updateRole, { data: updatedRoleData }] = useMutation(UPDATE_ROLE);
  const [updateRolePermissions, { data: updatedRolePermissionsData }] =
    useMutation(UPDATE_ROLE_PERMISSIONS);

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

  useEffect(() => {
    if (createdRoleData)
      updateRolePermissions({
        variables: {
          id: createdRoleData?.createRole?.id,
          input: {
            permissions: rolePermissions.map((permission) => permission.id),
          },
        },
        onCompleted: () =>
          navigate("/home/roles", {
            state: { message: "Role has been successfully created" },
          }),
      });
  }, [createdRoleData]);

  useEffect(() => {
    if (updatedRoleData && updatedRolePermissionsData)
      navigate("/home/roles", {
        state: { message: "Role has been successfully updated" },
      });
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
          <FilterChips
            selectedPermissions={rolePermissions}
            handleClick={handleClick}
          />
        )}
      </div>
    </div>
  );
};

export default CreateOrEditRole;
