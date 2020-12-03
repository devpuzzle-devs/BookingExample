import React, { useState } from 'react'
import Select from 'react-select'
import { CustomPopover } from '../../../CustomPopover/CustomPopover'

import classes from './tags-setting.module.scss'

const stl1 = {
    fontFamily: 'Avenir',
    fontSize: '13px',
    fontWeight: '500',
    width: '100%',
    height: '40px',
    padding: '5px',
    // paddingLeft: '30px',
    textAlign: 'left',
    color: '#2f3038',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#efeff5',
    borderRadius: '5px',
    outline: 'none',
    backgroundColor: '#fff'
}

const stl2 = {
    width: '100%',
    borderStyle: 'none',
    outline: 'none',
    backgroundColor: '#fff',
    minHeight: 'auto'
}
const colourStyles = {
    container: styles => ({ ...styles, ...stl1 }),
    control: styles => ({ ...styles, ...stl2 }),
    valueContainer: styles => ({
        ...styles,
        padding: '2px 0',
        textAlign: 'center'
    }),
    indicatorsContainer: styles => ({
        ...styles,
        padding: '0',
        width: '32px',
        height: '32px'
    }),
    indicatorSeparator: styles => ({ display: 'none' })
    // menu: styles => ({ ...styles, flexDirection: 'column'}),
}

export const TagsSetting = ({
    filterTags,
    tagsLookUp,
    handleSaveFilterValue,
    handleShowTags
}) => {
    const [arrTags, setArrTags] = useState({tags: {...filterTags}})

    const handleSave = () => {
        handleSaveFilterValue(arrTags)
        handleShowTags(false)
    }

    const handleClear = () => {
        handleSaveFilterValue({tags: {tag1: null, tag2: null, tag3: null, isFilterOn: false}})
        handleShowTags(false)
    }

    return (
        <>
            <CustomPopover
                title='Tags'
                height={100}
                valueHeight='%'
                handleSave={handleSave}
                handleClear={handleClear}
            >
                <div className={classes.Tags}>
                    <Select
                        className={`${classes.Tag} DeleteSvgCollapse`}
                        isSearchable
                        isClearable
                        styles={colourStyles}
                        placeholder='+Add'
                        options={tagsLookUp}
                        isDisabled={!tagsLookUp}
                        onChange={e => {
                            if (!e) {
                                setArrTags({tags: { ...arrTags.tags, tag1: null }})
                                if ( !arrTags.tags.tag2 && !arrTags.tags.tag3 ) {
                                    setArrTags({tags: { ...arrTags.tags, tag1: null, isFilterOn: false }})
                                }
                            } else {
                                setArrTags({
                                    tags: {
                                    ...arrTags.tags,
                                    tag1: e.label,
                                    isFilterOn: true
                                }})
                            }
                        }}
                        defaultInputValue={arrTags.tags.tag1 || ''}
                    />
                    <Select
                        className={`${classes.Tag} DeleteSvgCollapse`}
                        isSearchable
                        isClearable
                        styles={colourStyles}
                        placeholder='+Add'
                        options={tagsLookUp}
                        isDisabled={!tagsLookUp}
                        onChange={e => {
                            if (!e) {
                                setArrTags({tags: { ...arrTags.tags, tag2: null }})
                                if ( !arrTags.tags.tag1 && !arrTags.tags.tag3 ) {
                                    setArrTags({tags: { ...arrTags.tags, tag2: null, isFilterOn: false }})
                                }
                            } else {
                                setArrTags({
                                    tags: {
                                    ...arrTags.tags,
                                    tag2: e.label,
                                    isFilterOn: true
                                }})
                            }
                        }}
                        defaultInputValue={arrTags.tags.tag2 || ''}
                    />

                    <Select
                        className={`${classes.Tag} DeleteSvgCollapse`}
                        isSearchable
                        isClearable={true}
                        styles={colourStyles}
                        placeholder='+Add'
                        options={tagsLookUp}
                        isDisabled={!tagsLookUp}
                        onChange={e => {
                            if (!e) {
                                setArrTags({tags: { ...arrTags.tags, tag3: null }})
                                if ( !arrTags.tags.tag1 && !arrTags.tags.tag2 ) {
                                    setArrTags({tags: { ...arrTags.tags, tag3: null, isFilterOn: false }})
                                }
                            } else {
                                setArrTags({
                                    tags: {
                                    ...arrTags.tags,
                                    tag3: e.label,
                                    isFilterOn: true
                                }})
                            }
                        }}
                        defaultInputValue={arrTags.tags.tag3 || ''}
                    />
                </div>
            </CustomPopover>
        <div className={classes.Bacground} onClick={() => handleShowTags(false)}></div>

        </>
    )
}
