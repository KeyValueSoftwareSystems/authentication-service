import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Button } from "@mui/material";

import "./styles.css";

const AddMembers = () => {
  //To handle after integrating  member addition to group
  return (
    <div className="add-members">
      <PersonAddIcon sx={{ height: 150, width: 150 }} />
      <div>There are no members in this group at the moment</div>
      <Button variant="outlined" className="button">
        Add members
      </Button>
    </div>
  );
};

export default AddMembers;
