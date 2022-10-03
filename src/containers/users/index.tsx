import React from "react";
import { useRecoilState } from "recoil";
import { useQuery } from "@apollo/client";

import { userListAtom } from "../../states/userStates";
import { GET_USERS } from "./services/queries";

const Users: React.FC = () => {
  const [userList, setUserList] = useRecoilState(userListAtom);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, loading, refetch } = useQuery(GET_USERS, {
    onCompleted: (data) => {
      setUserList(data?.getUsers);
    },
  });

  return (
    <div>
      Users
      {userList.map((user: any, i) => (
        <div key={i}>{user.firstName}</div>
      ))}
    </div>
  );
};

export default Users;
