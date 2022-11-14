import React from "react";
import { Button } from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import FormInputText from "../../components/inputText";
import { ConfirmPasswordSchema } from "./authSchema";
import { LOGO_URL } from "../../config";
import "./styles.css";

type Props = {
  onSubmitForm: (data: any) => void;
};
const PasswordConfirmation: React.FC<Props> = ({ onSubmitForm }) => {
  const initialValues = {
    newPassword: "",
    confirmPassword: "",
  };

  const methods = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(ConfirmPasswordSchema),
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
            name="password"
            label="Enter Password"
            type="password"
            className="textBox"
            autoComplete="off"
          />
          <FormInputText
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            className="textBox"
            autoComplete="off"
          />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            className="login-button"
          >
            Submit
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default PasswordConfirmation;
