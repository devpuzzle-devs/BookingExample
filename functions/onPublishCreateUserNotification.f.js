const admin = require('./fb-admin');
const db = admin.firestore();
const usersRef = db.collection("users");
const eventsRef = db.collection("events");
const notificationsRef = db.collection("notifications");
const promisePool = require('es6-promise-pool');
const PromisePool = promisePool.PromisePool;
const moment = require('moment');
// Maximum concurrent batch operations.
const MAX_CONCURRENT = 1;
const LIMIT = 490;

exports.handler = async message => {

    // Fetch all users details.
    const usersChunks = await getUsersChunks();

    // Fetch all event details.
    const eventsChunks = await getEventsChunks();
    let eventsData = {};
    eventsChunks.forEach(chunk => {
        eventsData = {
            ...eventsData,
            ...chunk
        }
    })
    //find users to notify
    
    // Use a pool so that we execute maximum `MAX_CONCURRENT` users in parallel.
    const promisePool = new PromisePool(() => batchUpdate(usersChunks, eventsData), MAX_CONCURRENT);
    await promisePool.start();
    console.log('User notifications create finished');

};

const batchUpdate = (usersChunks, eventsData) => {
    if (usersChunks.length > 0) {
        const users = usersChunks.pop();
        // Get a new write batch
        const batch = db.batch();
        let counter = 0;
        Object.keys(users).forEach(userRefId => {
            const user = users[userRefId];
            const { savedEvents } = user;
            if (savedEvents && savedEvents.length > 0) {
                console.log(`Checking saved events for user: ${userRefId}`)
                let notificationsList = [];
                savedEvents.forEach(eventRefId => {
                    const event = eventsData[eventRefId];
                    if (!event) {
                        return
                    }
                    let newNotification = {
                        clickFlag: false,
                        creationTime: new Date(),
                        // notificationMessage: `${event['name']} is 3 days away.`,
                        notificationThumbImageURL: event['image']['downloadURLSmall'] || null,
                        notificationUID: getRandomInt(),
                        removeFlag: false,
                        seenFlag: false,
                        // subtype: '3daysReminder',
                        targetID: eventRefId,
                        targetName: event['name'],
                        type: 'event'
                    }
                    const startsIn3days = moment().add(3, 'days').isSame(moment(event['startDateTime'].toDate()), 'day');
                    const startsIn1day = moment().add(1, 'days').isSame(moment(event['startDateTime'].toDate()), 'day');
                    
                    if (startsIn3days) {
                        counter++;
                        newNotification = {
                            ...newNotification,
                            notificationMessage: `${event['name']} is 3 days away.`,
                            subtype: '3daysReminder',
                        }
                        notificationsList.push(newNotification);
                        console.log(`Event ${eventRefId} ${event['name']} is 3 days away.`)

                    } else if (startsIn1day) {
                        counter++;
                        newNotification = {
                            ...newNotification,
                            notificationMessage: `${event['name']} is coming up tomorrow.`,
                            subtype: '1dayReminder',
                        }
                        notificationsList.push(newNotification);
                        console.log(`Event ${eventRefId} ${event['name']} is coming up tomorrow.`)
                    }
                })

                if (notificationsList.length) {
                    console.log('New notifications ids: ', notificationsList.map(n => n.notificationUID).join(', '));
                    console.log('Target notifications events ids: ', notificationsList.map(n => n.targetID).join(', '));
                    let dataToUpdate = {
                        newNotificationFlag: true,
                        notificationsList: admin.firestore.FieldValue.arrayUnion(...notificationsList),
                        numberOfNewNotifications: admin.firestore.FieldValue.increment(notificationsList.length)
                    };
                    batch.set(notificationsRef.doc(userRefId), dataToUpdate, {merge: true});
                }
            }
        }) 
        // Commit the batch
        return batch.commit().then(() => {
            return console.log('Successfully updated users notifications', counter);
        }).catch(error => {
            return console.error('Error performing batch update: ', error);
        });
    } else {
        return null
    }
}

async function queryPagedUsersWithLimit (lastDoc) {
    // console.log('Execute queryPagedEventsWithLimit', lastDoc);
    const query = lastDoc ? usersRef.startAfter(lastDoc).limit(LIMIT) : usersRef.limit(LIMIT)
    // load events collection and check for activeFlag validity
    const querySnapshot = await query.get();
        let data = {};
        // Get the last visible document
        newLastDoc = querySnapshot.docs[querySnapshot.docs.length-1];
        // console.log('New last doc: ', newLastDoc)
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            data[doc.id] = doc.data();
        });
        return {
            docs: data,
            lastDoc: newLastDoc
        }
}
// returns array of users in chunks with LIMIT
async function getUsersChunks (usersChunks = [], lastDoc) {
    const result = await queryPagedUsersWithLimit(lastDoc);
    console.log('Read users length', usersChunks.length);
    usersChunks = usersChunks.concat(result.docs);

    if (result.lastDoc) {
        return getUsersChunks(usersChunks, result.lastDoc);
    }

    return usersChunks;
}

async function queryPagedEventsWithLimit (lastDoc) {
    // console.log('Execute queryPagedEventsWithLimit', lastDoc);
    const query = lastDoc ? eventsRef.startAfter(lastDoc).limit(LIMIT) : eventsRef.limit(LIMIT)
    // load events collection and check for activeFlag validity
    const querySnapshot = await query.get();
        let data = {};
        // Get the last visible document
        newLastDoc = querySnapshot.docs[querySnapshot.docs.length-1];
        // console.log('New last doc: ', newLastDoc)
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            data[doc.id] = doc.data();
        });
        return {
            docs: data,
            lastDoc: newLastDoc
        }
}
// returns array of events in chunks with LIMIT
async function getEventsChunks (eventsChunks = [], lastDoc) {
    const result = await queryPagedEventsWithLimit(lastDoc);
    console.log('Read events length', eventsChunks.length);
    eventsChunks = eventsChunks.concat(result.docs);

    if (result.lastDoc) {
        return getEventsChunks(eventsChunks, result.lastDoc);
    }

    return eventsChunks;
}

function getRandomInt() {
    const max = 999999;
    const min = 100000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}