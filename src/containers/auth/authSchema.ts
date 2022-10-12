import * as yup from "yup";

const LoginSchema = yup.object({
  username: yup.string().required("Username can not be empty"),
  password: yup.string().required("Password can not be empty"),
});

const ForgotPasswordSchema = yup.object({
  email: yup
    .string()
    .required("Email can not be empty")
    .matches(/\S+@\S+\.\S+/, "Invalid Email"),
});

const ResetPasswordSchema = yup.object({
  password: yup
    .string()
    .required("Password can not be empty")
    .oneOf([yup.ref("confirmPassword"), null], ""),
  confirmPassword: yup
    .string()
    .required()
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

export { LoginSchema, ForgotPasswordSchema, ResetPasswordSchema };
