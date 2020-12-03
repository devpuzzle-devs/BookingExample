import React, { useState, useContext } from 'react'
import { CustomPopover } from '../../../CustomPopover/CustomPopover'
import DayPicker from 'react-day-picker'
import { HandelsContext } from '../../../../context/handels-context'

import classes from './date-setting.module.scss'

export const DateSetting = ({ date, handleShowDate }) => {
  const { handleSaveFilterValue } = useContext(HandelsContext)
  const [dateFilter, setDateFilter] = useState({date})

  const saveDateFilter = () => {
    handleShowDate(false)
    handleSaveFilterValue(dateFilter)
  }

  const clearDateFilter = () => {
    handleShowDate(false)
    setDateFilter(null)
    handleSaveFilterValue({date: null})
  }
  return (
    <>
      <CustomPopover title='Date' height={100} width={100} valueWidth='%' valueHeight='%' handleSave={saveDateFilter} handleClear={clearDateFilter} >
        <DayPicker
          // showOutsideDays
          canChangeMonth={true}
          onDayClick={(e) => {
            setDateFilter({date: e})
          }}
          selectedDays={dateFilter.date}
        />
      </CustomPopover>
      <div className={classes.Bacground} onClick={() => handleShowDate(false)}></div>
    </>
  )
}
