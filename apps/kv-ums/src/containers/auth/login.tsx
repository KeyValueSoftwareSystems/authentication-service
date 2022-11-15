import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { useRecoilState } from "recoil";
import { FieldValues } from "react-hook-form";

import { LOGIN_URL } from "../../config";
import { LOGIN, SET_PASSWORD } from "./services/mutations";
import CustomerAuth from "../../services/auth";
import "./styles.css";
import LoginPassword from "./loginPassword";
import { UserPermissionsAtom } from "../../states/permissionsStates";
import { currentUserAtom } from "../../states/loginStates";
import PasswordConfirmation from "./PasswordConfirmation";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const inviteToken: string | null = searchParams.get("token");

  const [userPermissions, setUserPermissions] =
    useRecoilState(UserPermissionsAtom);

  const [currentUserDetails, setCurrentUserDetails] =
    useRecoilState(currentUserAtom);

  const [userLogin, { data }] = useMutation(LOGIN);
  const [setPassword, { data: passwordCreatedData }] =
    useMutation(SET_PASSWORD);

  useEffect(() => {
    if (data) {
      const { accessToken, refreshToken, user } = data.passwordLogin;
      CustomerAuth.setTokens({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
      setUserPermissions(user?.permissions);
      setCurrentUserDetails(user);
      navigate("/home/users");
    }
  }, [data]);

  useEffect(() => {
    if (passwordCreatedData) navigate("/");
  }, [passwordCreatedData]);

  const onLogin = (data: FieldValues) => {
    userLogin({
      variables: {
        input: data,
      },
    });
  };

  const onConfirmPassword = (data: FieldValues) => {
    setPassword({
      variables: {
        input: { inviteToken, password: data?.password },
      },
      fetchPolicy: "no-cache",
    });
  };

  const getInputFields = () => {
    if (inviteToken)
      return <PasswordConfirmation onSubmitForm={onConfirmPassword} />;
    else return <LoginPassword onSubmitForm={onLogin} />;
  };

  return (
    <div className="login-page">
      <div className="left">
        <img src={LOGIN_URL} alt="login image" id="login-image" />
      </div>
      <div className="input-container">{getInputFields()}</div>
    </div>
  );
};

export default Login;
