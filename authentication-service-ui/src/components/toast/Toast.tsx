import React from "react";
import { Alert, Snackbar } from "@mui/material";
import { useRecoilState } from "recoil";

import { apiRequestAtom } from "../../states/apiRequestState";

type ToastProps = {
  isOpen: boolean;
  message?: string;
  handleClose: () => void;
};

const Toast: React.FC<ToastProps> = ({ isOpen, message, handleClose }) => {
  const closeHandler = () => {
    handleClose();
  };

  const [apiSuccess] = useRecoilState(apiRequestAtom);

  return (
    <div>
      <Snackbar
        open={isOpen}
        onClose={closeHandler}
        autoHideDuration={6000}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={handleClose}
          severity={apiSuccess === true ? "success" : "error"}
          sx={
            apiSuccess === true
              ? { backgroundColor: "#D5F2C7" }
              : { backgroundColor: "#ff000069" }
          }
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Toast;
