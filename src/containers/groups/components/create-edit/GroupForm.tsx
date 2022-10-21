import { FC, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Divider } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";

import "./styles.css";
import { GroupFormSchema } from "../../groupSchema";
import { GET_GROUP } from "../../services/queries";
import { Group } from "../../../../types/group";
import FormInputText from "../../../../components/inputText";

interface GroupFormProps {
  createGroup: (inputs: FieldValues) => void;
  editGroup: (inputs: FieldValues) => void;
}

const GroupForm: FC<GroupFormProps> = ({ createGroup, editGroup }) => {
  const navigate = useNavigate();

  const { id } = useParams();
  const [group, setGroup] = useState<Group>();

  const { loading } = useQuery(GET_GROUP, {
    skip: !id,
    variables: { id: id },
    onCompleted: (data) => {
      setGroup(data?.getGroup);
    },
  });

  const methods = useForm({
    resolver: yupResolver(GroupFormSchema),
  });
  const { handleSubmit } = methods;

  const onSubmitForm = (input: FieldValues) => {
    id ? editGroup(input) : createGroup(input);
  };

  const onBackNavigation = () => {
    navigate("/home/groups");
  };

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitForm)} className="form">
          <div id="back-page" onClick={onBackNavigation}>
            <ArrowBackIcon sx={{ height: 15 }} />
            Groups
          </div>
          <div className="top-bar">
            <div className="title-section">
              <div className="create-group">
                {id ? "Modify Group" : "Add Group"}
              </div>
            </div>
            <div className="button-section">
              <Button variant="text" onClick={onBackNavigation}>
                Cancel
              </Button>
              <Button
                variant="outlined"
                className="buttonCreateGroup"
                type="submit"
              >
                {id ? "Update" : "Create"}
              </Button>
            </div>
          </div>
          <Divider />
          {!loading && (
            <>
              <FormInputText
                name="name"
                label="Group Name"
                type="text"
                className="group-name"
                defaultText={group?.name}
              />
              {/* <Divider sx={{ marginTop: 2 }} /> */}
            </>
          )}
        </form>
      </FormProvider>
    </div>
  );
};

export default GroupForm;
