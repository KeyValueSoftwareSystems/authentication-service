import React, { Suspense, lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import { RoutePaths } from "./routePaths";

const NotFound = lazy(() => import( "../components/NotFound"));
const HomePage= lazy(() => import("../containers/Home"));
const Login = lazy(() => import("../containers/Auth/login"));
const Users = lazy(() => import("../containers/users"));
const Groups = lazy(() => import("../containers/Groups"));
const Roles = lazy(() => import("../containers/Roles"));
const Permissions = lazy(() => import("../containers/Permissions"));

const RoutesLayout: React.FC = () => {
  // const navigate = useNavigate();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route
          path={RoutePaths.default}
          element={<Navigate replace to={RoutePaths.login} />}
        />
        <Route path={RoutePaths.login} element={<Login />} />
        {/* <Route
          path={RoutePaths.signup}
          element={<Login type={LoginType.SignUp} />}
        /> */}

        <Route path="/home/*" element={<HomePage />}>
          <Route path={RoutePaths.users} element={<Users />} />
          <Route path={RoutePaths.groups} element={<Groups />} />
          {/* <Route
              path="/user/:id"
              element={<UserDetails />}
            /> */}

          <Route path={RoutePaths.roles} element={<Roles />} />
          <Route path={RoutePaths.permissions} element={<Permissions />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default RoutesLayout;
