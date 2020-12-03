import React from "react";
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

const RowsPerPageSelect = ({ onChangeRowsPerPage, rowsPerPage }) => {
  return (
    <UncontrolledDropdown>
      <DropdownToggle tag="button" className="btn btn-light perpage-btn mx-3">
        <span className="large">{rowsPerPage}</span>{" "}
        <i className="fas fa-sort fa-2x" />
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem header>Rows per page</DropdownItem>
        <DropdownItem onClick={e => onChangeRowsPerPage(20)}>20</DropdownItem>
        <DropdownItem onClick={e => onChangeRowsPerPage(50)}>50</DropdownItem>
        <DropdownItem onClick={e => onChangeRowsPerPage(100)}>100</DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default RowsPerPageSelect;
