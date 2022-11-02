import React, { Suspense, lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import UserDetails from "../containers/users/components/user-details/UserDetails";
import CreateOrEditRole from "../containers/roles/components/create-edit/CreateOrEditRole";
import AddUser from "../containers/users/components/create-edit-user/AddUser";
import EditUser from "../containers/users/components/create-edit-user/EditUser";
import { RoutePaths } from "./routePaths";
import CreateOrEditGroup from "../containers/groups/components/create-edit/CreateEditGroup";
import GroupDetails from "../containers/groups/components/details/GroupDetails";

const NotFound = lazy(() => import("../components/NotFound"));
const HomePage = lazy(() => import("../containers/home"));
const Login = lazy(() => import("../containers/auth/login"));
const Users = lazy(() => import("../containers/users"));
const Groups = lazy(() => import("../containers/groups"));
const Roles = lazy(() => import("../containers/roles"));
const Permissions = lazy(() => import("../containers/permissions"));

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

        <Route path="/home/*" element={<HomePage />}>
          <Route path={RoutePaths.users} element={<Users />} />
          <Route path="users/:id" element={<UserDetails />}></Route>
          <Route path="users/add" element={<AddUser />} />
          <Route path="users/add/:id" element={<EditUser />} />
          <Route path={RoutePaths.groups} element={<Groups />} />
          <Route path="groups/:id" element={<GroupDetails />}></Route>
          <Route path="groups/add" element={<CreateOrEditGroup />}></Route>
          <Route path="groups/edit/:id" element={<CreateOrEditGroup />}></Route>
          <Route path={RoutePaths.roles} element={<Roles />} />
          <Route path="roles/add" element={<CreateOrEditRole />}></Route>
          <Route path="roles/edit/:id" element={<CreateOrEditRole />}></Route>
          <Route path={RoutePaths.permissions} element={<Permissions />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default RoutesLayout;
