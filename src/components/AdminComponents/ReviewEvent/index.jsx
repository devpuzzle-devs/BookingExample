import React, { Component } from "react";
import { UncontrolledTooltip } from "reactstrap";
import CreatableSelect from "react-select/creatable";

import { db } from "../../../firebase";
import { AuthContext } from "../../../auth-context";

import {
  openURL,
  URL_RE,
  normalizeEventCrawlerDoc,
  mapCrawlerEventToEvent,
  mapNormalizedDocToRow
} from "../ManageEvents/utils";
import CharCount from "../common/CharCount";

class ReviewEvent extends Component {
  state = {
    event: {},
    rejectReasons: [],
    reviewId: this.props.reviewId
  };

  componentDidMount() {
    const { reviewId } = this.props;

    db.collection("eventsCrawler")
      .doc(reviewId)
      .get()
      .then(doc => {
        if (doc.exists) {
          const data = doc.data();
          const { event } = this.state;

          this.setState({
            event: Object.assign(
              { id: reviewId },
              event,
              normalizeEventCrawlerDoc(data)
            )
          });
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      })
      .catch(e => {
        console.error("Error getting document:", e);
      });

    this.loadRejectReasons();
  }

  loadRejectReasons = () => {
    db.collection("eventRejectionReasonsLookUp")
      .orderBy("name")
      .get()
      .then(querySnapshot => {
        let rejectReasons = [];
        querySnapshot.forEach(doc => {
          const r = doc.data();
          rejectReasons = [...rejectReasons, r.name];
        });

        this.setState({ rejectReasons });
      });
  };

  handleRevert = () => {
    const { reviewId } = this.props;

    this.setState({ isProcessing: true });

    const docRef = db.collection("eventsCrawler").doc(reviewId);
    try {
      docRef
        .update({
          isRejected: false,
          isArchived: false,
          rejectReason: ""
        })
        .then(() => {
          this.props.onEventReject(reviewId);
          this.props.onClose();
          this.setState({ isProcessing: false });
        });
    } catch (err) {
      console.error(err);
      this.setState({
        msg: "There is an issue to update event at this time. Try again later.",
        isProcessing: false
      });
    }
  };

  handleReject = () => {
    const { reviewId } = this.props;
    const { rejectReason } = this.state.event;

    this.setState({ isProcessing: true });

    const docRef = db.collection("eventsCrawler").doc(reviewId);
    try {
      docRef
        .update({ isRejected: true, rejectReason: rejectReason || "" })
        .then(() => {
          this.props.onEventReject(reviewId);
          this.props.onClose();
          this.setState({ isProcessing: false });
        });
    } catch (err) {
      console.error(err);
      this.setState({
        msg: "There is an issue to update event at this time. Try again later.",
        isProcessing: false
      });
    }
  };

  handleAccept = () => {
    const { reviewId } = this.props;
    const { event } = this.state;

    this.setState({ isProcessing: true });

    const mappedEvent = mapCrawlerEventToEvent(event);

    let docRef = db.collection("events").doc();
    docRef
      .set(mappedEvent)
      .then(() => {
        console.log("Document written with ID: ", docRef.id);
      })
      .catch(error => {
        console.error("Error adding document: ", error);
        this.setState({
          msg: "Error adding document: ",
          error,
          isProcessing: false
        });
        return;
      });

    this.props.onEventAccept(reviewId, docRef.id);
    this.setState({ isProcessing: false });

    this.props.onClose();
  };

  handleInputChange = e => {
    const { name, value } = e.target;
    const { event } = this.state;

    this.setState({ event: { ...event, [name]: value } });
  };

  handleRejectReasonChange = selectedOption => {
    const { event } = this.state;
    this.setState({ event: { ...event, rejectReason: selectedOption.value } });
  };

  handleRejectReasonCreate = newRejectReason => {
    const { rejectReasons } = this.state;

    const name = newRejectReason.toLowerCase();

    if (rejectReasons.indexOf(name) === -1) {
      db.collection("eventRejectionReasonsLookUp")
        .add({ name })
        .then(() => {
          this.setState({
            rejectReasons: [...rejectReasons, name]
          });
          this.handleRejectReasonChange({ value: name });
        })
        .catch(error => {
          console.error("Error getting document:", error);
        });
    } else {
      this.handleRejectReasonChange({ value: name });
    }
  };

  handleDocumentIdCopyClick = (id) => {
    navigator.clipboard.writeText(id);
  }

  render() {
    const { event, isProcessing, rejectReasons ,reviewId } = this.state;
    const { id, isRejected, isArchived, rejectReason } = event;
    const {
      name,
      organizer,
      dataSource,
      about,
      email,
      phoneNumber,
      note,
      venueName,
      address,
      city,
      state,
      metro,
      weburl,
      sourceLink,
      rawImageURL,
      startDateTimeToDisplay,
      endDateTimeToDisplay,
      crawlerTimeToDisplay
    } = mapNormalizedDocToRow(id, event);

    const isEventFrozen = isRejected || isArchived;

    return (
      <div>
        <div className="form-group row">
          <label htmlFor="name" className="col-md-2 col-form-label text-right">
            Event Name{" "}
            <i
              className="fas fa-info-circle text-black-50"
              id="eventNameInfo"
            />
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
            />
            <CharCount value={name} max={60} />
          </div>
        </div>

        <div className="form-group row">
          <label
            htmlFor="organizer"
            className="col-md-2 col-form-label text-right"
          >
            Organizer
          </label>

          <div className="col-md-10">
            <input
              type="text"
              id="organizer"
              name="organizer"
              className="form-control"
              value={organizer}
              onChange={this.handleInputChange}
            />
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="about" className="col-md-2 col-form-label text-right">
            Description{" "}
            <i
              className="fas fa-info-circle text-black-50"
              id="descriptionInfo"
            />
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
            />
            <CharCount value={about} max={750} bottom />
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="note" className="col-md-2 col-form-label text-right">
            Note{" "}
            <i className="fas fa-info-circle text-black-50" id="noteInfo" />
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
              rows="5"
              value={note}
              onChange={this.handleInputChange}
            />
            <CharCount value={note} max={500} bottom />
          </div>
        </div>

        <div className="form-group row">
          <label
            htmlFor="dataSource"
            className="col-md-2 col-form-label text-right"
          >
            Source
          </label>

          <div className="col-md-10">
            <input
              type="text"
              disabled={true}
              id="dataSource"
              name="dataSource"
              className="form-control"
              value={dataSource}
            />
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="venue" className="col-md-2 col-form-label text-right">
            Venue
          </label>

          <div className="col-md-10">
            <input
              type="text"
              disabled={true}
              id="venue"
              name="venue"
              className="form-control"
              value={venueName}
            />
          </div>
        </div>

        <div className="form-group row">
          <label
            htmlFor="address"
            className="col-md-2 col-form-label text-right"
          >
            Address
          </label>

          <div className="col-md-10">
            <input
              type="text"
              disabled={true}
              id="address"
              name="address"
              className="form-control"
              value={address}
            />
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="city" className="col-md-2 col-form-label text-right">
            City
          </label>

          <div className="col-md-10">
            <input
              type="text"
              disabled={true}
              id="city"
              name="city"
              className="form-control"
              value={city}
            />
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="state" className="col-md-2 col-form-label text-right">
            State
          </label>

          <div className="col-md-10">
            <input
              type="text"
              disabled={true}
              id="state"
              name="state"
              className="form-control"
              value={state}
            />
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="metro" className="col-md-2 col-form-label text-right">
            Metro
          </label>

          <div className="col-md-10">
            <input
              type="text"
              disabled={true}
              id="metro"
              name="metro"
              className="form-control"
              value={metro}
            />
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="phone" className="col-md-2 col-form-label text-right">
            Phone
          </label>

          <div className="col-md-10">
            <input
              type="text"
              disabled={true}
              id="phone"
              name="phone"
              className="form-control"
              value={phoneNumber}
            />
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="email" className="col-md-2 col-form-label text-right">
            Email
          </label>

          <div className="col-md-10">
            <input
              type="text"
              disabled={true}
              id="email"
              name="email"
              className="form-control"
              value={email}
            />
          </div>
        </div>

        <div className="form-group row">
          <label
            htmlFor="startTime"
            className="col-md-2 col-form-label text-right"
          >
            Start time
          </label>

          <div className="col-md-10">
            <input
              type="text"
              disabled={true}
              id="startTime"
              name="startTime"
              className="form-control"
              value={startDateTimeToDisplay}
            />
          </div>
        </div>

        <div className="form-group row">
          <label
            htmlFor="endTime"
            className="col-md-2 col-form-label text-right"
          >
            End time
          </label>

          <div className="col-md-10">
            <input
              type="text"
              disabled={true}
              id="endTime"
              name="endTime"
              className="form-control"
              value={endDateTimeToDisplay}
            />
          </div>
        </div>

        <div className="form-group row">
          <label
            htmlFor="crawledTime"
            className="col-md-2 col-form-label text-right"
          >
            Crawler time
          </label>

          <div className="col-md-10">
            <input
              type="text"
              disabled={true}
              id="crawledTime"
              name="crawledTime"
              className="form-control"
              value={crawlerTimeToDisplay}
            />
          </div>
        </div>

        <div className="form-group row">
          <label
            htmlFor="sourceURL"
            className="col-md-2 col-form-label text-right"
          >
            Source URL
          </label>

          <div className="col-md-10">
            <div className="input-group">
              <input
                type="text"
                disabled={true}
                id="sourceURL"
                name="sourceURL"
                className="form-control"
                value={sourceLink}
              />
              {URL_RE.test(sourceLink) && (
                <div className="input-group-append">
                  <button
                    disabled={false}
                    className={`input-group-text`}
                    onClick={() => {
                      openURL(sourceLink);
                    }}
                  >
                    <i className="fas fa-external-link-alt" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-group row">
          <label
            htmlFor="weburl"
            className="col-md-2 col-form-label text-right"
          >
            Event URL
          </label>

          <div className="col-md-10">
            <div className="input-group">
              <input
                type="text"
                disabled={true}
                id="weburl"
                name="weburl"
                className="form-control"
                value={weburl}
              />
              {URL_RE.test(weburl) && (
                <div className="input-group-append">
                  <button
                    disabled={false}
                    className={`input-group-text`}
                    onClick={() => {
                      openURL(weburl);
                    }}
                  >
                    <i className="fas fa-external-link-alt" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-group row">
          <label
            htmlFor="rawImageURL"
            className="col-md-2 col-form-label text-right"
          >
            Image URL
          </label>

          <div className="col-md-10">
            <div className="input-group">
              <input
                type="text"
                disabled={true}
                id="rawImageURL"
                name="rawImageURL"
                className="form-control"
                value={rawImageURL}
              />

              {URL_RE.test(rawImageURL) && (
                <div className="input-group-append">
                  <button
                    disabled={false}
                    className={`input-group-text`}
                    onClick={() => {
                      openURL(rawImageURL);
                    }}
                  >
                    <i className="fas fa-external-link-alt" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-group row">
          <label
            htmlFor="rejectReason"
            className="col-md-2 col-form-label text-right"
          >
            Reject reason
          </label>

          <div className="col-md-4">
            <CreatableSelect
              isDisabled={isEventFrozen}
              placeholder="Select from the list or create new"
              onChange={this.handleRejectReasonChange}
              onCreateOption={this.handleRejectReasonCreate}
              options={
                rejectReasons &&
                rejectReasons.map(opt => {
                  return { value: opt, label: opt };
                })
              }
              value={
                rejectReason
                  ? { value: rejectReason, label: rejectReason }
                  : null
              }
            />
          </div>
        </div>

        <div className="form-group row">
            <label
              htmlFor="operationNotes"
              className="col-md-2 col-form-label text-right"
            >
              Document Id
            </label>
            <div className="col-md-10 doc-id">
              <span
                    className="clone-btn"
                    onClick={() => this.handleDocumentIdCopyClick(reviewId)}
                    data-toggle="tooltip"
                    data-placement="bottom"
                    title="Copy ID"
              ></span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span>{reviewId}</span>
            </div>
          </div>

        <div className="form-group row">
          <div className="col-md-12 text-right">
            <button className="btn btn-light" onClick={this.props.onClose}>
              Cancel
            </button>

            {isEventFrozen ? (
              <button
                className="btn btn-warning ml-3 btn-with-spinner"
                disabled={isProcessing}
                onClick={this.handleRevert}
              >
                Revert
              </button>
            ) : (
              <React.Fragment>
                <button
                  className="btn btn-danger ml-3 btn-with-spinner"
                  disabled={isProcessing}
                  onClick={this.handleReject}
                >
                  Reject
                </button>

                <button
                  className="btn btn-success ml-3 btn-with-spinner"
                  disabled={isProcessing}
                  onClick={this.handleAccept}
                >
                  Accept
                </button>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    );
  }
}

ReviewEvent.contextType = AuthContext;

export default ReviewEvent;
