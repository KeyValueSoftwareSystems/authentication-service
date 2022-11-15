import { FC } from "react";
import { Avatar, Box, Card, Chip, IconButton } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";

import { stringAvatar } from "../../../../utils/table";
import "./styles.css";
import { User } from "../../../../types/user";
import { getFullName } from "../../../../utils/user";

interface UserCardProps {
  user: User;
  onRemoveUser: ({ userId }: { userId: string }) => void;
}

const UserCard: FC<UserCardProps> = ({ user, onRemoveUser }) => {
  const fullName = getFullName(user.firstName, user.middleName, user.lastName);

  return (
    <Box sx={{ width: "85%" }}>
      <Card variant="outlined" className="user-card">
        <div className="card-content">
          <Avatar {...stringAvatar(fullName)} className="avatar" />
          <div style={{ textTransform: "capitalize" }}>{fullName}</div>
          <Chip label={"Active"} sx={{ background: "#D3F4BE" }} />
        </div>
        <IconButton onClick={() => onRemoveUser({ userId: user.id })}>
          <CancelIcon
            sx={{
              fill: "#d9d9d9",
              height: 40,
              width: 40,
            }}
          />
        </IconButton>
      </Card>
    </Box>
  );
};

export default UserCard;
