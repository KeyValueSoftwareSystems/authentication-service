import { Button } from "@mui/material";
import { FC } from "react";

import { TableToolBarProps } from "./types";
import "./styles.css";
import SearchBar from "../search-bar/SearchBar";
import { useNavigate } from "react-router-dom";

const TableToolBar: FC<TableToolBarProps> = ({
  text,
  searchLabel,
  buttonLabel,
  onAdd,
}) => {
  const navigate = useNavigate();

  return (
    <div className="table-toolbar">
      <legend className="legend-title">{text}</legend>
      <div className="search-button">
        <div className="search">
          <SearchBar searchLabel={searchLabel} />
        </div>
        <div className="toolbar-button">
          <Button variant="contained" id="add-button" onClick={onAdd}>
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
export default TableToolBar;
