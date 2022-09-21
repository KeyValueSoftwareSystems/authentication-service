import './uploadPicture.css';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useRef, useState } from 'react';


export const UploadPicture = () => {

    const imageUpload = useRef(null);
    const [imageToCrop, setImageToCrop] = useState(undefined);

    const handleUploadClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files;

    };
    

    return (
        <div id="upload-picture">
            <legend id="bold"> Profile Image </legend>
            <div id="box">
                <CloudUploadIcon id="clouduploadicon"/>
                <input
                    ref={imageUpload}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleUploadClick}
                />
                <div id="drag" >
                    Drag and drop images
                </div>
                <div id="browse">
                    or browse to choose a file
                </div>
                <div id="recommended">
                    Recommended Dimension:240x320 pixels
                </div>              
            </div>

        </div>
    )
}