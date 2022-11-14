import { Chip } from "@mui/material";
import React, { FC } from "react";
import CancelIcon from "@mui/icons-material/Cancel";

import "./styles.css";
interface TableChipElementProps {
  rowItems: any;
  columnName: string;
  defaultSize: number;
}

const TableChipElement: FC<TableChipElementProps> = ({
  rowItems,
  columnName,
  defaultSize,
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
              i < defaultSize && (
                <Chip label={item?.name} key={item?.id} id="chip" />
              )
          )}
          {row[columnName]?.length > defaultSize && (
            <Chip
              label={`+${row[columnName]?.length - defaultSize}`}
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
