import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const currentUserAtom = atom({
  key: "currentUserDetails",
  default: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },
  effects_UNSTABLE: [persistAtom],
});
