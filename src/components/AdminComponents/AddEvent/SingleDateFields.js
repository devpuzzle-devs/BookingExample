import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import ToggleTimeAmPmArrows from '../common/ToggleTimeAmPmArrows';

class SingleDateFields extends Component {
    render() {
        const { startDateTime, endDateTime } = this.props;
        return (
            <React.Fragment>
            <div className="form-group row mt-3">
                <label htmlFor="startDate" className="col-md-1 col-form-label text-muted">Starts</label>
                <div className="col-md-2">
                  <div className="form-group  date-picker">
                  <DatePicker 
                    className="form-control"
                    selected={startDateTime}
                    onChange={date => this.props.handleDateChange(date, 'start')}
                  />
                  <i className="far fa-calendar-alt  text-primary"></i>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="form-group  date-picker">
                  <input 
                    type="text"
                    className="form-control"
                    ref={this.props.createRefFn('startTimeInput')}
                    name="start"
                    defaultValue={moment(startDateTime).format(TIME_FORMAT)}
                    onBlur={this.props.handleTimeBlur}
                  />
                  <i className="far fa-clock text-primary"></i>
                  <ToggleTimeAmPmArrows 
                    name="start"
                    toggleTimeAmPm={this.props.toggleTimeAmPm} 
                  />
                  </div>
                </div>
            
                <label htmlFor="endDate" className="col-md-1 offset-md-1 col-form-label text-muted">Ends</label>
                <div className="col-md-2">
                  <div className="form-group  date-picker">
                  <DatePicker 
                    className="form-control" 
                    selected={endDateTime}
                    onChange={date => this.props.handleDateChange(date, 'end')}
                  />
                  <i className="far fa-calendar-alt text-primary"></i>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="form-group date-picker">
                  <input 
                    className="form-control"
                    ref={this.props.createRefFn('endTimeInput')} 
                    name="end"
                    defaultValue={moment(endDateTime).format(TIME_FORMAT)}
                    onBlur={this.props.handleTimeBlur}
                  />
                  <i className="far fa-clock text-primary"></i>
                  <ToggleTimeAmPmArrows 
                    name="end"
                    toggleTimeAmPm={this.props.toggleTimeAmPm} 
                  />
                  </div>
                </div>
            </div>
        </React.Fragment>
        )
    }
}

export default SingleDateFields;

const TIME_FORMAT = "h:mm a";