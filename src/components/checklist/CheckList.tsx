import { FC } from "react";
import { Entity } from "../../types/generic";
import "./styles.css";
interface ChecklistProps {
  name: String;
  mapList: Entity[];
  currentCheckedItems?: Entity[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>, item?: Entity) => void;
  selectAll?: boolean;
}
export const ChecklistComponent: FC<ChecklistProps> = ({
  mapList,
  name,
  currentCheckedItems = [],
  onChange,
  selectAll,
}) => {
  const isChecked = (id: string) => {
    return currentCheckedItems.some((item) => item.id === id);
  };

  return (
    <div id="add-items">
      <div id="titlebar">
        <div id="titleChecklist"> {name} </div>
        <div id="selectall">
          <input
            type="checkbox"
            value={"all"}
            onChange={(e) => onChange(e)}
            checked={selectAll}
          />
          <span> Select All</span>
        </div>
      </div>
      <div id="component">
        {mapList?.map((item: Entity) => {
          return (
            <div id="checkbox" key={item.id}>
              <input
                type="checkbox"
                key={item.id}
                checked={isChecked(item.id)}
                onChange={(e) => onChange(e, item)}
              />
              <span className="checklistLabel">{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
