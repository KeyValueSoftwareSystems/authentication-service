import React, { useState, useRef, useEffect } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CheckIcon from "@mui/icons-material/Check";
import { Tooltip } from "@mui/material";

import "./styles.css";

type InlineEditProps = {
  value?: string;
  id?: string;
  onSave: (value: string | undefined, id: string | undefined) => void;
  onDeletePermission: (id: string | undefined) => void;
  isAdd: boolean;
  onCancelAdd: () => void;
};

const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  id,
  onSave,
  onDeletePermission,
  isAdd,
  onCancelAdd,
}) => {
  const inputElement = useRef<any>(null);
  const [editingValue, setEditingValue] = useState<string | undefined>(value);
  const [isDisabled, setIsDisabled] = useState(!isAdd);

  useEffect(() => {
    setEditingValue(value);
  }, [value]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setEditingValue(event.target.value);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "Escape") {
      event.currentTarget.blur();
      onCancelAdd();
    }
  };

  const onBlur = () => {
    setIsDisabled(true);
    setEditingValue(value);
    onCancelAdd();
  };

  const onSavePermissionEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    onSave(editingValue, id);
    setIsDisabled(true);
  };

  const onDelete = () => {
    onDeletePermission(id);
  };

  const onEdit = () => {
    setIsDisabled(false);
    setTimeout(() => inputElement.current.focus(), 0);
  };

  return (
    <div className={`editableText  ${isDisabled && "disabledStyles"}`}>
      <Tooltip title={editingValue || ""}>
        <input
          type="text"
          aria-label="Field name"
          value={editingValue}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          className="inputChip"
          disabled={isDisabled}
          autoFocus={isAdd}
          ref={inputElement}
        />
      </Tooltip>
      <span className="iconSpacing">
        <EditOutlinedIcon
          sx={{ marginRight: "1px", color: "#039be5c2" }}
          onClick={onEdit}
          className={`${!isDisabled && "editIcon"}`}
        />
        {!isDisabled ? (
          <CheckIcon
            className="saveIcon"
            onMouseDown={onSavePermissionEdit}
            sx={{ color: "green" }}
          />
        ) : (
          <DeleteOutlineOutlinedIcon
            onClick={onDelete}
            sx={{ marginRight: "1px", color: "#eb272785" }}
          />
        )}
      </span>
    </div>
  );
};

export default InlineEdit;
