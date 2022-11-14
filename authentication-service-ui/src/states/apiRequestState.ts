import { atom } from "recoil";

export const apiRequestAtom = atom({
  key: "apiRequest",
  default: false,
});

export const toastMessageAtom = atom({
  key: "toastMessage",
  default: "",
});
