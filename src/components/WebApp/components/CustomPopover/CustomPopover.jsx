import React from 'react'

import classes from './custom-popover.module.scss'

export const CustomPopover = (props) => {
    const {
      title,
      children,
      height,
      width,
      buttonOff,
      valueWidth = 'px',
      valueHeight = 'px',
      handleSave,
      handleClear,
    } = props

    const newWidth = `${width}${valueWidth}`
    const newHeight = `${height}${valueHeight}`
    return (
      <div style={{height: newHeight, width: newWidth}} className={classes.Popover}>
        {title && <div className={classes.Title}>{title}</div>}
        {children}

        { !buttonOff && <hr/>}
        {
          !buttonOff &&
          <div className={classes.ButtonWrapper}>
            <div className={classes.PopoverButton} onClick={handleClear}>Clear</div>
            <div className={classes.PopoverButton} onClick={handleSave}>Save</div>
          </div>
        }
      </div>
    )
}
