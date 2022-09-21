import Form from 'muicss/lib/react/form'
import { Button, Input } from 'muicss/react';
import { useMemo, useState } from 'react';
import Select from 'muicss/lib/react/select';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import countryList from 'react-select-country-list';
import './userForm.css';
import { UploadPicture } from './uploadPicture';
import { AddGroups } from './addGroups';
import ReactCrop from 'react-image-crop'

const UserForm: React.FC = () => {


    return (
        <div id="page">
            <div id="fixed">
                <div id="back-page">
                    <ArrowBackIcon id="arrowicon" />
                    Users
                </div>
                <div id="title">
                    <legend id="bold">Add User</legend>
                    <div id="add-cancel">
                        <div id="cancel"> Cancel </div>
                        <Button id="add">Add</Button>
                    </div>
                </div>
                <hr />
            </div>
            <Form>
                <UploadPicture />
                <div id="inputs">
                    <div id="form-row">
                        <Input id="fields" placeholder="First Name*" />
                        <Input id="fields" placeholder="Middle Name*" />
                        <Input id="fields" placeholder="Last Name*" />
                    </div>
                    <div id="form-row">
                        <Input id="fields" placeholder="Mobile Number*" />
                        <Input id="fields" placeholder="Email*" />
                    </div>
                </div>
            </Form>
        <AddGroups/>
        </div>
    )
}

export default UserForm;

