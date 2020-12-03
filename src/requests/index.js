// this file is created by me, Anton, to get rid of that nightmare with requests and duplicated code, created before
import {db} from "../firebase";

export const loadMetro = () => {
    return db.collection("metroLookUp")
        .orderBy("name")
        .get()
        .then(querySnapshot => {
            let metroOptions = [];
            querySnapshot.forEach(doc => {
                const metro = doc.data();
                metroOptions = [
                    ...metroOptions,
                    {value: metro.name, label: metro.name}
                ];
            });
            return metroOptions;
        })
};