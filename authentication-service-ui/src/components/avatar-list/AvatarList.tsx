import { Avatar } from "@mui/material";
import { AvatarGroup } from "@mui/material";

import { stringAvatar } from "../../utils/table";
import "./styles.css";

const DEFAULT_SIZE = 9;

const AvatarList = (avatarList: any) => {
  const { row } = avatarList;
  return (
    <div className="avatar-list">
      <AvatarGroup max={DEFAULT_SIZE}>
        {row?.users?.map((item: any) => (
          <Avatar
            {...stringAvatar(
              `${item.firstName} ${item.lastName}`?.toUpperCase()
            )}
            className="avatar"
          />
        ))}
      </AvatarGroup>
    </div>
  );
};

export default AvatarList;
