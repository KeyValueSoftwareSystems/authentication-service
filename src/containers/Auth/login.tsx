import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Button from "@mui/material/Button";
import { useMutation } from "@apollo/client";

import { LOGIN } from "./services/mutations";
import CustomerAuth from "../../services/auth";

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
      navigate('/home/users')
    }
  }, [data]);
 
  return (
    <div>
      Login Page UI
      <Button
        variant="contained"
        onClick={() => {
          userLogin({
            variables: {
              input: {
                username: "admin@domain.com",
                password: "adminpassword",
              },
            },
          });
        }}
      >
        Login
      </Button>
    </div>
  );
};

export default Login;
