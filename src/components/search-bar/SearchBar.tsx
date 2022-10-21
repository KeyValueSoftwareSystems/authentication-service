import { InputBase } from "@mui/material";
import { GridSearchIcon } from "@mui/x-data-grid";
import { FC } from "react";

import { SearchBarProps } from "./types";
import "./styles.css";

const SearchBar: FC<SearchBarProps> = ({ searchLabel }) => {
  return (
    <div className="search">
      <div className="search-bar">
        <InputBase placeholder={searchLabel} />
      </div>
      <div className="search-icon">
        <GridSearchIcon />
      </div>
    </div>
  );
};
export default SearchBar;
