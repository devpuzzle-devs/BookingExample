import React, { Component } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import moment from "moment";
import axios from "axios";
import toast from "toasted-notes";
import classnames from 'classnames';
import withStyles from 'react-jss'
import "toasted-notes/src/styles.css";

import firebase, { db } from "../../firebase";
import { AuthContext } from "../../auth-context";
import { loadMetro } from "../../requests";

import AddEvent from "../AddEvent";
import Spinner from "../common/Spinner";
import UpdateEventLog from "../UpdateEventLog";
import IssueEventLog from "../IssueEventLog";
import Search from "../Search";
import AdminConsole from "../AdminConsole";
import RowsPerPageSelect from "../common/RowsPerPageSelect";
import SpinResolver from "../SpinResolver";

import { styles } from "./UpcomingEventsTable.style";

import { range, getSorting, stableSort, dateRangeOverlaps } from "./utils";
import Select from "react-select";
import AddCamp from '../AddCamp';

class UpcomingEventsTable extends Component {
  state = {
    order: "desc",
    orderBy: "createEventInfo.createEventTime",
    selected: [],
    data: {},
    filteredRefIds: [],
    page: 0,
    isLastPage: false,
    rowsPerPage: 20,
    isLoading: true,
    filter: {},
    isFilterResult: false,
    addModalIsOpen: false,
    editModalIsOpen: false,
    editModalCampIsOpen: false,
    addCampModalIsOpen: false,
    confirmModalIsOpen: false,
    confirmModalMsg: null,
    editingId: null,
    requestChangeModalIsOpen: false,
    requestChangeId: null,
    requestChangeMessage: "",
    requestChangeConfirm: "",
    requestChangeError: "",
    updateEventLogId: null,
    updateEventLogModalIsOpen: false,
    issueEventLogId: null,
    issueEventLogModalIsOpen: false,
    userNames: {},
    metroOptions: [],
  };

  componentDidMount() {
    const filterStr = localStorage.getItem("filter");
    if (filterStr) {
      let filter = JSON.parse(filterStr);
      if (filter["startDate"])
        filter["startDate"] = new Date(filter["startDate"]);
      if (filter["endDate"]) filter["endDate"] = new Date(filter["endDate"]);
      this.setState({ filter });
    }
    this.fetchEvents();
    this.fetchMetro();
    this.loadUserNames();
    this.setTableWrapperHeight();
  }

  fetchMetro = () => {
    this.setState({ isMetroLoading: true });
    loadMetro()
        .then(metroOptions => {
          this.setState({ metroOptions });
        })
        .catch(e => console.log(`Error happened when fetching metro: ${e}`))
        .finally(() => this.setState({ isMetroLoading: false }))
  };

  fetchEvents = () => {
    this.setState({ isLoading: true });

    const user = this.context;
    let query = db
      .collection("events")
      // .orderBy(orderBy, order)
      // .limit(page * rowsPerPage + rowsPerPage + 1);
      .limit(4000);
    // Object.keys(filter).forEach(key => {
    //     if (key === 'tags') {
    //         query = query.where('tags', 'array-contains', filter['tags']);
    //     }
    //     else {
    //         query = query.where(key, '==', filter[key]);
    //     }
    // })
    // let isFilterResult = false;
    // if (Object.values(filter).map(v => !!v).length) {
    //     isFilterResult = true;
    // }

    if (!user.adminFlag) {
      query = query.where("createEventInfo.createEventUserUID", "==", user.uid);
    }

    query
      .get()
      .then(querySnapshot => {
        let data = {};

        querySnapshot.forEach(doc => {
          // doc.data() is never undefined for query doc snapshots
          // console.log(doc.id, " => ", doc.data());

        // TODO: The data validation should be cancel after the downloading of events on IOS will be fixed
        /*
        * its causes an error when event are loading
        * ignored broken data in "Upcoming events" tag
        **/
        if (doc.data()['type'] === 'camp'){
          db.collection('events')
            .doc(doc.id)
            .collection("campSessions")
            .get()
            .then( docs => {
              const listOfSessions = []
              docs.docs.forEach( doc => {
                listOfSessions.push(doc.data())
              })
              data[doc.id]['listOfSessions'] = listOfSessions
            })
            .catch( err => console.log(err))
        }

          if (doc.data()['image'] !== undefined ){
            data[doc.id] = doc.data();
            data[doc.id]['documentID'] = doc.id;
          } else {
            console.log('Event with broken data ---', doc.data())
          }
        });

        // const isLastPage = querySnapshot.docs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage + 1).length < rowsPerPage;
        this.setState({ data: data, isLoading: false }, () => {
          const { filter } = this.state;
          if (Object.keys(filter).length) {
            this.onSearchClick();
          }
        });
      })
      .catch(error => {
        console.error(error);
        toast.notify(`${error}`, { duration: null });
      });
  };

