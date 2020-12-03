import React, { useState, useContext } from 'react'
import { CustomPopover } from '../../../CustomPopover/CustomPopover'
import { CustomCheckbox } from '../../../CustomCheckbox/CustomCheckbox'
import { HandelsContext } from '../../../../context/handels-context'

import classes from './category-setting.module.scss'

export const CategorySetting = ({
    filterCategory,
    categoryLookUp,
    handleShowCategory
}) => {

    const { handleSaveFilterValue } = useContext(HandelsContext)

    const [category, setCategory] = useState({...filterCategory})

    const handleSave = () => {
        handleSaveFilterValue({ category })
        handleShowCategory(false)
    }

    const handleClear = () => {
        handleSaveFilterValue({ category: null })
        handleShowCategory(false)
    }

    const handlerCheckBoxChange = (event, tags) => {
        if (event.target.checked) {
            setCategory({ ...category, [event.target.name]: tags })
        } else {
            const tmp = { ...category }
            delete tmp[event.target.name]
            setCategory({ ...tmp })
        }
    }

    const categories = categoryLookUp
        .filter(cat => cat.name !== 'Museum & Free Days')
        .map( (cat, index) => {
            return (
                <CustomCheckbox 
                    key={`${cat.name}-${index}`}
                    category={cat}
                    defaultChecked={!!category[cat.name] ? true : false}
                    handlerCheckBoxChange={handlerCheckBoxChange}
                />
            )
        })

    return (
        <>
            <CustomPopover
                title='Category'
                height={100}
                valueHeight='%'
                width={250}
                handleSave={handleSave}
                handleClear={handleClear}
            >
                <div className={classes.Category}>
                    { categories }
                </div>
            </CustomPopover>

            <div className={classes.Bacground} onClick={() => handleShowCategory(false)}></div>
        </>
    )
}
