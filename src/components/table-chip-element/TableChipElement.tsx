import { Chip } from "@mui/material";
import React, { FC } from "react";
import CancelIcon from "@mui/icons-material/Cancel";

import "./styles.css";

const DEFAULT_SIZE = 6;
interface TableChipElementProps {
  rowItems: any;
  columnName: string;
}

const TableChipElement: FC<TableChipElementProps> = ({
  rowItems,
  columnName,
}) => {
  const { row } = rowItems;

  const [viewAllItems, setViewAllItems] = React.useState(false);

  const onClickShowMore = (event: React.MouseEvent) => {
    setViewAllItems(true);
    event.stopPropagation();
  };

  const onCancel = (event: React.MouseEvent) => {
    setViewAllItems(false);
    event.stopPropagation();
  };

  return (
    <>
      {viewAllItems ? (
        <>
          {row[columnName]?.map((item: any) => (
            <Chip label={item?.name} key={item?.id} id="chip" />
          ))}
          <CancelIcon id="cancel-icon" onClick={onCancel} />
        </>
      ) : (
        <>
          {row[columnName]?.map(
            (item: any, i: number) =>
              i < DEFAULT_SIZE && (
                <Chip label={item?.name} key={item?.id} id="chip" />
              )
          )}
          {row[columnName]?.length > DEFAULT_SIZE && (
            <Chip
              label={`+${row[columnName]?.length - DEFAULT_SIZE}`}
              key="click-to-see-more"
              id="chip"
              onClick={onClickShowMore}
            />
          )}
        </>
      )}
    </>
  );
};
export default TableChipElement;
