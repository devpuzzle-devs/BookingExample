import React, { useState, useContext, useCallback } from 'react'

import { Button, Row, Form } from 'react-bootstrap'
import DayPicker from 'react-day-picker'
import Select from 'react-select'
import { CustomCheckbox } from '../CustomCheckbox/CustomCheckbox'
import { HandelsContext } from '../../context/handels-context'
import { debounce } from 'lodash'

import classes from './navigation-mobile.module.scss'
import './calendar.scss'

import search_locaion_ico from '../../../../assets/img/search-locaion/search-locaion.png'

const stl1 = {
    fontFamily: 'Avenir',
    fontSize: '15px',
    width: '100%',
    height: '40px',
    padding: '5px',
    paddingLeft: '30px',
    textAlign: 'left',
    color: '#b3b5c7',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#f7f8fc',
    borderRadius: '5px',
    outline: 'none',
    backgroundColor: '#f7f8fc',
    backgroundImage: `url(${search_locaion_ico})`,
    backgroundRepeat: 'no-repeat' ,
    backgroundPositionY: 'center',
}
const stl2 = {
    width: '100%',
    borderStyle: 'none',
    outline: 'none',
    backgroundColor: '#f7f8fc',
    minHeight: 'auto'
}

const colourStyles = {
    container: styles => ({...styles, ...stl1}),
    control: styles => ({...styles, ...stl2,}),
    valueContainer: styles => ({ ...styles, padding: '2px 0'}),
    indicatorsContainer: styles => ({ ...styles, padding: '0', width: '32px', height: '32px'} ),
    indicatorSeparator: styles => ({display: 'none'}),
};

export const MobileFilterMenu = (props) => {
    const {
        className,
        citiesLookUp,
        filters,
        categoryLookUp,
        countOfVisibleEvents,
        isOneOfFiltersSet,
        setIsButtonAplyClicked,
        setIsApplyClick,
        setPrevFilters,
        prevFilters,
        currentTab,
    } = props

    const {
        cityName,
        category,
        age,
        date,
    } = filters

    const {
        handleSaveFilterValue,
        handlerSearchByCity,
        handleToggleBurgerMenu
    } = useContext(HandelsContext)

    const [showCategory, setShowCategory] = useState(false)
    const [showDate, setShowDate] = useState(false)
    const [showAge, setShowAge] = useState(false)
    const [mobileFilters, setMobileFilters] = useState({
        category,
        age,
        date,
    })

    const showAll = (value) => {
        setShowCategory(value)
        setShowDate(value)
        setShowAge(value)
    }

    const saveAllFilters = (filters) => {
        setIsApplyClick(true)
        setIsButtonAplyClicked(true)
        handleToggleBurgerMenu()
        handleSaveFilterValue(filters)
        // setPrevFilters({...prevFilters, ...filters})
    }

    const handlerCheckBoxChange = (event, tags) => {
        if (event.target.checked) {
            setMobileFilters({...mobileFilters, category: {...mobileFilters.category, [event.target.name]: tags} })
            handleSaveFilterValue({...mobileFilters, category: {...mobileFilters.category, [event.target.name]: tags} })
        } else {
            const tmp = {...mobileFilters.category}
            delete tmp[event.target.name]
            if (Object.keys(tmp).length === 0) {
                setMobileFilters({...mobileFilters, category: null})
                handleSaveFilterValue({...mobileFilters, category: null})
            } else {
                setMobileFilters({...mobileFilters, category: {...tmp}})
                handleSaveFilterValue({...mobileFilters, category: {...tmp}})
            }
        }
    }

    const categories = categoryLookUp
        .filter(cat => cat.name !== 'Museum & Free Days')
        .map((cat, index) => {
            const defaultChecked = mobileFilters.category && !!mobileFilters.category[cat.name] ? true : false
            return (
                <CustomCheckbox
                    key={`${cat.name}-${index}`}
                    category={cat}
                    defaultChecked={defaultChecked}
                    handlerCheckBoxChange={handlerCheckBoxChange}
                />
            )
        })

    const textAge = mobileFilters.age ? `Age: ${mobileFilters.age}` : 'Age'

    const debounceSaveFilterValue = useCallback(
        debounce( (mobileFilters, age) => {
            handleSaveFilterValue({ ...mobileFilters, age})
        }, 500), [])

    return (
        <div className={`${classes.MobileFilterMenu} ${className}`}>
            <div className={`${classes.NavItem} ${classes.NavFilterItem}`}>

                <Select
                    className={`col-7 col-md-2 mr-2 DeleteSvgCollapse ${classes.InputTown} ${cityName.IsFilterOn ? classes.FiltersActive : ''}`}
                    isSearchable
                    styles={colourStyles}
                    placeholder='Search city name'
                    isClearable
                    options={citiesLookUp}
                    isDisabled={!citiesLookUp}
                    value={cityName.value}
                    onChange={handlerSearchByCity}
                />

                { currentTab && currentTab.name === 'summer_camp' &&
                    <div
                        className={`${classes.FilterButtons} ${category ? classes.FiltersActive : ''}`}
                        onClick={() => {
                            showAll(false)
                            setShowCategory(!showCategory)
                        }}
                    >
                        Category
                    </div>
                }

                { showCategory &&
                    <Form>
                        { categories }
                    </Form>
                }

                <div
                    className={`${classes.FilterButtons} ${age ? classes.FiltersActive : ''}`}
                    onClick={() => {
                        showAll(false)
                        setShowAge(!showAge)
                    }}
                >
                    {
                        textAge
                    }
                </div>

                {
                    showAge &&
                    <Row>
                        <div className="col-1"></div>
                        <input
                            type='number'
                            name='minAge'
                            className='form-control with-char-counter col-10'
                            placeholder='0'
                            value={mobileFilters.age || '' }
                            onChange={(e) => {
                                let tmp = parseInt(e.target.value)
                                if (tmp > 18) tmp = 18
                                if (tmp < 0) tmp = null
                                setMobileFilters({ ...mobileFilters, age: tmp})
                                debounceSaveFilterValue(mobileFilters, tmp)
                            }}
                        />
                        <div className="col-1"></div>
                    </Row>
                }

                { currentTab && currentTab.name === 'summer_camp' &&
                    <div
                        className={`${classes.FilterButtons} ${date ? classes.FiltersActive : ''}`}
                        onClick={() => {
                            showAll(false)
                            setShowDate(!showDate)
                        }}
                    >
                        { mobileFilters.date
                            ? `${mobileFilters.date ? mobileFilters.date.toLocaleDateString('en-US', {month: 'short', day: '2-digit'}) : ''}`
                            : 'Date'
                        }
                    </div>
                }
                
                {
                    showDate &&
                    <DayPicker
                        canChangeMonth={true}
                        onDayClick={(e) => {
                            setMobileFilters({
                                ...mobileFilters,
                                date: e
                            })
                            handleSaveFilterValue({
                                ...mobileFilters,
                                date: e
                            })
                        }}
                        selectedDays={mobileFilters.date}
                    />
                }

                <Button variant="primary" className={classes.ApplyFilter} onClick={() => saveAllFilters(mobileFilters)}>
                    Apply filters
                    {isOneOfFiltersSet  ? ` (${countOfVisibleEvents} results)` : ''}
                </Button>
            </div>
        </div>
    )
}
