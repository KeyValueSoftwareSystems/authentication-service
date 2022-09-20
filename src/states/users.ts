import { atom, RecoilValue } from "recoil";

export const initialState = [
    {
      id: "2",
      companyName: "Keyvalue software systems",
      companyDomain: "Development",
      companySector: "IT",
    },
  
  ];
  export const companyAtom = atom ({
    key: "Companies",
    default : initialState,
  });