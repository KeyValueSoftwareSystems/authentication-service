import { Button } from "@mui/material";
import { FC } from "react";

import Sort from "../sort/Sort";
import { TableToolBarProps } from "./types";
import "./tabletoolbar.css";
import SearchBar from "../search-bar/SearchBar";

const TableToolBar: FC<TableToolBarProps> = ({
  text,
  searchLabel,
  buttonLabel,
}) => {
  return (
    <div className="table-toolbar">
      <legend className="legend-title">{text}</legend>
      <div className="sort-search-button">
        <div className="sort">
          <Sort />
        </div>
        <div className="search">
          <SearchBar searchLabel={searchLabel} />
        </div>
        <div className="toolbar-button">
          <Button variant="outlined">{buttonLabel}</Button>
        </div>
      </div>
    </div>
  );
};
export default TableToolBar;
