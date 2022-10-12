import { atom } from "recoil";

export const groupListAtom = atom({
  key: "GroupList",
  default: [],
});

export const groupDetailsAtom = atom({
  key: "GroupDetails",
  default: {
    id: "",
    name: "",
  },
});
