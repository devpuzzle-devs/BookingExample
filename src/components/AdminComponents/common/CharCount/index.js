import React from 'react';

import './style.scss';

const CharCount = ({value, max, bottom}) => {
    const currLength = value ? value.length : 0;
    let currClassName = '';
    if (currLength > 0 && currLength < max) {
        currClassName = 'text-dark';
    } else if (currLength > max) {
        currClassName = 'text-danger';
    }

    return (
        <span className={`char-count ${bottom ? 'bottom' : 'top'}`}><span className={currClassName}>{currLength}</span>/{max}</span>
    )
}

export default CharCount