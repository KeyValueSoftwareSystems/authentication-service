import { atom } from "recoil";

export const groupDetailsAtom = atom({
  key: "GroupDetails",
  default: {
    id: "",
    name: "",
  },
});
