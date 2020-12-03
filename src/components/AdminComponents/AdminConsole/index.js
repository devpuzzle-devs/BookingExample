import React, {Component} from 'react';
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap';
import { db } from '../../../firebase';

import './style.scss';

class AdminConsole extends Component {
    state = {
        dropdownOpen: false,
        adminSettings: {
            nDaysForActiveWindow: '',
            nDaysForActiveWindowEditorsChoice: '',
            nDaysForInActiveWindow: '',
        },
        adminSettingsId: null
        
    }

    componentDidMount() {
        db.collection('adminSettings').get().then((querySnapshot) => {
            let data = {};
            const adminSettings = {};
            let adminSettingsId
            querySnapshot.forEach(doc => {
                data = doc.data();
                Object.keys(data).forEach(key => adminSettings[key] = data[key]);
                adminSettingsId = doc.id;
            })
            this.setState({adminSettings, adminSettingsId});
        })
    }

    toggle = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    handleInputChange = e => {
        const { name, value } = e.target;
        this.setState({ 
            adminSettings: {
                ...this.state.adminSettings,
                [name]: parseInt(value, 10) }
            });
    }

    handleSave = () => {
        const { adminSettings, adminSettingsId } = this.state;
        db.collection('adminSettings').doc(adminSettingsId)
        .update(adminSettings)
        .then(() => {
            console.log('Settings updated successfully');
        });
        this.toggle();
    }
    render() {
        const { adminSettings } = this.state;
        const { nDaysForActiveWindow, nDaysForActiveWindowEditorsChoice, nDaysForInActiveWindow } = adminSettings;
        return (
            <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle} className="admin-dropdown">
                <DropdownToggle
                tag="button"
                className="btn btn-light admin-btn mx-3"
                onClick={this.toggle}
                data-toggle="dropdown"
                aria-expanded={this.state.dropdownOpen}
                >
                <i className="fas fa-users-cog fa-2x"></i>
                </DropdownToggle>
                <DropdownMenu>
                <div className="form-group row">
                <label htmlFor="name" className="col-sm-7 col-form-label"># days for active window</label>
                    <div className="col-sm-5">
                    <input 
                        type="number" 
                        id="nDaysForActiveWindow" 
                        name="nDaysForActiveWindow" 
                        className="form-control" 
                        value={nDaysForActiveWindow}
                        onChange={this.handleInputChange} 
                    />
                    </div>
                </div>
                <div className="form-group row">
                <label htmlFor="name" className="col-sm-7 col-form-label">#  days of active window editor's choice</label>
                    <div className="col-sm-5">
                    <input 
                        type="number" 
                        id="nDaysForActiveWindowEditorsChoice" 
                        name="nDaysForActiveWindowEditorsChoice" 
                        className="form-control" 
                        value={nDaysForActiveWindowEditorsChoice}
                        onChange={this.handleInputChange} 
                    />
                    </div>
                </div>
                <div className="form-group row">
                <label htmlFor="name" className="col-sm-7 col-form-label"># days for inactive window</label>
                    <div className="col-sm-5">
                    <input 
                        type="number" 
                        id="nDaysForInActiveWindow" 
                        name="nDaysForInActiveWindow" 
                        className="form-control" 
                        value={nDaysForInActiveWindow}
                        onChange={this.handleInputChange} 
                    />
                    </div>
                </div>
                <div className="form-group row mb-0">
                    <div className="col-sm-12 text-right">
                    <button 
                        className="btn btn-primary"
                        onClick={this.handleSave}
                    >
                    Save
                    </button>
                    </div>
                </div>
                </DropdownMenu>
            </Dropdown>
        )
    }
}

export default AdminConsole;