  loadUserNames = () => {
    db.collection("userNames")
      .get()
      .then(querySnapshot => {
        const userNames = {};
        querySnapshot.forEach(function(doc) {
          // doc.data() is never undefined for query doc snapshots
          // console.log(doc.id, " => ", doc.data());
          userNames[doc.id] = doc.data().userName;
        });
        this.setState({ userNames });
      })
      .catch(error => {
        console.error("Error getting documents: ", error);
        toast.notify(`${error}`, { duration: null });
      });
  };

  setTableWrapperHeight = () => {
    const height = window.innerHeight - 207;
    if (this.tableWrapper) this.tableWrapper.style.height = height + "px";
  };

  mapFirebaseDocToRow = (refId, i) => {
    const { data } = this.state;

    const { startDateTime, endDateTime, crawlerTime } = data[refId];

    return {
      ...data[refId],
      id: refId,
      imageUrl: data[refId]["image"]["downloadURL"],
      thumbUrl: data[refId]["image"]["downloadURLSmall"],
      "location.venueName":
        data[refId]["location"]["venueName"] ||
        data[refId]["location"]["address"],
      "location.city": data[refId]["location"]["city"],
      startDateTime: startDateTime.toDate(),
      endDateTime: endDateTime.toDate(),
      crawlerTime: crawlerTime ? crawlerTime.toDate() : null,

      startDateTimeToDisplay: moment(startDateTime.toDate())
        .format("MM/DD/YY"),
      endDateTimeToDisplay: moment(endDateTime.toDate())
        .format("MM/DD/YY"),
      crawlerTimeToDisplay:
        crawlerTime &&
        moment(crawlerTime.toDate())
          .format("MM/DD/YY"),

      startTime: moment(startDateTime.toDate())
        .format("hh:mm A"),
      endTime: moment(endDateTime.toDate())
        .format("hh:mm A"),

      "recommendAge.min": data[refId]["recommendAge"]["min"],
      "recommendAge.max": data[refId]["recommendAge"]["max"],
      "price.min": data[refId]["price"]["min"],
      "price.max": data[refId]["price"]["max"],
      categories:
        data[refId]["categories"] && data[refId]["categories"].join(", "),
      tags: data[refId]["tags"].join(", "),
      "createEventInfo.createEventTime":
        data[refId]["createEventInfo"] &&
        data[refId]["createEventInfo"]["createEventTime"] &&
        moment(
          data[refId]["createEventInfo"]["createEventTime"].toDate()
        ).format("MM/DD/YY"),
      "createEventInfo.createEventUserName":
        data[refId]["createEventInfo"] &&
        data[refId]["createEventInfo"]["createEventUserName"]
    };
  };

  createSortHandler = property => event => {
    this.handleRequestSort(event, property);
  };

  handleRequestSort = (_, property) => {
    const orderBy = property;
    let order = "desc";

    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }

