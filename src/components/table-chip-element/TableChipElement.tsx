import { DocumentNode, useQuery } from "@apollo/client";
import { Chip } from "@mui/material";
import React, { FC } from "react";

interface TableChipElementProps {
  props: any;
  query: DocumentNode;
  element: string;
}

const TableChipElement: FC<TableChipElementProps> = ({
  props,
  query,
  element,
}) => {
  const { row } = props;
  const [itemList, setItemList] = React.useState([]);

  useQuery(query, {
    variables: {
      id: row.id,
    },
    onCompleted: (data) => {
      if (element === "user") {
        setItemList(data?.getUserGroups);
      } else if (element === "group") {
        setItemList(data?.getGroupRoles);
      }
    },
  });

  return (
    <>
      {itemList?.map((item: any) => (
        <Chip label={item?.name} key={item?.id} />
      ))}
    </>
  );
};
export default TableChipElement;
