import * as yup from "yup";

const AddUserformSchema = yup.object({
  firstName: yup.string().required("First name can not be empty"),
  lastName: yup.string().matches(/^[A-Za-z]+$/, "Must be a name"),
  email: yup.string().email("Invalid email").required("Email can not be empty"),
});

const EditUserformSchema = yup.object({
  firstName: yup.string().min(2),
  lastName: yup.string(),
});

export { AddUserformSchema, EditUserformSchema };
