import React from "react";
import { Alert, Snackbar } from "@mui/material";

type ToastProps = {
  isOpen: boolean;
  message?: string;
  handleClose: () => void;
};

const Toast: React.FC<ToastProps> = ({ isOpen, message, handleClose }) => {
  const closeHandler = () => {
    handleClose();
  };

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
          severity="success"
          sx={{ backgroundColor: "#D5F2C7" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Toast;
