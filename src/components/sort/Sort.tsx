import { FC } from "react";
import SortIcon from "@mui/icons-material/Sort";

import "./sort.css";

const Sort: FC = () => {
  return (
    <div className="sort">
      <div className="sort-icon">
        <SortIcon />
      </div>
      <div className="sort-text">Sort</div>
    </div>
  );
};
export default Sort;
