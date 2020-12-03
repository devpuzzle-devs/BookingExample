import React from 'react'
import './custom-checkbox.scss'

export const CustomCheckbox = ({ category, handlerCheckBoxChange, defaultChecked }) => {
    const { name, tags } = category
    return (
        <label
            label={name}
            className='container'
            onChange={(e) => handlerCheckBoxChange(e, tags)}
        >{name}
            <input
                name={name}
                type="checkbox"
                defaultChecked={defaultChecked}
            />
            <span className='checkmark'></span>
        </label>
    )
}
