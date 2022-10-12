import * as yup from "yup";

const GroupFormSchema = yup.object({
  name: yup.string().required("Group name can not be empty"),
});

export { GroupFormSchema };
