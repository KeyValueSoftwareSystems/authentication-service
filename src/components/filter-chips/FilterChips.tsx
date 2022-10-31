import { useQuery } from "@apollo/client";
import { Chip } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import { useState } from "react";

import "./styles.css";
import { GET_PERMISSIONS } from "../../containers/permissions/services/queries";
import { Permission } from "../../types/user";

interface FilterChipsProps {
  selectedPermissions: Permission[];
  handleClick: (permission: Permission) => void;
}

const FilterChips: React.FC<FilterChipsProps> = (props: FilterChipsProps) => {
  const { handleClick, selectedPermissions } = props;
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  useQuery(GET_PERMISSIONS, {
    onCompleted: (data) => {
      setAllPermissions(data?.getPermissions);
    },
  });

  return (
    <div className="chips-stack">
      {allPermissions?.map((permission: Permission) => {
        const selected = selectedPermissions.some(
          (selected: Permission) => selected.id === permission.id
        );
        return (
          <Chip
            sx={
              selected
                ? {
                    fontSize: "medium",
                    borderColor: "#01579B",
                  }
                : {
                    fontSize: "medium",
                  }
            }
            key={permission.id}
            label={permission.name}
            onClick={() => handleClick(permission)}
            variant="outlined"
            icon={selected ? <DoneIcon style={{ color: "green" }} /> : <> </>}
          />
        );
      })}
    </div>
  );
};

export default FilterChips;
