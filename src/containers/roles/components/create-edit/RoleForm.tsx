import { FC, useState } from "react";
import { Button, Divider, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { useQuery } from "@apollo/client";

import "./styles.css";
import FormInputText from "../../../../components/inputText";
import { Role } from "../../../../types/role";
import { GET_ROLE } from "../../services/queries";

interface RoleFormProps {
  createRole: (inputs: any) => void;
  editRole: (inputs: any) => void;
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
    defaultValues: initialValues,
  });
  const { handleSubmit } = methods;

  const onSubmitForm = (input: any) => {
    id ? editRole(input) : createRole(input);
  };

  const onClickBack = () => {
    navigate("/home/roles");
  };

  return (
    <div className="container">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitForm)} className="form">
          <div className="box">
            <div className="box1">
              <div className="access-setting" onClick={onClickBack}>
                <ArrowBackIcon sx={{ height: 15 }} />
                Roles Listing
              </div>
              <div className="create-role">
                {id ? "Edit Role" : "Create Role"}
              </div>
            </div>
            <Stack className="box2" spacing={2} direction="row">
              <Button variant="text" className="button" onClick={onClickBack}>
                Cancel
              </Button>
              <Button variant="outlined" className="button" type="submit">
                {id ? "Update Role" : "Create Role"}
              </Button>
            </Stack>
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
