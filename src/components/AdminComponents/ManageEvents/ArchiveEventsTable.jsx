import React, { Component } from "react";
import moment from "moment";

import { db } from "../../firebase";

import RowsPerPageSelect from "../common/RowsPerPageSelect";
import { AuthContext } from "../../auth-context";
import Spinner from "../common/Spinner";

class ArchiveEventsTable extends Component {
  state = {
    order: "desc",
    orderBy: "archiveDateTime",
    selected: [],
    data: {},
    page: 0,
    isLastPage: false,
    rowsPerPage: 20,
    isLoading: true
  };

  componentDidMount() {
    this.fetchEvents();
    this.setTableWrapperHeight();
  }

  fetchEvents = () => {
    this.setState({ isLoading: true });
    const { order, orderBy, rowsPerPage, page } = this.state;
    const user = this.context;
    let query = db
      .collection("eventsPast")
      .orderBy(orderBy, order)
      .limit(page * rowsPerPage + rowsPerPage + 1);

    if (!user.adminFlag) {
      query = query.where("createEventInfo.createEventUserUID", "==", user.uid);
    }

    query
      .get()
      .then(querySnapshot => {
        let data = {};
        const currPageDocs = querySnapshot.docs.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        );
        currPageDocs.forEach(doc => {
          // doc.data() is never undefined for query doc snapshots
          // console.log(doc.id, " => ", doc.data());
          data[doc.id] = doc.data();
          data[doc.id]['documentID']=doc.id;
        });
        Object.keys(data).forEach(key => {
          if (!data[key]["createEventInfo"]) {
            console.error(
              "doc without meta info: ",
              data[key],
              data[key]["name"]
            );
          }
        });

        const isLastPage =
          querySnapshot.docs.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage + 1
          ).length < rowsPerPage;
        this.setState({ data: data, isLoading: false, isLastPage });
      })
      .catch(error => {
        console.error(error);
      });
  };

  setTableWrapperHeight = () => {
    const height = window.innerHeight - 207;
    if (this.tableWrapper) this.tableWrapper.style.height = height + "px";
  };

  mapFirebaseDocToRow = (refId, i) => {
    const { data } = this.state;
    return {
      ...data[refId],
      id: refId,
      imageUrl: data[refId]["image"]["downloadURL"],
      thumbUrl: data[refId]["image"]["downloadURLSmall"],
      "location.venueName":
        data[refId]["location"]["venueName"] ||
        data[refId]["location"]["address"],
      "location.city": data[refId]["location"]["city"],
      startDateTime: moment(data[refId]["startDateTime"].toDate())
        .tz("America/Los_Angeles")
        .format("MM/DD/YY"),
      startTime: moment(data[refId]["startDateTime"].toDate())
        .tz("America/Los_Angeles")
        .format("hh:mm A"),
      endDateTime: moment(data[refId]["endDateTime"].toDate())
        .tz("America/Los_Angeles")
        .format("MM/DD/YY"),
      endTime: moment(data[refId]["endDateTime"].toDate())
        .tz("America/Los_Angeles")
        .format("hh:mm A"),
      "recommendAge.min": data[refId]["recommendAge"]["min"],
      "recommendAge.max": data[refId]["recommendAge"]["max"],
      "price.min": data[refId]["price"]["min"],
      "price.max": data[refId]["price"]["max"],
      tags: data[refId]["tags"].join(", "),
      categories:
        data[refId]["categories"] && data[refId]["categories"].join(", "),
      "createEventInfo.createEventTime":
        data[refId]["createEventInfo"] &&
        data[refId]["createEventInfo"]["createEventTime"] &&
        moment(
          data[refId]["createEventInfo"]["createEventTime"].toDate()
        ).format("MM/DD/YY"),
      "createEventInfo.createEventUserName":
        data[refId]["createEventInfo"] &&
        data[refId]["createEventInfo"]["createEventUserName"],
      archiveDateTime:
        data[refId]["archiveDateTime"] &&
        moment(data[refId]["archiveDateTime"].toDate())
          .tz("America/Los_Angeles")
          .format("MM/DD/YY hh:mm A")
    };
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  handleSelectAllClick = event => {
    if (event.target.checked) {
      this.setState(state => ({ selected: Object.keys(state.data) }));
      return;
    }
    this.setState({ selected: [] });
  };

  handleClick = (event, id) => {
    event.stopPropagation();

    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    this.setState({ selected: newSelected });
  };

  handleDocumentIdCopyClick = (id) => {
    navigator.clipboard.writeText(id);
      }

  handleChangePage = (event, page) => {
    this.setState({ page }, this.fetchEvents);
  };

  handleChangeRowsPerPage = rowsPerPage => {
    this.setState({ rowsPerPage, page: 0 }, this.fetchEvents);
  };

  render() {
    let user = this.context;
    const {
      data,
      order,
      orderBy,
      selected,
      isLastPage,
      page,
      rowsPerPage,
      isLoading
    } = this.state;
    const numSelected = selected.length;
    const rowCount = Object.keys(data).length;
    const rowsData = Object.keys(data).map(this.mapFirebaseDocToRow);
    return (
      <React.Fragment>
        <nav className="navbar navbar-light bg-light pt-2">
          <div className="mr-auto toolbar-buttons">
            <button
              className="btn btn-primary rounded"
              disabled={page === 0}
              onClick={e => this.handleChangePage(e, page - 1)}
            >
              <i className="fas fa-caret-left"></i>
            </button>
            <span className="page mx-3">{page + 1}</span>
            <button
              className="btn btn-primary rounded"
              disabled={isLastPage}
              onClick={e => this.handleChangePage(e, page + 1)}
            >
              <i className="fas fa-caret-right"></i>
            </button>
            <RowsPerPageSelect
              rowsPerPage={rowsPerPage}
              onChangeRowsPerPage={this.handleChangeRowsPerPage}
            />
          </div>
        </nav>
        <div
          ref={el => (this.tableWrapper = el)}
          className="table-outer-wrapper"
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <table className="table table-striped table-hover table-fixed">
              <thead>
                <tr>
                  <th>
                    <div className="custom-control custom-checkbox">
                      <input
                        id={`checkbox-selectall-archived`}
                        type="checkbox"
                        className="custom-control-input"
                        checked={numSelected === rowCount}
                        onChange={this.handleSelectAllClick}
                      />

                      <label
                        className="custom-control-label"
                        htmlFor={`checkbox-selectall-archived`}
                      ></label>
                    </div>
                  </th>
                  <th className="image-th"></th>
                  {rowFields.map((field, i) => {
                    const sortingClass =
                      orderBy === field["name"] ? `sorting_${order}` : "";
                      if (field["name"] === "documentID" && user.adminFlag) {
                        return(
                          <th
                          key={i}
                          className={`align-middle sorting ${sortingClass} ${
                            field["name"]
                          }`}
                        >
                          <span>{field["label"]}</span>
                        </th>
                        )
                      }
                      if (field["name"] !== "documentID") {

                        return field["sortable"] ? (
                          <th
                            key={i}
                            className={`align-middle sorting ${sortingClass} ${
                              field["name"]
                            }`}
                          >
                            <span>{field["label"]}</span>
                          </th>
                        ) : (
                          <th key={i} className={`align-middle`}>
                            {field["label"]}
                          </th>
                        );
                      }
                      return null;
                  })}
                </tr>
              </thead>
              <tbody>
                {/* {stableSort(rowsData, getSorting(order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) */}
                {rowsData.map(n => {
                  const isSelected = this.isSelected(n.id);
                  return (
                    <tr
                      onClick={event => this.handleClick(event, n.id)}
                      key={n.id}
                      className={`${isSelected ? "table-primary" : ""}`}
                    >
                      <td>
                        <div className="custom-control custom-checkbox">
                          <input
                            id={`checkbox-${n.id}`}
                            type="checkbox"
                            className="custom-control-input"
                            checked={isSelected}
                            onChange={_ => null}
                            onClick={e => e.stopPropagation()}
                          />

                          <label
                            className="custom-control-label"
                            htmlFor={`checkbox-${n.id}`}
                            onClick={e => this.handleClick(e, n.id)}
                          ></label>
                        </div>
                      </td>
                      <td>
                        <div
                          className="embed-responsive embed-responsive-16by9 event-image event-image-thumb"
                          style={{
                            backgroundImage: `url(${
                              n["thumbUrl"]
                                ? n["thumbUrl"]
                                : "img/logo_placeholder.jpg"
                            })`
                          }}
                        ></div>
                      </td>
                      {rowFields.map((field, i) => {
                      if( field.name !== "documentID")
                        return (<td key={i}>{n[field.name]}</td>)
                      else{
                        return (
                          user.adminFlag && <td key={n.id} className="clone-td">
                          <span
                          className="clone-btn"
                          onClick={() => this.handleDocumentIdCopyClick(n.id)}
                          data-toggle="tooltip"
                          data-placement="bottom"
                          title="Copy ID"
                          >
                          </span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <span>{n["documentID"]}</span>
                          </td>
                        );
                      }
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!isLoading && !rowsData.length && (
            <div className="alert alert-info text-center">No results found</div>
          )}
        </div>
      </React.Fragment>
    );
  }
}

ArchiveEventsTable.contextType = AuthContext;
export default ArchiveEventsTable;

let rowFields = [
  { name: "frequency", label: "Frequency", sortable: false },
  {
    name: "createEventInfo.createEventTime",
    label: "Created",
    sortable: false
  },
  { name: "archiveDateTime", label: "Archived", sortable: false },
  {
    name: "createEventInfo.createEventUserName",
    label: "User",
    sortable: false
  },
  { name: "name", label: "Name", sortable: false },
  { name: "location.city", label: "City", sortable: false },
  { name: "startDateTime", label: "Date", sortable: false },
  { name: "endDateTime", label: "End Date", sortable: false },
  { name: "price.min", label: "Price min", sortable: false },
  { name: "price.max", label: "Price max", sortable: false },
  { name: "categories", label: "Category", sortable: false },
  { name: "tags", label: "Tags", sortable: false },
  { name: "organizer", label: "Organizer", sortable: false },
  { name: "location.venueName", label: "Location", sortable: false },
  { name: "metro", label: "Metro", sortable: false },
  { name: "startTime", label: "Start time", sortable: false },
  { name: "endTime", label: "End Time", sortable: false },
  { name: "recommendAge.min", label: "Age min", sortable: false },
  { name: "recommendAge.max", label: "Age max", sortable: false },
  { name: "documentID", label: "Document Id", sortable: true },
  { name: "email", label: "Email", sortable: false },
  { name: "phoneNumber", label: "Phone", sortable: false },
  { name: "weburl", label: "Url", sortable: false },
  { name: "dataSource", label: "Data Source", sortable: false },
  { name: "operationNotes", label: "Operation Notes", sortable: false }
];
