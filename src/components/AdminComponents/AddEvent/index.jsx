import React, { Component } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import InputMask from "react-input-mask";
import { UncontrolledTooltip, Modal, ModalFooter, ModalBody } from "reactstrap";
import "../Search/node_modules/react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import "moment-timezone";

import ImageUpload from "../ImageUpload";
import LocationSearchInput from "../LocationSearchInput";
import CharCount from "../common/CharCount";

import SingleDateFields from "./SingleDateFields";
import WeeklyFields from "./WeeklyFields";
import MonthlyFields from "./MonthlyFields";
import DailyFields from "./DailyFields";

import firebase, { db, FB_BASE_URL } from "../../firebase";
import { AuthContext } from "../../auth-context";

import "./style.scss";

const freqOptions = [
  { value: "once", label: "Occurs once" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" }
];

const roundMinutes = date => {
  date.setHours(date.getHours() + Math.ceil(date.getMinutes() / 60));
  date.setMinutes(0);

  return date;
};

const toTitleCase = s => {
  return s.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

const ageOptions = [...Array(19).keys()].map(x => ({ value: x, label: x }));
const TIME_FORMAT = "h:mm a";
const URL_RE = /[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

const prepareUTC = utc => utc.replace('UTC', '');

class AddEvent extends Component {
  state = {
    event: {
      image: {
        downloadURL: "",
        storageLocation: "",
        storagePath: ""
      },
      name: "",
      organizer: "",
      location: {
        GPSCoordinates: null,
        address: "",
        city: "",
        state: "",
        venueName: "",
        zip: ""
      },
      about: "",
      note: "",
      tags: ["#community", "#event"],
      frequency: "once",
      startDateTime: new Date(roundMinutes(new Date()).setHours(10)),
      endDateTime: new Date(roundMinutes(new Date()).setHours(13)),
      recommendAge: {
        min: null,
        max: null
      },
      price: {
        min: 0,
        max: 0
      },
      phoneNumber: "",
      email: "",
      weburl: "",
      // meta fields
      approvedFlag: false,
      editorsChoice: false,
      activeFlag: false,
      dataSource: "Community",
      metaData: {
        approvedByUser: null,
        uploadByUser: firebase.auth().currentUser
          ? firebase.auth().currentUser.uid
          : null,
        uploadDate: firebase.firestore.FieldValue.serverTimestamp()
      },
      createEventInfo: {
        createEventTime: firebase.firestore.FieldValue.serverTimestamp(),
        createEventUserName: null,
        createEventUserUID: firebase.auth().currentUser
          ? firebase.auth().currentUser.uid
          : null
      },
      numOfOutstandingIssues: 0,
      operationNotes: "",
      closeOnWeekdays: [],
      metro: "",
      expiredFlag: false,
    },

    address: "", // separate field to keep venueName or postal address if place is not venue
    msg: "",
    errors: {},
    isSubmitting: false,
    confirmModalIsOpen: false,
    tagsLookUp: [],
    isLoadingTags: true,
    changeLog: {},
    dataSourcesLookUp: [],
    isLoadingDataSources: true,
    organizersLookUp: [],
    isLoadingOrganizers: true,
    isLoadingMetro: true,
    metroLookUp: [],
    metroLookUpUTC: {},
    citiesLookUp: [],
    editingId: this.props.editingId
  };

  componentDidMount() {


    const { editingId } = this.props;
    if (editingId) {
      db.collection("events")
        .doc(editingId)
        .get()
        .then(doc => {
          if (doc.exists) {
            // console.log("Document data:", doc.data());
            const data = doc.data();

            // console.log(data.startDateTime.toDate());

            const startDateTime = data.startDateTime.toDate();
            const endDateTime = data.endDateTime.toDate();

            data.startDateTime = startDateTime;
            data.endDateTime = endDateTime;

            this.startTimeInput.value = moment(data.startDateTime).format(
              TIME_FORMAT
            );
            this.endTimeInput.value = moment(data.endDateTime).format(
              TIME_FORMAT
            );
            const address = data.location.venueName
              ? data.location.venueName
              : data.location.address;

            const { event } = this.state;

            this.setState({ event: Object.assign({}, event, data), address });
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        })
        .catch(function(error) {
          console.error("Error getting document:", error);
        });
    } else {
      const dataSource = localStorage.getItem("selectedDataSource") || "";
      const metro = localStorage.getItem("selectedMetro") || "";
      if (dataSource || metro) {
        const { event } = this.state;
        this.setState({
          event: {
            ...event,
            dataSource,
            metro
          }
        });
      }
    }

      this.loadTags();
      this.loadDataSources();
      this.loadMetro();

      this.loadOrganizers();
      this.loadCities();
  }

  loadCities = () => {
    db.collection("citiesLookUp")
      .get()
      .then(querySnapshot => {
        let citiesLookUp = [];

        querySnapshot.forEach(doc => {
          const c = doc.data();
          citiesLookUp = [...citiesLookUp, c.city];
        });

        this.setState({ citiesLookUp });
      });
  };

  loadTags = () => {
    db.collection("tagsLookUp")
      .orderBy("name")
      .get()
      .then(querySnapshot => {
        let tagsLookUp = [];
        querySnapshot.forEach(doc => {
          const tag = doc.data();
          tagsLookUp = [...tagsLookUp, { value: tag.name, label: tag.name }];
        });

        this.setState({ tagsLookUp });
      })
      .finally(() => {
        this.setState({ isLoadingTags: false });
      });
  };

  loadDataSources = () => {
    db.collection("dataSourcesLookUp")
      .orderBy("name")
      .get()
      .then(querySnapshot => {
        let dataSourcesLookUp = [];
        querySnapshot.forEach(doc => {
          const ds = doc.data();
          dataSourcesLookUp = [...dataSourcesLookUp, ds.name];
        });

        this.setState({ dataSourcesLookUp });
      })
      .finally(() => {
        this.setState({ isLoadingDataSources: false });
      });
  };

  loadOrganizers = () => {
    db.collection("organizersLookUp")
      .orderBy("name")
      .get()
      .then(querySnapshot => {
        let organizersLookUp = [];
        querySnapshot.forEach(doc => {
          const org = doc.data();
          organizersLookUp = [...organizersLookUp, org.name];
        });

        this.setState({ organizersLookUp });
      })
      .finally(() => {
        this.setState({ isLoadingOrganizers: false });
      });
  };

  loadMetro = () => {
    db.collection("metroLookUp")
      .orderBy("name")
      .get()
      .then(querySnapshot => {
        let metroLookUpUTC = {};
        let metroLookUp = [];
        querySnapshot.forEach(doc => {
          const metro = doc.data();
          metroLookUp = [...metroLookUp, metro.name];

          metroLookUpUTC = {...metroLookUpUTC, [metro.name]: metro.timezone};
        });

        this.setState({ metroLookUp, metroLookUpUTC });
      })
      .finally(() => {
        this.setState({ isLoadingMetro: false });
      });
  };

  getMetroUTC = name => prepareUTC(this.state.metroLookUpUTC[name]);

  createRefFn = name => el => (this[name] = el);

  handleInputChange = e => {
    const { event } = this.state;
    const { name, value } = e.target;
    this.setState({ event: { ...event, [name]: value } });
    this.logChange([{ field: name, oldVal: event[name], newVal: value }]);
  };

  handlePriceChange = e => {
    const { event } = this.state;
    const { name, value } = e.target;
    const keysArr = name.split(".");
    this.setState({
      event: { ...event, price: { ...event.price, [keysArr[1]]: value } }
    });
    this.logChange([
      { field: name, oldVal: event["price"][keysArr[1]], newVal: value }
    ]);
  };

  handleTagChange = selectedOptions => {
    const { event } = this.state;
    this.setState({
      event: { ...event, tags: selectedOptions.map(opt => opt.value) }
    });
    this.logChange([
      {
        field: "tags",
        oldVal: event["tags"],
        newVal: selectedOptions.map(opt => opt.value)
      }
    ]);
  };

  handleTagCreate = newTagName => {
    this.setState({ isLoadingTags: true });
    const name = "#" + newTagName.toLowerCase().replace(/\W/g, "");
    const tags = this.state.tagsLookUp.map(t => t.name);
    const eventsCount = 1; //trigger in DB deletes tagName with eventCount === 0 or if it does not exist at all

    if (tags.indexOf(name) === -1) {
      db.collection("tagsLookUp")
        .add({ name,  eventsCount })
        .then(() => {
          console.log("Created new tag", name);
          this.setState({
            isLoadingTags: false
          });
          this.handleTagChange({ value: name });
        })
        .catch(function(error) {
          console.error("Error getting document:", error);
        });
    } else {
      this.setState({
        isLoadingTags: false
      });
      this.handleTagChange({ value: name });
    }
  };

  // function creates new record at `citiesLookUp` table
  // if such city is not already there
  handleNewRecordInCityLookUp = (event, cities) => {
    const { location, metro } = event;
    const { city, state } = location;

    if (!city || !state || cities.includes(city)) {
      return;
    }

    const newCity = {
      city: city,
      metro: metro || "",
      state: state,
      eventsCount: 0
    };

    db.collection("citiesLookUp")
      .add(newCity)
      .then(() => {})
      .catch(error => {
        console.error(`Error reading document: ${error}`);
      });
  };

  handleDocumentIdCopyClick = (id) => {
    navigator.clipboard.writeText(id);
  };

  handleDeleteTag = i => {
    const { event } = this.state;
    this.setState({
      event: { ...event, tags: event.tags.filter((tag, index) => index !== i) }
    });
    this.logChange([
      {
        field: "tags",
        oldVal: event["tags"],
        newVal: event.tags.filter((tag, index) => index !== i)
      }
    ]);
  };

  handleDataSourceChange = selectedOption => {
    const { event } = this.state;
    localStorage.setItem("selectedDataSource", selectedOption.value);
    this.setState({ event: { ...event, dataSource: selectedOption.value } });
    this.logChange([
      {
        field: "dataSource",
        oldVal: event["dataSource"],
        newVal: selectedOption.value
      }
    ]);
  };

  handleDataSourceCreate = newDataSourceName => {
    const { dataSourcesLookUp } = this.state;
    this.setState({ isLoadingDataSources: true });
    const name = newDataSourceName
      .toLowerCase()
      .replace(/^./, newDataSourceName[0].toUpperCase());
    if (dataSourcesLookUp.indexOf(name) === -1) {
      db.collection("dataSourcesLookUp")
        .add({ name })
        .then(() => {
          this.setState({
            isLoadingDataSources: false
          });
          this.handleDataSourceChange({ value: name });
        })
        .catch(function(error) {
          console.error("Error getting document:", error);
        });
    } else {
      this.setState({
        isLoadingDataSources: false
      });
      this.handleDataSourceChange({ value: name });
    }
  };

  handleMetroChange = selectedOption => {
    const { event } = this.state;
    const value = selectedOption ? selectedOption.value : "";
    localStorage.setItem("selectedMetro", value);
    this.setState({ event: { ...event, metro: value } });
    this.logChange([{ field: "metro", oldVal: event["metro"], newVal: value }]);
  };

  handleMetroCreate = newName => {
    const { metroLookUp } = this.state;
    this.setState({ isLoadingMetro: true });
    const name = newName;
    if (metroLookUp.indexOf(name) === -1) {
      db.collection("metroLookUp")
        .add({ name })
        .then(() => {
          this.setState({
            isLoadingMetro: false
          });
          this.handleMetroChange({ value: name });
        })
        .catch(function(error) {
          console.error("Error getting document:", error);
        });
    } else {
      this.setState({
        isLoadingMetro: false
      });
      this.handleMetroChange({ value: name });
    }
  };

  handleOrganizerChange = selectedOption => {
    const { event } = this.state;
    this.setState({ event: { ...event, organizer: selectedOption.value } });
    this.logChange([
      {
        field: "organizer",
        oldVal: event["organizer"],
        newVal: selectedOption.value
      }
    ]);
  };

  handleOrganizerCreate = newName => {
    const { organizersLookUp } = this.state;
    this.setState({ isLoadingOrganizers: true });
    const name = newName;
    if (organizersLookUp.indexOf(newName) === -1) {
      db.collection("organizersLookUp")
        .add({ name })
        .then(() => {
          this.setState({
            isLoadingOrganizers: false
          });
          this.handleOrganizerChange({ value: name });
        })
        .catch(function(error) {
          console.error("Error getting document:", error);
        });
    } else {
      this.setState({
        isLoadingOrganizers: false
      });
      this.handleOrganizerChange({ value: name });
    }
  };

  handleFreqChange = ({ value }) => {
    const { event } = this.state;
    // set end date if freq changes
    let endDateTime = event.endDateTime;
    const startDateTime = event.startDateTime;
    const tagsNewList = event.tags.filter(tag => (tag !== "#event" && tag !== "#place"))
    const tagNew = value !== 'daily' ? "#event" : "#place"
    switch (value) {
      case "once":
        endDateTime = moment(startDateTime)
          .set({
            hour: moment(endDateTime).hour(),
            minute: moment(endDateTime).minute()
          })
          .toDate();
        break;
      case "daily":
        endDateTime = moment("1/1/2025", "MM/DD/YYYY")
          .set({
            hour: moment(endDateTime).hour(),
            minute: moment(endDateTime).minute()
          })
          .toDate();
        break;
      case "weekly":
        endDateTime = moment("1/1/2025", "MM/DD/YYYY")
          .set({
            hour: moment(endDateTime).hour(),
            minute: moment(endDateTime).minute()
          })
          .toDate();
        break;
      case "monthly":
        endDateTime = moment("1/1/2025", "MM/DD/YYYY")
          .set({
            hour: moment(endDateTime).hour(),
            minute: moment(endDateTime).minute()
          })
          .toDate();
        break;
      default:
        break;
    }
    this.setState({
      event: {
        ...event,
        frequency: value,
        endDateTime,
        tags: [...tagsNewList, tagNew],
    }})
    this.logChange([
      { field: "frequency", oldVal: event["frequency"], newVal: value }
    ]);
  };

  handleDateChange = (date, name) => {
    const { event } = this.state;

    let newDates = {};

    if (name === "start") {
      let startDateTime = event.startDateTime;
      date = moment(date)
        .set({
          hour: moment(startDateTime).hour(),
          minute: moment(startDateTime).minute()
        })
        .toDate();

        console.log(date);
        newDates = {
        [`${name}DateTime`]: date
        // endDateTime: endDateTime
      };
    } else {
      //persist time in case of keyboard editing
      let endDateTime = event.endDateTime;
      date = moment(date)
        .set({
          hour: moment(endDateTime).hour(),
          minute: moment(endDateTime).minute()
        })
        .toDate();
      newDates = {
        [`${name}DateTime`]: date
      };
    }
    this.setState({ event: { ...event, ...newDates } });

    const changes = [];
    Object.keys(newDates).forEach(key =>
      changes.push({ field: key, oldVal: event[key], newVal: newDates[key] })
    );
    this.logChange(changes);
  };

  handleTimeBlur = e => {
    const { name, value } = e.target;
    const { event } = this.state;
    let eventDate = event[`${name}DateTime`];
    const time = moment(value, TIME_FORMAT);

    // console.log(time)
    eventDate = moment(eventDate).set({
      hour: time.get("hour"),
      minute: time.get("minute")
    });

    this.setState({
      event: { ...event, [`${name}DateTime`]: eventDate.toDate() }
    });

    this.logChange([
      {
        field: `${name}DateTime`,
        oldVal: event[`${name}DateTime`],
        newVal: eventDate.toDate()
      }
    ]);
  };

  toggleTimeAmPm = name => {
    const { event } = this.state;
    let eventDate = event[`${name}DateTime`];
    const time = moment(eventDate, TIME_FORMAT);
    let offsetHours = 12;
    if (
      time
        .format(TIME_FORMAT)
        .toLowerCase()
        .indexOf("pm") > -1
    ) {
      offsetHours = -12;
    }

    eventDate = moment(eventDate).set({
      hour: time.get("hour") + offsetHours,
      minute: time.get("minute")
    });
    this[`${name}TimeInput`].value = moment(eventDate).format(TIME_FORMAT);
    this.setState({
      event: { ...event, [`${name}DateTime`]: eventDate.toDate() }
    });

    this.logChange([
      {
        field: `${name}DateTime`,
        oldVal: event[`${name}DateTime`],
        newVal: eventDate.toDate()
      }
    ]);
  };

  handleAgeChange = (opt, name) => {
    const { event } = this.state;
    this.setState({
      event: {
        ...event,
        recommendAge: { ...event.recommendAge, [name]: opt.value }
      }
    });
    this.logChange([
      {
        field: `recommendAge.${name}`,
        oldVal: event["recommendAge"][name],
        newVal: opt.value
      }
    ]);
  };

  onImageChange = (downloadURL, size) => {
    const { event } = this.state;
    const downloadURLKey =
      size === "Thumb" ? "downloadURLSmall" : "downloadURL";
    const storagePathKey =
      size === "Thumb" ? "storagePathSmall" : "storagePath";
    const storagePath = downloadURL
      ? decodeURIComponent(downloadURL)
          .replace(FB_BASE_URL, "")
          .split("?")[0]
      : "";

    const newImageURLs = {
      [downloadURLKey]: downloadURL,
      [storagePathKey]: storagePath
    };
    this.setState({
      event: {
        ...event,
        image: {
          ...event.image,
          ...newImageURLs
        }
      }
    });

    const changes = [];
    Object.keys(newImageURLs).forEach(key =>
      changes.push({
        field: `image.${key}`,
        oldVal: event["image"][key],
        newVal: newImageURLs[key]
      })
    );
    this.logChange(changes);
  };

  handleAddressChange = address => {
    this.setState({ address });
  };

  // decode address_components from Google Places autocomplete api
  onAddressSelect = (venueName, results) => {
    const { address_components } = results;

    let components = {};
    address_components.forEach(component => {
      components[component.types[0]] = component.long_name;
      if (component.types[0] === "administrative_area_level_1")
        components[component.types[0]] = component.short_name;
    });

    // console.log("address_components", components);
    const address = `${address_components[0]["long_name"]} ${
      address_components[1]["long_name"]
    }`;
    const location = {
      venueName,
      address,
      city:
        components["locality"] ||
        components["political"] ||
        components["neighborhood"] ||
        components["administrative_area_level_2"] ||
        "",
      state: components["administrative_area_level_1"] || "",
      zip: components["postal_code"] || ""
    };
    const { event } = this.state;
    this.setState({
      event: {
        ...event,
        location: {
          ...event.location,
          ...location
        }
      },
      address: venueName ? venueName : address
    });

    const changes = [];
    Object.keys(location).forEach(key =>
      changes.push({
        field: `location.${key}`,
        oldVal: event["location"][key],
        newVal: location[key]
      })
    );
    this.logChange(changes);
  };

  onLatLngChange = (lat, lng) => {
    const { event } = this.state;
    this.setState({
      event: {
        ...event,
        location: {
          ...event.location,
          GPSCoordinates: new firebase.firestore.GeoPoint(lat, lng)
        }
      }
    });
    this.logChange([
      {
        field: "location.GPSCoordinates",
        oldVal: event["location"]["GPSCoordinates"],
        newVal: new firebase.firestore.GeoPoint(lat, lng)
      }
    ]);
  };

  handleNameInputBlur = e => {
    const { value } = e.target;
    const nameToTitleCase = toTitleCase(value);

    if (value !== nameToTitleCase) {
      this.setState({ confirmModalIsOpen: true });
    }
  };

  convertNameToTitleCase = () => {
    const { event } = this.state;
    this.setState({
      event: {
        ...event,
        name: toTitleCase(event.name)
      },
      confirmModalIsOpen: false
    });

    this.logChange([
      { field: "name", oldVal: event["name"], newVal: toTitleCase(event.name) }
    ]);
  };

  toggleConfirmModal = () => {
    this.setState({ confirmModalIsOpen: !this.state.confirmModalIsOpen });
  };

  validate = values => {
    let errors = {};
    if (!values.name) {
      errors.name = "Required";
    } else if (values.name.length > 60) {
      errors.name = "Exeeds maximum character count";
    }
    if (!values.organizer) {
      errors.organizer = "Required";
    } else if (values.organizer.length > 50) {
      errors.organizer = "Exeeds maximum character count";
    }
    if (!values.location.venueName && !values.location.address) {
      errors.location = "Required";
    }
    if (!values.about) {
      errors.about = "Required";
    } else if (values.about.length > 750) {
      errors.about = "Exeeds maximum character count";
    }
    if (values.note && values.note.length > 500) {
      errors.note = "Exeeds maximum character count";
    }

    if (!values.tags.length) {
      errors.tags = "At least 1 tag required";
    }

    if (
      values.email &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
    ) {
      errors.email = "Invalid email address";
    }

    if (Date.parse(values.startDateTime) > Date.parse(values.endDateTime)) {
      errors.dates = "Start time should be before end time";
    }

    if (
      !(values.price.min || values.price.min === 0) ||
      !(values.price.max || values.price.max === 0)
    ) {
      errors.price = "Min and max price required";
    } else if (parseFloat(values.price.min) > parseFloat(values.price.max)) {
      errors.price = "Max price should be greater than min";
    }

    if (
      values.recommendAge.min &&
      values.recommendAge.max &&
      values.recommendAge.min > values.recommendAge.max
    ) {
      errors.age = "Max age should be greater than min";
    }

    if (
      values.phoneNumber &&
      !(values.phoneNumber.match(/\d/g).length === 10)
    ) {
      errors.phoneNumber = "Invalid phone number";
    }

    if (!values.weburl) {
      errors.url = "Required";
    } else if (values.weburl && !URL_RE.test(values.weburl)) {
      errors.url = "invalid URL";
    }
    return errors;
  };

  handleSubmit = () => {
    let { event, citiesLookUp, changeLog } = this.state;
    const { editingId } = this.props;
    const user = this.context;
    const newEventLogEntries = [];

    const errors = this.validate(event);
    if (!Object.keys(errors).length) {
      this.setState({ isSubmitting: true });
      if (
        (!event.price.max || parseFloat(event.price.max) === 0) &&
        event.tags.indexOf("#free") === -1
      ) {
        event = {
          ...event,
          tags: [...event.tags, "#free"]
        };
      }

      if (!editingId) {
        event = {
          ...event,
          numOfSaves: 0,
          createEventInfo: {
            createEventTime: firebase.firestore.FieldValue.serverTimestamp(),
            createEventUserName:
              user.userName ||
              (firebase.auth().currentUser &&
                firebase.auth().currentUser.displayName) ||
              null,
            createEventUserUID:
              user.uid ||
              (firebase.auth().currentUser &&
                firebase.auth().currentUser.uid) ||
              null
          }
        };
      }

      if (editingId) {
        Object.keys(changeLog).forEach(key =>
          newEventLogEntries.push({
            userAction: `set "${key}" from "${changeLog[key]["oldVal"]}" to "${
              changeLog[key]["newVal"]
            }"`,
            userActionTimestamp: changeLog[key]["userActionTimestamp"],
            userUID: user.uid
          })
        );
      }


      const metroUTC = +this.getMetroUTC(event.metro);

        event = {
        ...event,
        startDateTime: moment(event.startDateTime)
          .utcOffset(metroUTC, true)
          .toDate(),
        endDateTime: moment(event.endDateTime)
          .utcOffset(metroUTC, true)
          .toDate(),
        weburl: event.weburl.trim()
      };

      // update citiesLookUp table with new city
      this.handleNewRecordInCityLookUp(event, citiesLookUp);

      const docRef = editingId
        ? db.collection("events").doc(editingId)
        : db.collection("events").doc();

      docRef
        .set(event)
        .then(() => {
          this.setState({ isSubmitting: false });
          console.log("Document written with ID: ", docRef.id);

          // update event log only when edit event
          if (editingId) {
            const batch = db.batch();
            newEventLogEntries.forEach(doc => {
              batch.set(
                db
                  .collection("events")
                  .doc(editingId)
                  .collection("updateEventLog")
                  .doc(),
                doc
              );
            });
            batch.commit().then(() => {
              // console.log(`Document ${editingId} log updated successfully.`);
            });
          }

          this.props.onClose();

          return db
            .collection("events")
            .doc(docRef.id)
            .get();
        })
        .then(doc => {
          const showConfirmModal = !editingId;
          this.props.onEventSubmit(docRef.id, doc.data(), showConfirmModal);
        })
        .catch(error => {
          console.error("Error adding document: ", error);
          this.setState({
            msg: "Error adding document: ",
            error,
            isSubmitting: false
          });
        });
    }

    this.setState({ errors });
  };

  logChange = changes => {
    let { changeLog } = this.state;
    changes.forEach(change => {
      const { field, oldVal, newVal } = change;
      changeLog = {
        ...changeLog,
        [field]: {
          oldVal: (changeLog[field] && changeLog[field]["oldVal"]) || oldVal,
          newVal,
          userActionTimestamp: new Date()
        }
      };
    });
    this.setState({
      changeLog
    });
  };

  openURL = () => {
    const { event } = this.state;
    const url =
      event.weburl.indexOf("http") === 0
        ? event.weburl
        : "http://" + event.weburl;
    window.open(url);
  };

  handleCheckCloseOnWeekdays = dayIndex => {
    const { event } = this.state;
    let { closeOnWeekdays } = event;
    if (closeOnWeekdays.indexOf(dayIndex) > -1) {
      closeOnWeekdays = closeOnWeekdays.filter(i => i !== dayIndex);
    } else {
      closeOnWeekdays = [...closeOnWeekdays, dayIndex].sort((a, b) => a - b);
    }

    this.setState({
      event: {
        ...event,
        closeOnWeekdays
      }
    });
  };

  getDynamicNumberOfRows(text) {
    let countOfEnter = 0;

    if (text.indexOf('\n') !== -1){
      countOfEnter = text.match(/\n/g).length;
    }
    return Math.round(( text.length / 100 ) + 1 + countOfEnter);
  }

  render() {
    const {
      event,
      msg,
      errors,
      isSubmitting,
      tagsLookUp,
      isLoadingTags,
      dataSourcesLookUp,
      organizersLookUp,
      isLoadingOrganizers,
      isLoadingMetro,
      metroLookUp,
      editingId
    } = this.state;
    const {
      image,
      name,
      organizer,
      // location,
      about,
      note,
      tags,
      frequency,
      startDateTime,
      endDateTime,
      recommendAge,
      price,
      phoneNumber,
      email,
      weburl,
      dataSource,
      operationNotes,
      closeOnWeekdays,
      metro
    } = event;

    const user = this.context;

    let DateFieldsComponent;
    switch (frequency) {
      case "once":
        DateFieldsComponent = SingleDateFields;
        break;
      case "daily":
        DateFieldsComponent = DailyFields;
        break;
      case "weekly":
        DateFieldsComponent = WeeklyFields;
        break;
      case "monthly":
        DateFieldsComponent = MonthlyFields;
        break;
      default:
        DateFieldsComponent = SingleDateFields;
    }

    return (
      <div className="add-event">
        <div className="form-group row mt-3">
          <label
            htmlFor="uploadPhoto"
            className="col-md-2 col-form-label text-right"
          >
            Event Photo{" "}
            <i
              className="fas fa-info-circle text-black-50"
              id="eventPhotoInfo"
            ></i>
            <UncontrolledTooltip placement="right" target="eventPhotoInfo">
              Recommend picture of 16:9 ratio and less 1MB to help your events
              stand out
            </UncontrolledTooltip>
          </label>
          <div className="col-md-10 form-row">
            <ImageUpload
              url={image.downloadURL}
              onImageChange={this.onImageChange}
            />
          </div>
          <div className="col-md-10 offset-md-2">
            {errors.image && (
              <span className="small text-danger"> {errors.image}</span>
            )}
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="name" className="col-md-2 col-form-label text-right">
            Event Name*{" "}
            <i
              className="fas fa-info-circle text-black-50"
              id="eventNameInfo"
            ></i>
            <UncontrolledTooltip placement="right" target="eventNameInfo">
              Make name easy to read by using capitalization and common
              characters.
            </UncontrolledTooltip>
          </label>
          <div className="col-md-10">
            <input
              type="text"
              id="name"
              name="name"
              className="form-control with-char-counter"
              placeholder="Add short, clear name"
              value={name}
              onChange={this.handleInputChange}
              onBlur={this.handleNameInputBlur}
            />
            <CharCount value={name} max={60} />
            {errors.name && (
              <span className="small text-danger">{errors.name}</span>
            )}
          </div>
        </div>
        <div className="form-group row">
          <label
            htmlFor="organizer"
            className="col-md-2 col-form-label text-right"
          >
            Organizer*
          </label>
          <div className="col-md-10">
            {user.adminFlag ? (
              <CreatableSelect
                placeholder="Add Organizer"
                className="react-select-container"
                classNamePrefix="react-select"
                isDisabled={isLoadingOrganizers}
                isLoading={isLoadingOrganizers}
                onChange={this.handleOrganizerChange}
                onCreateOption={this.handleOrganizerCreate}
                options={organizersLookUp.map(opt => {
                  return { value: opt, label: opt };
                })}
                value={
                  organizer ? { value: organizer, label: organizer } : null
                }
                styles={{
                  indicatorSeparator: styles => ({ display: "none" }),
                  dropdownIndicator: styles => ({ display: "none" })
                }}
              />
            ) : (
              <Select
                placeholder="Add Organizer"
                className="react-select-container"
                classNamePrefix="react-select"
                value={
                  organizer ? { value: organizer, label: organizer } : null
                }
                onChange={this.handleOrganizerChange}
                options={organizersLookUp.map(opt => {
                  return { value: opt, label: opt };
                })}
                styles={{
                  indicatorSeparator: styles => ({ display: "none" }),
                  dropdownIndicator: styles => ({ display: "none" })
                }}
              />
            )}
            <CharCount value={organizer} max={50} />
            {errors.organizer && (
              <span className="small text-danger">{errors.organizer}</span>
            )}
          </div>
        </div>
        <div className="form-group row">
          <label
            htmlFor="location"
            className="col-md-2 col-form-label text-right"
          >
            Location*{" "}
            <i
              className="fas fa-info-circle text-black-50"
              id="locationInfo"
            ></i>
            <UncontrolledTooltip placement="right" target="locationInfo">
              A specific location helps parents know where to go
            </UncontrolledTooltip>
          </label>
          <div className="col-md-6">
            <LocationSearchInput
              address={this.state.address}
              handleAddressChange={this.handleAddressChange}
              onAddressSelect={this.onAddressSelect}
              onLatLngChange={this.onLatLngChange}
            />
            {errors.location && (
              <span className="small text-danger">{errors.location}</span>
            )}
          </div>
          <label htmlFor="metro" className="col-md-1 col-form-label text-right">
            Metro
          </label>
          <div className="col-md-3">
            {user.adminFlag ? (
              <CreatableSelect
                isClearable
                className="mb-2"
                placeholder="Select"
                isDisabled={isLoadingMetro}
                isLoading={isLoadingMetro}
                onChange={this.handleMetroChange}
                onCreateOption={this.handleMetroCreate}
                options={metroLookUp.map(m => {
                  return { value: m, label: m };
                })}
                value={metro ? { value: metro, label: metro } : null}
              />
            ) : (
              <Select
                isClearable
                className="mb-2"
                placeholder="Select one or more from the list"
                value={metro ? { value: metro, label: metro } : null}
                onChange={this.handleMetroChange}
                options={metroLookUp.map(m => {
                  return { value: m, label: m };
                })}
              />
            )}
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="about" className="col-md-2 col-form-label text-right">
            Description*{" "}
            <i
              className="fas fa-info-circle text-black-50"
              id="descriptionInfo"
            ></i>
            <UncontrolledTooltip placement="right" target="descriptionInfo">
              Make description easy to read by using capitalization and common
              characters
            </UncontrolledTooltip>
          </label>
          <div className="col-md-10">
            <textarea
              className="form-control"
              id="about"
              name="about"
              rows="5"
              value={about}
              onChange={this.handleInputChange}
            ></textarea>
            <CharCount value={about} max={750} bottom />
            {errors.about && (
              <span className="small text-danger">{errors.about}</span>
            )}
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="note" className="col-md-2 col-form-label text-right">
            Note{" "}
            <i className="fas fa-info-circle text-black-50" id="noteInfo"></i>
            <UncontrolledTooltip placement="right" target="noteInfo">
              Make note easy to read by using capitalization and common
              characters
            </UncontrolledTooltip>
          </label>
          <div className="col-md-10">
            <textarea
              className="form-control"
              id="note"
              name="note"
              rows={note.length > 0 ? this.getDynamicNumberOfRows(note) : 1}
              value={note}
              onChange={this.handleInputChange}
            ></textarea>
            <CharCount value={note} max={500} bottom />
            {errors.note && (
              <span className="small text-danger">{errors.note}</span>
            )}
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="tags" className="col-md-2 col-form-label text-right">
            Tags*{" "}
            <i className="fas fa-info-circle text-black-50" id="TagsInfo"></i>
            <UncontrolledTooltip placement="right" target="TagsInfo">
              Select one or more tags to help parents explore easily
            </UncontrolledTooltip>
          </label>
          <div className="col-md-10">
            {user.adminFlag ? (
              <CreatableSelect
                isMulti
                className="mb-2"
                placeholder="Select one or more from the list or create new"
                isDisabled={isLoadingTags}
                isLoading={isLoadingTags}
                onChange={this.handleTagChange}
                onCreateOption={this.handleTagCreate}
                options={tagsLookUp.filter(
                  tag => tags.indexOf(tag.value) === -1
                )}
                value={tags.map(tag => {
                  return { value: tag, label: tag };
                })}
              />
            ) : (
              <Select
                isMulti
                className="mb-2"
                placeholder="Select one or more from the list"
                value={tags.map(tag => {
                  return { value: tag, label: tag };
                })}
                onChange={this.handleTagChange}
                options={tagsLookUp.filter(
                  tag => tags.indexOf(tag.value) === -1
                )}
              />
            )}
            {/* {tags.map((tag, i) => <button key={i} className="btn border mr-2">{tag} <span onClick={e => this.handleDeleteTag(i)}>&times;</span></button>)} */}
            {errors.tags && (
              <span className="small text-danger">{errors.tags}</span>
            )}
          </div>
        </div>

        <div className="form-group row">
          <label
            htmlFor="frequency"
            className="col-md-2 col-form-label text-right"
          >
            Frequency*{" "}
            <i
              className="fas fa-info-circle text-black-50"
              id="FrequencyInfo"
            ></i>
            <UncontrolledTooltip placement="right" target="FrequencyInfo">
              Let parents know where this event repeats and how often it occurs
            </UncontrolledTooltip>
          </label>
          <div className="col-md-10">
            <Select
              value={freqOptions.filter(({ value }) => value === frequency)}
              onChange={this.handleFreqChange}
              options={freqOptions}
            />
            <DateFieldsComponent
              startDateTime={startDateTime}
              endDateTime={endDateTime}
              handleDateChange={this.handleDateChange}
              handleTimeBlur={this.handleTimeBlur}
              toggleTimeAmPm={this.toggleTimeAmPm}
              createRefFn={this.createRefFn}
              closeOnWeekdays={closeOnWeekdays}
              handleCheckCloseOnWeekdays={this.handleCheckCloseOnWeekdays}
            />
            {errors.dates && (
              <span className="small text-danger">{errors.dates}</span>
            )}
          </div>
        </div>
        <div className="form-group row mb-0">
          <label htmlFor="age" className="col-md-2 col-form-label text-right">
            Age min & max{" "}
            <i className="fas fa-info-circle text-black-50" id="AgeInfo"></i>
            <UncontrolledTooltip placement="right" target="AgeInfo">
              help parents to decide with recommended minimum and maximum age
            </UncontrolledTooltip>
          </label>
          <div className="col-md-2">
            <Select
              value={ageOptions.filter(
                ({ value }) => value === recommendAge.min
              )}
              onChange={opt => this.handleAgeChange(opt, "min")}
              options={ageOptions}
            />
          </div>
          <div className="col-md-2">
            <Select
              value={ageOptions.filter(
                ({ value }) => value === recommendAge.max
              )}
              onChange={opt => this.handleAgeChange(opt, "max")}
              options={ageOptions}
            />
          </div>

          <label htmlFor="price" className="col-md-2 col-form-label text-right">
            Price min {"&"} max*{" "}
            <i className="fas fa-info-circle text-black-50" id="PriceInfo"></i>
            <UncontrolledTooltip placement="right" target="PriceInfo">
              help parents to decide with recommended minimum and maximum price
            </UncontrolledTooltip>
          </label>
          <div className="col-md-2 price-input">
            <input
              type="text"
              id="price.min"
              className="form-control"
              name="price.min"
              placeholder="0"
              value={price.min}
              onChange={this.handlePriceChange}
            />
            <span>$</span>
          </div>
          <div className="col-md-2 price-input">
            <input
              type="text"
              id="price.max"
              className="form-control"
              name="price.max"
              placeholder="100"
              value={price.max}
              onChange={this.handlePriceChange}
            />
            <span>$</span>
          </div>
        </div>
        <div className="form-group row">
          <div className="col-md-4 offset-md-2">
            {errors.age && (
              <span className="small text-danger">{errors.age}</span>
            )}
          </div>
          <div className="col-md-4 offset-md-2">
            {errors.price && (
              <span className="small text-danger">{errors.price}</span>
            )}
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="phone" className="col-md-2 col-form-label text-right">
            Phone{" "}
            <i className="fas fa-info-circle text-black-50" id="PhoneInfo"></i>
            <UncontrolledTooltip placement="right" target="PhoneInfo">
              help parents to contact by phone if available.
            </UncontrolledTooltip>
          </label>
          <div className="col-md-4">
            <InputMask
              type="tel"
              mask="999-999-9999"
              maskChar="_"
              id="phoneNumber"
              name="phoneNumber"
              className="form-control"
              value={phoneNumber}
              onChange={this.handleInputChange}
            />
            {errors.phoneNumber && (
              <span className="small text-danger">{errors.phoneNumber}</span>
            )}
          </div>
          <label htmlFor="email" className="col-md-2 col-form-label text-right">
            Email{" "}
            <i className="fas fa-info-circle text-black-50" id="EmailInfo"></i>
            <UncontrolledTooltip placement="right" target="EmailInfo">
              help parents to contact by email if available.
            </UncontrolledTooltip>
          </label>
          <div className="col-md-4">
            <input
              type="text"
              id="email"
              name="email"
              className="form-control"
              value={email}
              onChange={this.handleInputChange}
            />
            {errors.email && (
              <span className="small text-danger">{errors.email}</span>
            )}
          </div>
        </div>
        <div className="form-group row">
          <label
            htmlFor="weburl"
            className="col-md-2 col-form-label text-right"
          >
            Website*
          </label>
          <div className="col-md-4 ">
            <div className="input-group">
              <input
                type="text"
                id="weburl"
                name="weburl"
                className="form-control"
                value={weburl}
                onChange={this.handleInputChange}
              />
              <div className="input-group-append">
                <button
                  disabled={!URL_RE.test(weburl)}
                  className={`input-group-text`}
                  onClick={this.openURL}
                >
                  <i className="fas fa-external-link-alt"></i>
                </button>
              </div>
            </div>
            {errors.url && (
              <span className="small text-danger d-block">{errors.url}</span>
            )}
          </div>
          <label
            htmlFor="datasource"
            className="col-md-2 col-form-label text-right"
          >
            Data Source*
          </label>
          <div className="col-md-4">
            {user.adminFlag ? (
              <CreatableSelect
                placeholder="Select from the list or create new"
                onChange={this.handleDataSourceChange}
                onCreateOption={this.handleDataSourceCreate}
                options={dataSourcesLookUp.map(opt => {
                  return { value: opt, label: opt };
                })}
                value={
                  dataSource ? { value: dataSource, label: dataSource } : null
                }
              />
            ) : (
              <Select
                placeholder="Select one from the list"
                value={
                  dataSource ? { value: dataSource, label: dataSource } : null
                }
                onChange={this.handleDataSourceChange}
                options={dataSourcesLookUp.map(opt => {
                  return { value: opt, label: opt };
                })}
              />
            )}
          </div>
        </div>
        <div className="form-group row"></div>
        {user.adminFlag && (
          <div className="form-group row">
            <label
              htmlFor="operationNotes"
              className="col-md-2 col-form-label text-right"
            >
              Operation Notes
            </label>
            <div className="col-md-10">
              <textarea
                className="form-control"
                id="operationNotes"
                name="operationNotes"
                rows={operationNotes.length > 0 ? this.getDynamicNumberOfRows(operationNotes) : 1}
                value={operationNotes}
                onChange={this.handleInputChange}
              ></textarea>
            </div>
          </div>
        )}

        <div className="form-group row"></div>
        {user.adminFlag && (
          <div className="form-group row">
            <label
              htmlFor="operationNotes"
              className="col-md-2 col-form-label text-right"
            >
              Document Id
            </label>
            <div className="col-md-10 doc-id" >
              <span
                    className="clone-btn"
                    onClick={() => this.handleDocumentIdCopyClick(editingId)}
                    data-toggle="tooltip"
                    data-placement="bottom"
                    title="Copy ID"
              ></span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

              <span>{editingId}</span>
            </div>
          </div>
        )}
        <div className="row">
          {msg && <div className="alert alert-danger mx-4">{msg}</div>}
        </div>
        <div className="form-group row">
          <div className="col-md-12 text-right">
            <button className="btn btn-light" onClick={this.props.onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary ml-3 btn-with-spinner"
              disabled={isSubmitting}
              onClick={this.handleSubmit}
            >
              {isSubmitting ? (
                <div className="spinner-border spinner-border-sm text-light"></div>
              ) : null}
              {this.props.editingId ? "Save" : "Create"}
            </button>
          </div>
        </div>

        <Modal
          isOpen={this.state.confirmModalIsOpen}
          toggle={this.toggleConfirmModal}
        >
          <ModalBody className="alert alert-warning mb-0">
            <p>We recommends to format name to</p>
            <b>{`"${toTitleCase(this.state.event.name)}"`}</b>
            <p className="mt-2">
              to stand out your event, click Yes to accept, click No to preserve
              original format.
            </p>
          </ModalBody>
          <ModalFooter className="alert alert-warning mb-0">
            <button className="btn btn-light" onClick={this.toggleConfirmModal}>
              No
            </button>
            <button
              className="btn btn-primary"
              onClick={this.convertNameToTitleCase}
            >
              Yes
            </button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

AddEvent.contextType = AuthContext;

export default AddEvent;
