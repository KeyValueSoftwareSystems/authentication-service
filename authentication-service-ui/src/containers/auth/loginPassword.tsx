import React from "react";
import { Button } from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import FormInputText from "../../components/inputText";
import { LoginSchema } from "./authSchema";
import { LOGO_URL } from "../../config";
import "./styles.css";

type Props = {
  onSubmitForm: (data: any) => void;
};
const LoginPassword: React.FC<Props> = ({ onSubmitForm }) => {
  const initialValues = {
    username: "",
    password: "",
  };

  const methods = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(LoginSchema),
  });
  const { handleSubmit } = methods;

  return (
    <div className="containerLogin">
      <div className="logo">
        <img alt="logo" src={LOGO_URL} />
      </div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <FormInputText
            name="username"
            label="Username"
            type="text"
            className="textBox"
          />
          <FormInputText
            name="password"
            label="Password"
            type="password"
            className="textBox"
          />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            className="login-button"
          >
            Login
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default LoginPassword;
