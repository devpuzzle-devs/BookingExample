import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { db } from "../../../firebase";

const LogEntryRow = props => {
  const { data, userNames } = props;
  const { userUID, userActionTimestamp, userAction } = data;

  const date =
    typeof userActionTimestamp.toDate === "function"
      ? userActionTimestamp.toDate()
      : userActionTimestamp;

  return (
    <tr>
      <td>
        <small className="text-small text-info">
          <i className="fas fa-user"></i> {userNames[userUID] || ""}{" "}
          <i className="far fa-clock"></i> {date.toLocaleDateString()}{" "}
          {date.toLocaleTimeString()}
        </small>
        <br />
        <i className="far fa-check-circle text-muted"></i> {userAction}
      </td>
    </tr>
  );
};

LogEntryRow.propTypes = {
  data: PropTypes.object.isRequired,
  userNames: PropTypes.object.isRequired
};

export const UpdateEventLog = props => {
  const { eventId, userNames } = props;

  const [logs, setLogs] = useState({});
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    eventId &&
      db
        .collection("events")
        .doc(eventId)
        .collection("updateEventLog")
        .get()
        .then(querySnapshot => {
          let data = {};
          querySnapshot.forEach(doc => {
            data[doc.id] = doc.data();
          });

          setLogs(data);
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
          console.error(err);
        });
  }, [eventId]);

  return (
    <React.Fragment>
      {isLoading ? (
        <div>
          <p>Loading...</p>
        </div>
      ) : eventId && Object.entries(logs).length !== 0 ? (
        <table
          className="table table-striped"
          style={{ wordBreak: "break-word" }}
        >
          <tbody>
            {logs &&
              Object.keys(logs)
                .reverse()
                .map((refId, idx) => (
                  <LogEntryRow
                    key={idx}
                    data={logs[refId]}
                    userNames={userNames}
                  />
                ))}
          </tbody>
        </table>
      ) : (
        <p>No changes</p>
      )}
    </React.Fragment>
  );
};

UpdateEventLog.propTypes = {
  eventId: PropTypes.string,
  userNames: PropTypes.object.isRequired
};

export default UpdateEventLog;
