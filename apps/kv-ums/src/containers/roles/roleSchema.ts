import * as yup from "yup";

const RoleFormSchema = yup.object({
  name: yup.string().min(2),
});

export { RoleFormSchema };
