import { FC, useState } from "react";
import { Button, Divider } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import { useQuery } from "@apollo/client";

import { RoleFormSchema } from "../../roleSchema";
import "./styles.css";
import FormInputText from "../../../../components/inputText";
import { Role } from "../../../../types/role";
import { GET_ROLE } from "../../services/queries";

interface RoleFormProps {
  createRole: (inputs: FieldValues) => void;
  editRole: (inputs: FieldValues) => void;
}

const RoleForm: FC<RoleFormProps> = ({ createRole, editRole }) => {
  const navigate = useNavigate();

  const { id } = useParams();
  const [role, setRole] = useState<Role>();

  const { loading } = useQuery(GET_ROLE, {
    skip: !id,
    variables: { id: id },
    onCompleted: (data) => {
      setRole(data?.getRole);
    },
  });

  const initialValues = {
    name: id ? role?.name : "",
  };

  const methods = useForm({
    resolver: yupResolver(RoleFormSchema),
    defaultValues: initialValues,
  });
  const { handleSubmit } = methods;

  const onSubmitForm = (input: FieldValues) => {
    id ? editRole(input) : createRole(input);
  };

  const onBackNavigation = () => {
    navigate("/home/roles");
  };

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitForm)} className="form">
          <div className="horizontal-bar">
            <div className="page-header">
              <div className="access-setting" onClick={onBackNavigation}>
                <ArrowBackIcon sx={{ height: 15 }} />
                Roles Listing
              </div>
              <div className="create-role">
                {id ? "Modify Role" : "Create Role"}
              </div>
            </div>
            <div className="submit-section">
              <Button
                variant="text"
                className="button"
                onClick={onBackNavigation}
              >
                Cancel
              </Button>
              <Button variant="outlined" className="button" type="submit">
                {id ? "Update" : "Create"}
              </Button>
            </div>
          </div>
          <Divider />
          {!loading && (
            <>
              <FormInputText
                name="name"
                label="Role Name"
                type="text"
                className="role-name"
                defaultText={role?.name}
              />
              <Divider sx={{ marginTop: 2 }} />
            </>
          )}
        </form>
      </FormProvider>
    </div>
  );
};

export default RoleForm;
