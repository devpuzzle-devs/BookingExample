import React, { Component } from "react";
import { Dropdown, DropdownMenu, DropdownToggle } from "reactstrap";
import Select from "react-select";
import DatePicker from "react-datepicker";
import AsyncSelect from "react-select/async";

import "react-datepicker/dist/react-datepicker.css";

import { db } from "../../firebase";

const stateOptions = [
  "CA",
  "AL",
  "AK",
  "AS",
  "AZ",
  "AR",
  "CO",
  "CT",
  "DE",
  "DC",
  "FM",
  "FL",
  "GA",
  "GU",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MH",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "MP",
  "OH",
  "OK",
  "OR",
  "PW",
  "PA",
  "PR",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VI",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY"
].map(v => ({ value: v, label: v }));

const sourceOptions = ["Facebook", "Google"].map(v => ({
  value: v,
  label: v
}));

class Search extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dropdownOpen: false,
      metroOptions: []
    };
  }

  componentDidMount() {
    this.loadMetro();
  }

  loadMetro = () => {
    db.collection("metroLookUp")
      .orderBy("name")
      .get()
      .then(querySnapshot => {
        let metroOptions = [];
        querySnapshot.forEach(doc => {
          const metro = doc.data();
          metroOptions = [
            ...metroOptions,
            { value: metro.name, label: metro.name }
          ];
        });

        this.setState({ metroOptions });
      });
  };

  toggle = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  };

  handleInputChange = e => {
    const { name, value } = e.target;
    this.props.onChangeFilter(name, value);
  };

  runQuery = (field, value) => {
    const { rowsData } = this.props;

    const results = rowsData
      .filter(r => r[field].toLowerCase().indexOf(value.toLowerCase()) === 0)
      .slice(0, 10)
      .map(r => r[field])
      .filter((v, i, a) => a.indexOf(v) === i)
      .map(v => ({ value: v, label: v }));

    return Promise.resolve(results);
  };

  promiseOptions = (inputValue, field) => {
    return new Promise(resolve => {
      if (!inputValue) return resolve();
      this.runQuery(field, inputValue).then(data => resolve(data));
    });
  };

  handleSelect = (opt, field) => {
    this.props.onChangeFilter(field, opt && opt.value);
  };

  handleDateSelect = (date, type) => {
    const { filter } = this.props;
    const { startDate, endDate } = filter;
    const dateRange = {
      startDate,
      endDate,
      [type]: date
    };

    if (type === "startDate" && (!endDate || endDate < date)) {
      dateRange["endDate"] = new Date(date).setHours(23, 59);
    } else if (type === "endDate" && (!startDate || startDate > date)) {
      dateRange["startDate"] = new Date(date).setHours(0, 1);
    }

    this.props.onChangeDateFilter(dateRange);
  };

  handleSearchClick = () => {
    this.toggle();
    this.props.onSearchClick();
  };

  handleResetClick = () => {
    this.toggle();
    this.props.handleResetFilter();
  };

  render() {
    const { metroOptions } = this.state;
    const { filter } = this.props;

    return (
      <Dropdown
        isOpen={this.state.dropdownOpen}
        toggle={this.toggle}
        className="search-dropdown"
      >
        <DropdownToggle
          tag="button"
          className={`btn btn-light search-btn mx-3 ${this.props.btnClassName}`}
          onClick={this.toggle}
          data-toggle="dropdown"
          aria-expanded={this.state.dropdownOpen}
        >
          <i className="fas fa-search fa-2x" />
        </DropdownToggle>
        <DropdownMenu>
          <div className="form-group row">
            <label htmlFor="name" className="col-sm-2 col-form-label">
              Event name
            </label>
            <div className="col-sm-10">
              <AsyncSelect
                isClearable
                defaultOptions
                value={
                  filter.name
                    ? { value: filter.name, label: filter.name }
                    : null
                }
                onChange={opt => this.handleSelect(opt, "name")}
                loadOptions={inputVal => this.promiseOptions(inputVal, "name")}
              />
            </div>
          </div>

          <div className="form-group row">
            <label htmlFor="organizer" className="col-sm-2 col-form-label">
              Organizer
            </label>
            <div className="col-sm-10">
              <AsyncSelect
                isClearable
                cacheOptions
                defaultOptions
                value={
                  filter.organizer
                    ? { value: filter.organizer, label: filter.organizer }
                    : null
                }
                onChange={opt => this.handleSelect(opt, "organizer")}
                loadOptions={inputVal =>
                  this.promiseOptions(inputVal, "organizer")
                }
              />
            </div>
          </div>

          <div className="form-group row">
            <label htmlFor="city" className="col-sm-2 col-form-label">
              City
            </label>
            <div className="col-sm-5">
              <AsyncSelect
                isClearable
                cacheOptions
                defaultOptions
                value={
                  filter["city"]
                    ? {
                        value: filter["city"],
                        label: filter["city"]
                      }
                    : null
                }
                onChange={opt => this.handleSelect(opt, "city")}
                loadOptions={inputVal => this.promiseOptions(inputVal, "city")}
              />
            </div>

            <label htmlFor="state" className="col-sm-1 col-form-label">
              State
            </label>
            <div className="col-sm-4">
              <Select
                isClearable
                className="mb-2"
                placeholder="State"
                value={
                  filter["state"]
                    ? {
                        value: filter["state"],
                        label: filter["state"]
                      }
                    : null
                }
                onChange={opt => this.handleSelect(opt, "state")}
                options={stateOptions}
              />
            </div>
          </div>

          <div className="form-group row">
            <label htmlFor="metro" className="col-sm-2 col-form-label">
              Metro
            </label>
            <div className="col-sm-3">
              <Select
                isClearable
                className="mb-2"
                placeholder="Metro"
                value={
                  filter["metro"]
                    ? { value: filter["metro"], label: filter["metro"] }
                    : null
                }
                onChange={opt => this.handleSelect(opt, "metro")}
                options={metroOptions}
              />
            </div>
          </div>

          <div className="form-group row">
            <label htmlFor="startDate" className="col-sm-2 col-form-label">
              Starts
            </label>
            <div className="col-sm-3">
              <div className="form-group date-picker">
                <DatePicker
                  className="form-control"
                  selected={filter["startDate"]}
                  onChange={date => this.handleDateSelect(date, "startDate")}
                />
                <i className="far fa-calendar-alt text-primary" />
              </div>
            </div>

            <label htmlFor="endDate" className="col-sm-2 col-form-label">
              Ends
            </label>
            <div className="col-sm-3">
              <div className="form-group date-picker">
                <DatePicker
                  className="form-control"
                  selected={filter["endDate"]}
                  minDate={filter["startDate"] ? filter["startDate"] : null}
                  onChange={date =>
                    this.handleDateSelect(
                      new Date(date.setHours(23, 59)),
                      "endDate"
                    )
                  }
                />
                <i className="far fa-calendar-alt text-primary" />
              </div>
            </div>
          </div>

          <div className="form-group row">
            <label htmlFor="crawlerTime" className="col-sm-2 col-form-label">
              Crawled
            </label>
            <div className="col-sm-3">
              <div className="form-group date-picker">
                <DatePicker
                  className="form-control"
                  selected={filter["crawlerTime"]}
                  onChange={date =>
                    this.props.onChangeFilter("crawlerTime", new Date(date))
                  }
                />
                <i className="far fa-calendar-alt text-primary" />
              </div>
            </div>
          </div>

          <div className="form-group row">
            <label htmlFor="dataSource" className="col-sm-2 col-form-label">
              Source
            </label>
            <div className="col-sm-5">
              <Select
                isClearable
                className="mb-2"
                placeholder="Source"
                value={
                  filter["dataSource"]
                    ? {
                        value: filter["dataSource"],
                        label: filter["dataSource"]
                      }
                    : null
                }
                onChange={opt => this.handleSelect(opt, "dataSource")}
                options={sourceOptions}
              />
            </div>
          </div>

          <div className="form-group row mb-0">
            <div className="col-sm-2">
              <button className="btn btn-light" onClick={this.toggle}>
                Cancel
              </button>
            </div>
            <div className="col-sm-10 text-right">
              <button className="btn btn-light" onClick={this.handleResetClick}>
                Clear
              </button>
              <button
                className="btn btn-primary ml-3"
                onClick={this.handleSearchClick}
              >
                Search
              </button>
            </div>
          </div>
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default Search;
