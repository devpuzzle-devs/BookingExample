import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import ToggleTimeAmPmArrows from '../common/ToggleTimeAmPmArrows';

class WeeklyFields extends Component {
    handleCheckbox = (e) => {
        const {id} = e.target;
        const { startDateTime } = this.props;
        const targetWeekDay = weekDays.indexOf(id);
        const newDate = moment(startDateTime).day(targetWeekDay).toDate();

        this.props.handleDateChange(newDate, 'start')
    }
    render() {
        const { startDateTime, endDateTime } = this.props;
        const weekday = moment(startDateTime).day();
        return (
            <React.Fragment>
            <div className="form-group row mt-3">
                <label htmlFor="days" className="col-sm-2 col-form-label text-muted">Day</label>
                <div className="col-sm-10">
                    {weekDays.map((day, i) => {
                        return <div key={i} className="custom-control custom-radio custom-control-inline">
                            <input 
                                type="radio" 
                                id={day} 
                                name={'weekdays'} 
                                className="custom-control-input" 
                                checked={weekday === i}
                                onChange={this.handleCheckbox}
                            />
                            <label className="custom-control-label" htmlFor={day}>{day}</label>
                        </div>
                    })}
                </div>
            </div>
            <div className="form-group row mt-3">
                <label htmlFor="startDate" className="col-sm-2 col-form-label text-muted">Starts</label>
                <div className="col-sm-3">
                  <div className="form-group  date-picker">
                  <DatePicker 
                    className="form-control"
                    dateFormat="EE MM/dd/yyyy"
                    selected={startDateTime}
                    onChange={date => this.props.handleDateChange(date, 'start')}
                  />
                  <i className="far fa-calendar-alt  text-primary"></i>
                  </div>
                </div>

                <label htmlFor="endDate" className="col-sm-2 offset-sm-1 col-form-label text-muted">Ends by</label>
                <div className="col-sm-3">
                  <div className="form-group  date-picker">
                  <DatePicker 
                    className="form-control" 
                    dateFormat="EE MM/dd/yyyy"
                    selected={endDateTime}
                    onChange={date => this.props.handleDateChange(date, 'end')}
                  />
                  <i className="far fa-calendar-alt  text-primary"></i>
                  </div>
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="time" className="col-sm-2 col-form-label text-muted">Time</label>
                <div className="col-sm-3">
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

                <div className="col-sm-3">
                  <div className="form-group  date-picker">
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

export default WeeklyFields;

const TIME_FORMAT = "h:mm a";

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];