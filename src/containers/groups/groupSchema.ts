import * as yup from "yup";

const GroupFormSchema = yup.object({
  name: yup.string().min(2),
});

export { GroupFormSchema };
