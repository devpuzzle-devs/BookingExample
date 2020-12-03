// tags can contain any string text, example '#camp'
// type = null OR 'camp'

export const currentTabFilter = (currentTab, type, tags) => {
    if (!currentTab) return true

    const { type: typeFilter, tags: tagsFilter } = currentTab
    if (typeFilter === null && tagsFilter === null) return true
    
    if (typeFilter === type) return true

    if (tags.filter(tag => tag === tagsFilter).length > 0) { // перевірка LeftFilterMenu на відповідні tags
        return true
    }
    return false
}

export const cityFilter = (currentCity, city) => {
    if (!currentCity.isFilterOn) return true

    return city.toLowerCase().match(currentCity.value.value.toLowerCase())
}

export const searchBoxFilter = (searchText, about, name, metro, note, organizer, tags) => {
    if (!searchText.value) return true
    const search = searchText.value.value.toLowerCase()

    if (name.toLowerCase().match(search)) return true
    if (metro.toLowerCase().match(search)) return true
    if (organizer.toLowerCase().match(search)) return true
    if (note.toLowerCase().match(search)) return true
    if (about.toLowerCase().match(search)) return true

    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i].replace(/_/g, ' ').replace(/#/, '')
        if (tag.toLowerCase().match(search)) return true
    }

}

export const tagsFilter = (searchArrTags, tags) => {

    if (!searchArrTags.isFilterOn) return true

    const {tag1, tag2, tag3} = searchArrTags

    const x = {
        tag1: {value: tag1, isCoincidence: false, isSearchable: false },
        tag2: {value: tag2, isCoincidence: false, isSearchable: false },
        tag3: {value: tag3, isCoincidence: false, isSearchable: false },
    }

    for (const tag in x) {
        if (x[tag].value) {
            x[tag].isSearchable = true
        }
    }

    let exitFromLoop = false

    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i]

        for (const propertyName in x) {
            if (x[propertyName].isSearchable && !x[propertyName].isCoincidence ) {

                if (x[propertyName].value === tag) {
                    x[propertyName].isCoincidence = true
                    if(x.tag1.isCoincidence === x.tag1.isSearchable &&
                        x.tag2.isCoincidence === x.tag2.isSearchable &&
                        x.tag3.isCoincidence === x.tag3.isSearchable) {
                            exitFromLoop = true
                            break
                        }
                }
            }
        }

        if (exitFromLoop) break
    }

    if (Object.values(x).filter( tag => tag.isSearchable).length === Object.values(x).filter( tag => tag.isCoincidence).length  ) {
        return true
    }

    return false

}

export const ageFilter = (filterAge, eventAge) => {
    if (!filterAge) return true
    if (!eventAge.max && !eventAge.min) return true
    return eventAge.min <= filterAge && eventAge.max >= filterAge
}

export const dateFilter = (filterDate, startDateTime, endDateTime) => {
    if ( !filterDate ) return true
    return startDateTime.toDate() <= filterDate && filterDate <= endDateTime.toDate()
}

export const categoryFilter = (filterTags, eventTags) => {
    if (!filterTags) return true
    const arrOfAllCategoryFilters = Object.keys(filterTags).map( key => {
        return filterTags[key]
    }).flat(20)

    const coincidence = arrOfAllCategoryFilters.map( el => {
        return eventTags.map (event => {
            if (el === event) return el
            return[]
        })
    } ).flat(10)

    if (coincidence.length > 0) return true

    return false
}

export const savedFilter = (isSaved, arrOfID, eventID) => {
    if (!isSaved) return true
    if (!arrOfID) return true
    if (!eventID) return true
    if (arrOfID.filter( id => id === eventID).length > 0) return true
    return false
}
