import moment from "moment";

import firebase from "../../firebase";

export const mapNormalizedDocToRow = (refId, doc) => {
  const {
    venueName,
    address,
    city,
    state,
    organizer,
    crawlerTime,
    startDateTime,
    endDateTime,
  } = doc;

  return {
    ...doc,
    id: refId,
    venueName: venueName || address || "N/A",
    address: address || "N/A",
    city: city || "N/A",
    state: state || "N/A",

    crawlerTimeToDisplay: crawlerTime
      ? moment(crawlerTime)
          .tz("America/Los_Angeles")
          .format("MM/DD/YY hh:mm A")
      : "",
    startDateTimeToDisplay: startDateTime
      ? moment(startDateTime)
          .format("MM/DD/YY hh:mm A")
      : "",
    endDateTimeToDisplay: endDateTime
      ? moment(endDateTime)
          .format("MM/DD/YY hh:mm A")
      : "",

    organizer: organizer || "N/A",
    isRejected: doc["isRejected"] || false
  };
};

export const openURL = url => {
  const u = url.indexOf("http") === 0 ? url : `http://${url}`;
  window.open(u);
};

// regex to check URLs
export const URL_RE = /[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

// everything to create new event from crawled event

const DefaultEventObject = {
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
  categories: [],
  tags: [],
  frequency: "once",
  startDateTime: new Date(),
  endDateTime: new Date(),
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
  dataSource: "",
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
  expiredFlag: false
};

// these functions check type of objects in Firestore
// becase we don't have a scheme for data there
// and sometimes received Blobs instead of string and timestamp

const checkForBoolean = value =>
  typeof value === "boolean" || value instanceof Boolean ? value : false;

const checkForString = value =>
  typeof value === "string" || value instanceof String ? value : "";

const checkForTimestamp = value => {
  if (
    typeof value === "object" &&
    value instanceof firebase.firestore.Timestamp
  ) {
    return value.toDate();
  } else {
    return null;
  }
};

export const normalizeEventCrawlerDoc = doc => {
  return {
    name: checkForString(doc["name"]),
    about: checkForString(doc["about"]),
    organizer: checkForString(doc["organizer"]),
    dataSource: checkForString(doc["dataSource"]),
    email: checkForString(doc["email"]),
    phoneNumber: checkForString(doc["phoneNumber"]),

    venueName: checkForString(doc["location"]["venueName"]),
    address: checkForString(doc["location"]["address"]),
    city: checkForString(doc["location"]["city"]),
    state: checkForString(doc["location"]["state"]),
    metro: checkForString(doc["metro"]),

    crawlerTime: checkForTimestamp(doc["crawlerTime"]),
    startDateTime: checkForTimestamp(doc["startDateTime"]),
    endDateTime: checkForTimestamp(doc["endDateTime"]),

    rawImageURL: checkForString(doc["rawImageURL"]),
    weburl: checkForString(doc["weburl"]),
    sourceLink: checkForString(doc["sourceLink"]),

    note: "",

    isArchived: checkForBoolean(doc["isArchived"]),
    isRejected: checkForBoolean(doc["isRejected"]),
    rejectReason: checkForString(doc["rejectReason"])
  };
};

// See for more details
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#Description
const fixedEncodeURIComponent = str => {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    c => "%" + c.charCodeAt(0).toString(16)
  );
};

// this was a requirement to populate fields so
export const mapCrawlerEventToEvent = event => {
  const {
    name,
    about,
    organizer,
    dataSource,
    email,
    phoneNumber,
    startDateTime,
    endDateTime,
    weburl,
    crawlerTime,
    metro,
    city,
    state,
    address,
    venueName,
    rawImageURL,
    note
  } = event;

  return {
    ...DefaultEventObject,
    name,
    about,
    organizer,
    dataSource,
    email,
    phoneNumber,
    weburl,
    metro,
    note,
    crawlerTime,

    // TODO: remove || condition when fix upcoming table view
    startDateTime:
      startDateTime || firebase.firestore.FieldValue.serverTimestamp(),
    endDateTime: endDateTime || firebase.firestore.FieldValue.serverTimestamp(),

    createEventInfo: {
      createEventTime: firebase.firestore.FieldValue.serverTimestamp(),
      createEventUserName: "crawler",
      createEventUserUID: ""
    },

    operationNotes: `City: ${city}\nState: ${state}\nAddress: ${address}\nVenue: ${venueName}\n\nImage URL: ${rawImageURL}\n\nGoogle Image Search URL:\nhttps://www.google.com/search?tbm=isch&q=${fixedEncodeURIComponent(
      name
    )}\n`
  };
};

// sorting

export const range = (from, to) => {
  let arr = [];
  for (let i = from; i < to; i++) {
    arr.push(i);
  }
  return arr;
};

export const stableSort = (array, cmp) => {
  const stabilizedThis = array.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
};

const desc = (a, b, orderBy) => {
  if (orderBy === "price.min" || orderBy === "price.max") {
    return +b[orderBy] - +a[orderBy];
  }
  if (orderBy === "createEventInfo.createEventTime") {
    return new Date(b[orderBy]) - new Date(a[orderBy])
  } else {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    } else if (b[orderBy] > a[orderBy]) {
      return 1;
    } else {
      return 0;
    }
  }
};

export const getSorting = (order, orderBy) => {
  return order === "desc"
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy);
};

export const dateRangeOverlaps = (aStart, aEnd, bStart, bEnd) => {
  return aStart <= bEnd && bStart <= aEnd;
};
