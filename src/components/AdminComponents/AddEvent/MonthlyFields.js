import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import ToggleTimeAmPmArrows from '../common/ToggleTimeAmPmArrows';

class MonthlyFields extends Component {
    render() {
        const { startDateTime, endDateTime } = this.props;
        const weekN = weekOfMonth(startDateTime);
        const dayOfWeek = moment(startDateTime).day();
        return (
            <React.Fragment>
              <div className="form-group row mt-3">
              <span className="ml-3">Monthly on the {mapNWeekToWord[weekN]} {weekDays.find((day, i) => i === dayOfWeek)}</span>
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

export default MonthlyFields;

const TIME_FORMAT = "h:mm a";

function weekOfMonth(m) {
  // return moment(m).week() - moment(m).startOf('month').week() + 1;
  return Math.ceil(moment(m).date() / 7)
}

const mapNWeekToWord = {
  1: 'first',
  2: 'second',
  3: 'third',
  4: 'fourth',
  5: 'last'
}

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];