    this.setState({ order, orderBy });
  };

  handleSelectAllClick = event => {
    if (event.target.checked) {
      const {
        data,
        filteredRefIds,
        order,
        orderBy,
        page,
        rowsPerPage
      } = this.state;
      const refIds = filteredRefIds.length ? filteredRefIds : Object.keys(data);
      const rowsData = refIds.map(this.mapFirebaseDocToRow);
      const currPageIds = stableSort(rowsData, getSorting(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map(r => r.id);
      this.setState({ selected: currPageIds });
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

  handleChangePage = (event, page) => {
    this.setState({ page, selected: [] });
  };

  handleChangePageInput = e => {
    const { value } = e.target;
    if (typeof parseInt(value, 10) === "number") {
      this.setState({ page: parseInt(value, 10) - 1 });
    }
  };

  handleChangeRowsPerPage = rowsPerPage => {
    this.setState({ rowsPerPage, page: 0 });
  };

  handleCheckbox = (e, id) => {
    const { name, checked } = e.target;
    const user = this.context;
    const { data } = this.state;
    if ( name === "editorsChoice" ) {
      if (checked) {
        data[id]["tags"] = [...data[id]["tags"], "#editorschoice" ] ;
      }
      else {
        data[id]["tags"] = data[id]["tags"].filter(item => {
          return item !== "#editorschoice";
        })
      }
    }


    const newEventLogEntry = {
      userAction: `set "${name}" from "${data[id][name]}" to "${checked}"`,
      userActionTimestamp: new Date(),
      userUID: user.uid
    };

    const newData = {
      ...data,
      [id]: {
        ...data[id],
        [name]: checked
      }
    };

    let dataToUpdate = {
      [name]: checked,
      tags: data[id]["tags"]
    };

    this.setState({ data: newData });

    if (name === "approvedFlag") {
      dataToUpdate = {
        ...dataToUpdate,
        "metaData.approvedByUser": firebase.auth().currentUser
          ? firebase.auth().currentUser.uid
          : null
      };
    }

    const eventsRef = db.collection("events");

    eventsRef
      .doc(id)
      .update(dataToUpdate)
      .then(() => {
        eventsRef
          .doc(id)
          .collection("updateEventLog")
          .doc()
          .set(newEventLogEntry);
      })
      .catch(error => {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
        this.setState({ data });
        toast.notify(`${error}`, { duration: null });
      });
  };

  handleCopyClick = (id, type, e) => {
    e.stopPropagation();
    const { data } = this.state;
    const user = this.context;
    let srcItem = data[id];

    srcItem = {
      ...srcItem,
      metaData: {
        approvedByUser: null,
        uploadByUser: firebase.auth().currentUser
          ? firebase.auth().currentUser.uid
          : null,
        uploadDate: firebase.firestore.FieldValue.serverTimestamp()
      },
      createEventInfo: {
        createEventTime: firebase.firestore.FieldValue.serverTimestamp(),
        createEventUserName:
          user.userName ||
          (firebase.auth().currentUser &&
            firebase.auth().currentUser.displayName) ||
          null,
        createEventUserUID:
          user.uid ||
          (firebase.auth().currentUser && firebase.auth().currentUser.uid) ||
          null
      }
    };

    const newListOfSessions = srcItem.listOfSessions
    delete srcItem.listOfSessions

    db.collection("events")
      .add(srcItem)
      .then(docRef => {
        console.log("Document written with ID: ", docRef.id);
        const batch = db.batch();
        newListOfSessions.forEach(session => {
              batch.set(
                db
                  .collection("events")
                  .doc(docRef.id)
                  .collection("campSessions")
                  .doc(),
                session
              );
            });
            batch.commit().then(() => {
            });

        this.onEventClone(docRef.id, type);
      })
      .catch(function(error) {
        console.error("Error adding document: ", error);
        toast.notify(`${error}`, { duration: null });
      });
  };

  handleDocumentIdCopyClick = (id) => {
    navigator.clipboard.writeText(id);
  };

  handleEditClick = (id, type, tags, e) => {
    e.stopPropagation();
    if ((type !== undefined && type === 'camp') || tags.includes('#camp')) {
      this.setState({ editModalCampIsOpen: true, editingId: id });
    } else {
      this.setState({ editModalIsOpen: true, editingId: id });
    }

  };

  handleHistoryClick = (id, e) => {
    e.stopPropagation();
    this.setState({
      updateEventLogId: id,
      updateEventLogModalIsOpen: true
    });
  };

  // event issue log modal

  toggleUpdateEventLogModal = () => {
    this.setState({
      updateEventLogModalIsOpen: !this.state.updateEventLogModalIsOpen
    });
  };

  handleIssueLogClick = (id, e) => {
    e.stopPropagation();
    this.setState({
      issueEventLogId: id,
      issueEventLogModalIsOpen: true
    });
  };

  toggleIssueEventLogModal = () => {
    this.setState({
      issueEventLogModalIsOpen: !this.state.issueEventLogModalIsOpen
    });
  };

  handleEventIssuesChanges = (eventId, numOfIssues) => {
    const { data } = this.state;

    this.setState({
      data: {
        ...data,
        [eventId]: { ...data[eventId], numOfOutstandingIssues: numOfIssues }
      }
    });
  };

  toggleEditModal = id => {
    this.setState({
      editModalIsOpen: !this.state.editModalIsOpen,
      editingId: id
    });
  };
  toggleEditModalCamp = id => {
    this.setState({
      editModalCampIsOpen: !this.state.editModalCampIsOpen,
      editingId: id
    });
  };

  handleDeleteClick = () => {
    const { selected } = this.state;
    alert("Id's to delete: " + selected.join(", "));
    //TODO : delete documents by id
  };

  handleBulkApprove = () => {
    const { selected, data } = this.state;
    const user = this.context;

    const batch = db.batch();

    let newData = { ...data };
    const unApprovedIds = selected.filter(id => !data[id]["approvedFlag"]);

    const eventsToApprove = unApprovedIds.length
      ? unApprovedIds.map(id => ({ id, approvedFlag: true }))
      : selected.map(id => ({ id, approvedFlag: false }));

    eventsToApprove.forEach(eventData => {
      const { id, approvedFlag } = eventData;
      const newEventLogEntry = {
        userAction: `set "approvedFlag" from "${!approvedFlag}" to "${approvedFlag}"`,
        userActionTimestamp: new Date(),
        userUID: user.uid
      };

      const dataToUpdate = {
        approvedFlag,
        "metaData.approvedByUser": firebase.auth().currentUser
          ? firebase.auth().currentUser.uid
          : null
      };

      const eventRef = db.collection("events").doc(id);

      batch.update(eventRef, dataToUpdate);
      batch.set(
        db
          .collection("events")
          .doc(id)
          .collection("updateEventLog")
          .doc(),
        newEventLogEntry
      );

      newData = {
        ...newData,
        [id]: {
          ...data[id],
          ...dataToUpdate
        }
      };
    });

    this.setState({ data: newData });

    batch
      .commit()
      .then(() => {})
      .catch(error => {
        console.error(error);
        this.setState({ data });
        toast.notify(`${error}`, { duration: null });
      });
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  toggleCreateModal = () => {
    this.setState({ addModalIsOpen: !this.state.addModalIsOpen });
  };

  toggleCreateCampModal = () => {
    this.setState({ addCampModalIsOpen: !this.state.addCampModalIsOpen });
  };

  toggleConfirmModal = () => {
    this.setState({
      confirmModalIsOpen: !this.state.confirmModalIsOpen,
      confirmModalMsg: null
    });
  };

  onEventSubmit = (id, eventData, showConfirmationModal) => {
    // this.fetchEvents();
    this.setState({
      confirmModalIsOpen: showConfirmationModal,
      data: {
        ...this.state.data,
        [id]: eventData
      }
    });
  };

  onEventClone = (id, type) => {
    this.fetchEvents();
    if (type === "camp") {
      this.setState({
        editModalCampIsOpen: true,
        editingId: id
      });
    } else {
    this.setState({
      editModalIsOpen: true,
      editingId: id
    });
    }
  };

  onSearchClick = (order = "desc") => {
    const filteredRefIds = this.applyFilter();
    this.setState({
      order: order,
      orderBy: "createEventInfo.createEventTime",
      page: 0,
      filteredRefIds,
      isFilterApplied: true,
      selected: []
    });
    localStorage.setItem("filter", JSON.stringify(this.state.filter));
  };

  handleMetroDropdownClick = (name, value) => {
    this.onChangeFilter(name, value, () => this.onSearchClick('asc'));
  };

  onChangeFilter = (name, value, onFilterChanged) => {
      let { filter } = this.state;
      if (!value) {
        delete filter[name];
      } else {
        filter = {
          ...filter,
          [name]: value
        };
      }
      console.log(filter);
      this.setState({ filter }, () => onFilterChanged && onFilterChanged());
  };

  onChangeDateFilter = ({ startDate, endDate }) => {
    let { filter } = this.state;
    this.setState({
      filter: {
        ...filter,
        startDate,
        endDate
      }
    });
  };

  handleResetFilter = () => {
    this.setState({
      filter: {},
      page: 0,
      filteredRefIds: [],
      isFilterApplied: false,
      selected: []
    });
    localStorage.removeItem("filter");
  };

  applyFilter = () => {
    const { filter, data } = this.state;
    if (!Object.keys(filter).length) return [];

    let result = Object.keys(data);
    Object.keys(filter).forEach(key => {
      result = result.filter(refId => {
        if (key === "tags") {
          return data[refId][key].indexOf(filter[key]) > -1;
        } else if (key === "startDate") {
          return dateRangeOverlaps(
            data[refId]["startDateTime"].toDate(),
            data[refId]["endDateTime"].toDate(),
            filter["startDate"],
            filter["endDate"]
          );
        } else if (key === "endDate") {
          // skip endDate key since all logic for date filter performed when filtering by startDate
          return true;
        } else if (key.indexOf(".") > -1) {
          const keys = key.split(".");
          return data[refId][keys[0]][keys[1]] === filter[key];
        } else {
          return data[refId][key] === filter[key];
        }
      });
    });
    return result;
  };

  toggleRequestChangeModal = (e, id) => {
    this.setState({
      requestChangeModalIsOpen: !this.state.requestChangeModalIsOpen,
      requestChangeId: id,
      requestChangeMessage: "",
      requestChangeConfirm: "",
      requestChangeError: ""
    });
  };

  handleInputChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  sendRequestChange = () => {
    const API_REQUEST_CHANGE =
      "https://test.cloudfunctions.net/api/request-change";

    const { requestChangeId, data, requestChangeMessage } = this.state;
    const userId =
      data[requestChangeId]["createEventInfo"]["createEventUserUID"];

    this.getUser(userId)
      .then(user => {
        if (!user.userEmail) {
          throw new Error("Unknown user email");
        }
        const postData = {
          sendTo: user.userEmail,
          message: requestChangeMessage,
          event: data[requestChangeId]
        };

        return axios.post(API_REQUEST_CHANGE, postData);
      })
      .then(response => {
        this.setState({ requestChangeConfirm: response.data });
        console.log(response);
      })
      .catch(error => {
        this.setState({ requestChangeError: "" + error });
        console.error(error);
        toast.notify(`${error}`, { duration: null });
      });
  };

  getUser = async id => {
    return db
      .collection("users")
      .doc(id)
      .get()
      .then(doc => doc.data());
  };

  render() {
    const user = this.context;
    let {
      data,
      filteredRefIds,
      order,
      orderBy,
      selected,
      page,
      rowsPerPage,
      isLoading,
      filter,
      isFilterApplied,
      requestChangeMessage,
      updateEventLogId,
      issueEventLogId
    } = this.state;

    const { classes } = this.props;

    let refIds = isFilterApplied ? filteredRefIds : Object.keys(data);

    const numSelected = selected.length;
    const rowCount = refIds.length;
    const rowsData = refIds.map(this.mapFirebaseDocToRow);
    const totalPages = Math.ceil(rowCount / rowsPerPage);
    const currPageRowCount = refIds.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    ).length;

    return (
      <React.Fragment>
        <nav className={classnames(classes.wrapper, 'navbar navbar-light bg-light pt-2')}>
          <div className={classnames(classes.leftBar, "mr-auto toolbar-buttons")}>
            <button
              className="btn btn-primary rounded mr-1"
              disabled={page === 0}
              onClick={e => this.handleChangePage(e, page - 1)}
            >
              <i className="fas fa-caret-left"></i>
            </button>
            <UncontrolledDropdown>
              <DropdownToggle tag="button" className="btn" caret>
                {page + 1}
              </DropdownToggle>
              <DropdownMenu className="page-select">
                <DropdownItem header>Page</DropdownItem>
                {range(0, totalPages).map(i => (
                  <DropdownItem
                    key={i}
                    onClick={e => this.handleChangePage(e, i)}
                  >
                    {i + 1}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </UncontrolledDropdown>
            <button
              className="btn btn-primary rounded ml-1"
              disabled={page + 1 >= totalPages}
              onClick={e => this.handleChangePage(e, page + 1)}
            >
              <i className="fas fa-caret-right"></i>
            </button>
            <RowsPerPageSelect
              rowsPerPage={rowsPerPage}
              onChangeRowsPerPage={this.handleChangeRowsPerPage}
            />
            <span className="vertical-separator"></span>

            <Search
              onChangeFilter={this.onChangeFilter}
              onChangeDateFilter={this.onChangeDateFilter}
              onSearchClick={this.onSearchClick}
              handleResetFilter={this.handleResetFilter}
              filter={filter}
              rowsData={rowsData}
              btnClassName={
                Object.keys(filter).length ? "btn-outline text-primary" : ""
              }
            />

            {!this.state.isMetroLoading ?
                <Select
                  isClearable
                  className={classes.select}
                  placeholder="Metro"
                  value={
                    filter["metro"]
                        ? { value: filter["metro"], label: filter["metro"] }
                        : null
                  }
                  onChange={opt => this.handleMetroDropdownClick('metro', opt && opt.value, )}
                  options={this.state.metroOptions}
                /> : <SpinResolver/>}

            {user.adminFlag && <AdminConsole />}
          </div>
          <div className={classes.controlButtons}>
            {user.adminFlag && (
                <button
                    className="btn btn-primary rounded mr-2"
                    onClick={this.handleBulkApprove}
                    disabled={!selected.length}
                >
                  <i className="fas fa-check"></i> Approve
                </button>
            )}

            <button
                className="btn btn-primary rounded mr-2"
                onClick={this.toggleCreateModal}
            >
              <i className="fas fa-plus"></i> Create event
            </button>

            <button
                className="btn btn-primary rounded"
                onClick={this.toggleCreateCampModal}
            >
              <i className="fas fa-plus"></i> Create camp
            </button>
          </div>
        </nav>
        <div
          ref={el => (this.tableWrapper = el)}
          className="table-outer-wrapper"
        >
          {isLoading ? (
            <Spinner />
          ) : (
              <table className="table table-striped table-hover table-fixed sortable">
                <thead>
                  <tr>
                    <th>
                      <div className="custom-control custom-checkbox">
                        <input
                          id={`checkbox-selectall`}
                          type="checkbox"
                          className="custom-control-input"
                          checked={numSelected === currPageRowCount}
                          onChange={this.handleSelectAllClick}
                        />

                        <label
                          className="custom-control-label"
                          htmlFor={`checkbox-selectall`}
                        ></label>
                      </div>
                    </th>
                    <th className="image-th"></th>
                    <th className="edit-th"></th>
                    <th className="clone-th"></th>
                    <th className="history-th"></th>
                    {user.adminFlag ? (
                      <th
                        className={`align-middle sorting ${
                          orderBy === "numOfOutstandingIssues"
                            ? `sorting_${order}`
                            : ""
                          }`}
                        onClick={this.createSortHandler("numOfOutstandingIssues")}
                      >
                        Issues
                    </th>
                    ) : (
                        <th className={`align-middle`}>Issues</th>
                      )}
                    {user.adminFlag ? (
                      <React.Fragment>
                        <th
                          className={`align-middle sorting ${
                            orderBy === "approvedFlag" ? `sorting_${order}` : ""
                            }`}
                          onClick={this.createSortHandler("approvedFlag")}
                        >
                          Approved
                      </th>
                        <th
                          className={`align-middle sorting ${
                            orderBy === "editorsChoice" ? `sorting_${order}` : ""
                            }`}
                          onClick={this.createSortHandler("editorsChoice")}
                        >
                          Editor's choice
                      </th>
                        <th className="reqchange-th">Request change</th>
                        <th
                          className={`align-middle sorting ${
                            orderBy === "activeFlag" ? `sorting_${order}` : ""
                            }`}
                          onClick={this.createSortHandler("activeFlag")}
                        >
                          Active
                      </th>
                        <th
                          className={`align-middle sorting ${
                            orderBy === "expiredFlag" ? `sorting_${order}` : ""
                            }`}
                          onClick={this.createSortHandler("expiredFlag")}
                        >
                          Expired
                      </th>
                      </React.Fragment>
                    ) : null}
                    {rowFields.map((field, i) => {
                      const sortingClass =
                        orderBy === field["name"] ? `sorting_${order}` : "";
                      if (field["name"] === "documentID" && user.adminFlag) {
                        return (
                          <th
                            key={i}
                            className={`align-middle sorting ${sortingClass} ${
                              field["name"]
                              }`}
                            onClick={this.createSortHandler(field.name)}
                          >
                            <span>{field["label"]}</span>
                          </th>
                        )
                      }
                      if (field["name"] !== "documentID") {
                        return field["sortable"] && user.adminFlag ? (
                          <th
                            key={i}
                            className={`align-middle sorting ${sortingClass} ${
                              field["name"]
                              }`}
                            onClick={this.createSortHandler(field.name)}
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
                  {stableSort(rowsData, getSorting(order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(n => {
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
                          <td className="text-center edit-td">
                            <span
                              className="edit-btn"
                              onClick={e => this.handleEditClick(n.id, n.type, n.tags, e )}
                            ></span>
                          </td>
                          <td className="text-center clone-td">
                            <span
                              className="clone-btn"
                              onClick={e => this.handleCopyClick(n.id, n.type, e)}
                            ></span>
                          </td>
                          <td className="text-center history-td">
                            <span
                              className="history-btn"
                              onClick={e => this.handleHistoryClick(n.id, e)}
                            ></span>
                          </td>
                          <td className="text-center report-issue-td">
                            <span
                              className={`report-issue-btn ${
                                n.numOfOutstandingIssues > 0 ? "has-issues" : ""
                                }`}
                              onClick={e => this.handleIssueLogClick(n.id, e)}
                            ></span>
                          </td>
                          {user.adminFlag ? (
                            <React.Fragment>
                              <td className="text-center">
                                <div className="custom-control custom-checkbox">
                                  <input
                                    id={`approved-${n.id}`}
                                    name="approvedFlag"
                                    type="checkbox"
                                    className="custom-control-input approved-checkbox"
                                    checked={n["approvedFlag"]}
                                    onChange={e => this.handleCheckbox(e, n.id)}
                                  />

                                  <label
                                    className="custom-control-label"
                                    htmlFor={`approved-${n.id}`}
                                  ></label>
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="custom-control custom-checkbox">
                                  <input
                                    id={`editorschoice-${n.id}`}
                                    name="editorsChoice"
                                    type="checkbox"
                                    className="custom-control-input"
                                    checked={n["editorsChoice"]}
                                    onChange={e => this.handleCheckbox(e, n.id)}
                                  />

                                  <label
                                    className="custom-control-label"
                                    htmlFor={`editorschoice-${n.id}`}
                                  ></label>
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="custom-control custom-checkbox">
                                  <input
                                    id={`reqchange-${n.id}`}
                                    name="reqchange"
                                    type="checkbox"
                                    className="custom-control-input"
                                    onClick={e =>
                                      this.toggleRequestChangeModal(e, n.id)
                                    }
                                  />

                                  <label
                                    className="custom-control-label"
                                    htmlFor={`reqchange-${n.id}`}
                                  ></label>
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="custom-control custom-checkbox">
                                  <input
                                    id={`activeFlag-${n.id}`}
                                    name="activeFlag"
                                    type="checkbox"
                                    className="custom-control-input"
                                    checked={n["activeFlag"]}
                                    onChange={e => this.handleCheckbox(e, n.id)}
                                  />

                                  <label
                                    className="custom-control-label"
                                    htmlFor={`activeFlag-${n.id}`}
                                  ></label>
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="custom-control custom-checkbox">
                                  <input
                                    id={`expiredFlag-${n.id}`}
                                    name="expiredFlag"
                                    type="checkbox"
                                    className="custom-control-input"
                                    checked={n["expiredFlag"]}
                                    onChange={e => this.handleCheckbox(e, n.id)}
                                  />

                                  <label
                                    className="custom-control-label"
                                    htmlFor={`expiredFlag-${n.id}`}
                                  ></label>
                                </div>
                              </td>
                            </React.Fragment>
                          ) : null}
                          {rowFields.map((field, i) => {
                            switch (field.name) {
                              case "startDateTime":
                                return (
                                  <td key={i}>{n["startDateTimeToDisplay"]}</td>
                                );
                              case "endDateTime":
                                return (
                                  <td key={i}>{n["endDateTimeToDisplay"]}</td>
                                );
                              case "crawlerTime":
                                return (
                                  <td key={i}>{n["crawlerTimeToDisplay"]}</td>
                                );
                              case "documentID":
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
                              default:
                                return <td key={i}>{n[field.name]}</td>;
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

        <Modal
          isOpen={this.state.addModalIsOpen}
          toggle={this.toggleCreateModal}
          className="modal-xl add-event-modal"
          backdrop="static"
        >
          <ModalHeader toggle={this.toggleCreateModal} tag="h3">
            Create Event
          </ModalHeader>
          <ModalBody className="px-4">
            <AddEvent
              onClose={this.toggleCreateModal}
              onEventSubmit={this.onEventSubmit}
            />
          </ModalBody>
        </Modal>

        <Modal
          isOpen={this.state.editModalIsOpen}
          toggle={this.toggleEditModal}
          className="modal-xl edit-event-modal"
          backdrop="static"
        >
          <ModalHeader toggle={this.toggleEditModal} tag="h3">
            Edit Event
          </ModalHeader>
          <ModalBody className="px-4">
            <AddEvent
              onClose={this.toggleEditModal}
              editingId={this.state.editingId}
              onEventSubmit={this.onEventSubmit}
            />
          </ModalBody>
        </Modal>

        <Modal
          isOpen={this.state.addCampModalIsOpen}
          toggle={this.toggleCreateCampModal}
          className="modal-xl add-event-modal"
          backdrop="static"
        >
          <ModalHeader toggle={this.toggleCreateCampModal} tag="h3">
            Create Camp
          </ModalHeader>
          <ModalBody className="px-4">
            <AddCamp
              onClose={this.toggleCreateCampModal}
              onEventSubmit={this.onEventSubmit}
            />
          </ModalBody>
        </Modal>

        <Modal
          isOpen={this.state.editModalCampIsOpen}
          toggle={this.toggleEditModalCamp}
          className="modal-xl edit-camp-modal"
          backdrop="static"
        >
          <ModalHeader toggle={this.toggleEditModalCamp} tag="h3">
            Edit Camp
          </ModalHeader>
          <ModalBody className="px-4">
            <AddCamp
              onClose={this.toggleEditModalCamp}
              editingId={this.state.editingId}
              onEventSubmit={this.onEventSubmit}
            />
          </ModalBody>
        </Modal>

        <Modal
          isOpen={this.state.confirmModalIsOpen}
          toggle={this.toggleConfirmModal}
        >
          <ModalHeader toggle={this.toggleConfirmModal}></ModalHeader>
          <ModalBody>
            {this.state.confirmModalMsg ? (
              this.state.confirmModalMsg
            ) : (
                <React.Fragment>
                  <h3>New event has been sent to us.</h3>
                  <p>
                    They will review to make sure it conform our community
                    policies, information accurate and complete. you will receive
                    an email once event is approved.
                </p>
                </React.Fragment>
              )}
            <button
              className="btn btn-primary float-right"
              onClick={this.toggleConfirmModal}
            >
              Confirm
            </button>
          </ModalBody>
        </Modal>

        <Modal
          isOpen={this.state.requestChangeModalIsOpen}
          toggle={this.toggleRequestChangeModal}
        >
          <ModalHeader toggle={this.toggleRequestChangeModal}>
            Request change:{" "}
            {this.state.requestChangeId
              ? data[this.state.requestChangeId].name
              : null}
          </ModalHeader>
          <ModalBody>
            {!this.state.requestChangeConfirm &&
              !this.state.requestChangeError && (
                <React.Fragment>
                  <div className="form-group">
                    <label htmlFor="requestChangeMessage">Message:</label>
                    <textarea
                      name="requestChangeMessage"
                      className="form-control"
                      rows="5"
                      value={requestChangeMessage}
                      onChange={this.handleInputChange}
                    ></textarea>
                  </div>
                  <button
                    className="btn btn-primary float-right"
                    onClick={this.sendRequestChange}
                  >
                    Send
                  </button>
                </React.Fragment>
              )}
            {this.state.requestChangeConfirm && (
              <React.Fragment>
                <div className="alert alert-info mb-3">
                  {this.state.requestChangeConfirm}
                </div>
                <button
                  className="btn btn-primary float-right"
                  onClick={this.toggleRequestChangeModal}
                >
                  Ok
                </button>
              </React.Fragment>
            )}
            {this.state.requestChangeError && (
              <React.Fragment>
                <div className="alert alert-danger mb-3">
                  {this.state.requestChangeError}
                </div>
                <button
                  className="btn btn-light float-right"
                  onClick={this.toggleRequestChangeModal}
                >
                  Close
                </button>
              </React.Fragment>
            )}
          </ModalBody>
        </Modal>

        {/* Event logs */}

        <Modal
          isOpen={this.state.updateEventLogModalIsOpen}
          toggle={this.toggleUpdateEventLogModal}
        >
          <ModalHeader toggle={this.toggleUpdateEventLogModal}></ModalHeader>
          <ModalBody>
            <UpdateEventLog
              eventId={updateEventLogId}
              userNames={this.state.userNames}
            />
            <button
              className="btn btn-light float-right"
              onClick={this.toggleUpdateEventLogModal}
            >
              Close
            </button>
          </ModalBody>
        </Modal>

        {/* Issues log modal */}

        <Modal
          isOpen={this.state.issueEventLogModalIsOpen}
          toggle={this.toggleIssueEventLogModal}
        >
          <ModalHeader toggle={this.toggleIssueEventLogModal}></ModalHeader>
          <ModalBody>
            <IssueEventLog
              eventId={issueEventLogId}
              event={data[issueEventLogId]}
              onChange={this.handleEventIssuesChanges}
            />
            <button
              className="btn btn-light float-right"
              onClick={this.toggleIssueEventLogModal}
            >
              Close
            </button>
          </ModalBody>
        </Modal>
      </React.Fragment>
    );
  }
}

UpcomingEventsTable.contextType = AuthContext;
export default withStyles(styles)(UpcomingEventsTable);

let rowFields = [
  { name: "frequency", label: "Frequency", sortable: true },
  {
    name: "createEventInfo.createEventTime",
    label: "Created",
    sortable: true,
    sortableOnFilter: true
  },
  { name: "crawlerTime", label: "Crawled", sortable: true },
  { name: "dataSource", label: "Data Source", sortable: true },
  {
    name: "createEventInfo.createEventUserName",
    label: "User",
    sortable: true
  },
  { name: "name", label: "Name", sortable: true },
  { name: "location.city", label: "City", sortable: true },
  {
    name: "startDateTime",
    label: "Date",
    sortable: true,
    sortableOnFilter: true
  },
  { name: "endDateTime", label: "End Date", sortable: true },
  { name: "price.min", label: "Price min", sortable: true },
  { name: "price.max", label: "Price max", sortable: true },
  { name: "categories", label: "Category", sortable: true },
  { name: "tags", label: "Tags", sortable: true },
  { name: "organizer", label: "Organizer", sortable: true },
  { name: "location.venueName", label: "Location", sortable: false },
  { name: "metro", label: "Metro", sortable: true },
  { name: "startTime", label: "Start time", sortable: false },
  { name: "endTime", label: "End Time", sortable: false },
  { name: "recommendAge.min", label: "Age min", sortable: true },
  { name: "recommendAge.max", label: "Age max", sortable: true },
  { name: "documentID", label: "Document Id", sortable: true },
  { name: "email", label: "Email", sortable: true },
  { name: "phoneNumber", label: "Phone", sortable: true },
  { name: "weburl", label: "Url", sortable: true },
  { name: "operationNotes", label: "Operation Notes", sortable: true }
];
