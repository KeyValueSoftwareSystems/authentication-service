import { FC } from "react";
import "./styles.css";
interface ChecklistProps {
  name: String;
  mapList: any;
  currentCheckedItems?: string[];
  onChange: (event: any, item?: any) => void;
}
export const ChecklistComponent: FC<ChecklistProps> = ({
  mapList,
  name,
  currentCheckedItems = [],
  onChange,
}) => {
  const isChecked = (id: string) => {
    return currentCheckedItems.includes(id);
  };

  return (
    <div id="add-items">
      <div id="titlebar">
        <div id="titleChecklist"> {name} </div>
        <div id="selectall">
          <input type="checkbox" value={"all"} onChange={(e) => onChange(e)} />
          <span> Select All</span>
        </div>
      </div>
      <div id="component">
        {mapList?.map((item: any) => {
          return (
            <div id="checkbox" key={item.id}>
              <input
                type="checkbox"
                key={item.id}
                defaultChecked={isChecked(item.id)}
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
