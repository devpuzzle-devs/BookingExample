import React, { useState, useContext } from 'react'
import { Row, Col, InputGroup } from 'react-bootstrap'
import { CustomPopover } from '../../../CustomPopover/CustomPopover'
import { HandelsContext } from '../../../../context/handels-context'

import classes from './age-setting.module.scss'

export const AgeSetting = ({handleShowAge, age}) => {

  const { handleSaveFilterValue } = useContext(HandelsContext)

  const [ageFilter, setAgeFilter] = useState(age)

  const saveAgeFilter = () => {
    handleShowAge(false)
    handleSaveFilterValue({age: ageFilter})
  }

  const clearAgeFilter = () => {
    handleShowAge(false)
    setAgeFilter(null)
    handleSaveFilterValue({age: null})
  }

  return (
    <>
      <CustomPopover title='Age' width={250} height={100} valueHeight='%' handleSave={saveAgeFilter} handleClear={clearAgeFilter} >
        <div className={classes.Age}>
          <Row>
            <Col lg={12}>
              <InputGroup size='sm' className="mb-3">
                <input
                  type='number'
                  name='age'
                  className='form-control with-char-counter'
                  placeholder='0'
                  value={ ageFilter || '' }
                  onChange={(e) => {
                    let tmp = parseInt(e.target.value)
                    if ( tmp > 18) tmp = 18
                    if ( tmp < 0) tmp = 0
                    setAgeFilter(tmp)
                  }}
                />
              </InputGroup>
            </Col>
          </Row>
        </div>
      </CustomPopover>
      <div className={classes.Bacground} onClick={() => handleShowAge(false)}></div>

    </>
  )
}
