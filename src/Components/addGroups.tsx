import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import './addGroups.css';

export const AddGroups = () => {
    
    const data=["Group1", "Group2","Group3"];

    return (
        <div id="add-groups">
            <legend id="bold"> Select Groups </legend>
            {/* <div >
                <FormGroup>
                    <FormControlLabel id="checkbox" control={<Checkbox />} label="Group1" />
                    <FormControlLabel id="checkbox" control={<Checkbox />} label="Group2" />
                </FormGroup>
            </div> */}
            {
                data.map(x=>{
                    return (
                        <div id="checkbox"> <label><input type="checkbox"/>{x}</label><br></br></div>                 
                    )
                })
            }
        </div>
    )
}