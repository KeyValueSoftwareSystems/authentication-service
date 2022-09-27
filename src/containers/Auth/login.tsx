import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";

import { LOGIN } from "./services/mutations";
import CustomerAuth from "../../services/auth";
import "./styles.css";
import LoginPassword from "./loginPassword";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [userLogin, { data }] = useMutation(LOGIN);

  useEffect(() => {
    if (data) {
      const { accessToken, refreshToken } = data.passwordLogin;
      CustomerAuth.setTokens({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
      navigate("/home/users");
    }
  }, [data]);

  const onSubmitForm = (data: any) => {
    userLogin({
      variables: {
        input: data,
      },
    });
  };

  return (
    <div className="container">
      <LoginPassword onSubmitForm={onSubmitForm} />
    </div>
  );
};

export default Login;
