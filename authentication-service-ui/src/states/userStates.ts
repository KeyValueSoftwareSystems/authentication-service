import { atom } from "recoil";

export const userListAtom = atom({
  key: "UserList",
  default: [],
});

export const allUsersAtom = atom({
  key: "AllUsers",
  default: [],
});
