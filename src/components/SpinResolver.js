// This Spinner is for showing in specific, as default Spinner(that was already used in the project) is styled to show only in the center
// I don't want to break html structure by modifying existing Spinner, so I created m own "SpinResolver" component

import React from 'react';
import { Spinner } from 'reactstrap';

export default () => <Spinner color="success" style={{ margin: 'auto' }}/>