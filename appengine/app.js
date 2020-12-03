const axios = require('axios');
const dateformat = require('dateformat');
const express = require('express');
const { google } = require('googleapis');

const { PubSub } = require('@google-cloud/pubsub');

// Create a new PubSub client using the GOOGLE_CLOUD_PROJECT
// environment variable. This is automatically set to the correct
// value when running on AppEngine.
const pubsubClient = new PubSub({
  projectId: process.env.GOOGLE_CLOUD_PROJECT
});

const app = express();

// Trigger a backup
app.get('/cloud-firestore-export', async (req, res) => {
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/datastore']
  });

  const accessTokenResponse = await auth.getAccessToken();
  const accessToken = accessTokenResponse.token;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + accessToken
  };

  const outputUriPrefix = req.param('outputUriPrefix');
  if (!(outputUriPrefix && outputUriPrefix.indexOf('gs://') == 0)) {
    res.status(500).send(`Malformed outputUriPrefix: ${outputUriPrefix}`);
  }

  // Construct a backup path folder based on the timestamp
  const timestamp = dateformat(Date.now(), 'yyyy-mm-dd-HH-MM-ss');
  let path = outputUriPrefix;
  if (path.endsWith('/')) {
    path += timestamp;
  } else {
    path += '/' + timestamp;
  }

  const body = {
    outputUriPrefix: path
  };

  // If specified, mark specific collections for backup
  const collectionParam = req.param('collections');
  if (collectionParam) {
    body.collectionIds = collectionParam.split(',');
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const url = `https://firestore.googleapis.com/v1beta1/projects/${projectId}/databases/(default):exportDocuments`;

  try {
    const response = await axios.post(url, body, { headers: headers });
    res
      .status(200)
      .send(response.data)
      .end();
  } catch (e) {
    if (e.response) {
      console.warn(e.response.data);
    }

    res
      .status(500)
      .send('Could not start backup: ' + e)
      .end();
  }
});

// For any request to /public/{some_topic}, push a simple
// PubSub message to that topic.
app.get('/update-active-flag', async (req, res) => {
  // const topic = req.params['topic'];

  try {
    await pubsubClient.topic('update-active-flag')
        .publish(Buffer.from('test'));

    res.status(200).send('Published to update-active-flag').end();
  } catch (e) {
    if (e) {
      console.warn(e);
    }
    res.status(500).send('' + e).end();
  }
});

app.get('/update-recurring-events', async (req, res) => {
  // const topic = req.params['topic'];

  try {
    await pubsubClient.topic('update-recurring-events')
        .publish(Buffer.from('test'));

    res.status(200).send('Published to update-recurring-events').end();
  } catch (e) {
    if (e) {
      console.warn(e);
    }
    res.status(500).send('' + e).end();
  }
});

app.get('/update-expired-flag', async (req, res) => {
  // const topic = req.params['topic'];

  try {
    await pubsubClient.topic('update-expired-flag')
        .publish(Buffer.from('test'));

    res.status(200).send('Published to update-expired-flag').end();
  } catch (e) {
    if (e) {
      console.warn(e);
    }
    res.status(500).send('' + e).end();
  }
});

app.get('/archive-events', async (req, res) => {
  // const topic = req.params['topic'];

  try {
    await pubsubClient.topic('archive-events')
        .publish(Buffer.from('test'));

    res.status(200).send('Published to archive-events').end();
  } catch (e) {
    if (e) {
      console.warn(e);
    }
    res.status(500).send('' + e).end();
  }
});

app.get('/create-user-notifications', async (req, res) => {
  // const topic = req.params['topic'];

  try {
    await pubsubClient.topic('create-user-notifications')
        .publish(Buffer.from('test'));

    res.status(200).send('Published to create-user-notifications').end();
  } catch (e) {
    if (e) {
      console.warn(e);
    }
    res.status(500).send('' + e).end();
  }
});

// Index page, just to make it easy to see if the app is working.
app.get('/', (req, res) => {
  res
    .status(200)
    .send('[scheduled-backups]: Hello, world!')
    .end();
});

// Start the server
const PORT = process.env.PORT || 6060;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
