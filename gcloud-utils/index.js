var admin = require("firebase-admin");
const sharp = require('sharp');
var stream = require('stream');

var serviceAccount = require("./service-account-key/test-27087e361825.json");
serviceAccount['private_key'] = process.env.GOOGLE_CLOUD_API_KEY
serviceAccount['private_key_id'] = process.env.GOOGLE_CLOUD_API_KEY_ID

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "test.appspot.com"
});

var bucket = admin.storage().bucket();

const TARGET_THUMB_SIZE = 51200;
const SRC_FOLDER = 'images/';
const TARGET_FOLDER = 'thumbs/';
//console.log(bucket)
//const file = bucket.file('my-file');
const options = {
  prefix: SRC_FOLDER,
};
 bucket.getFiles(options, function(err, files) {
  if (!err) {
    // files is an array of File objects.
	files.forEach(file => {
    // console.log(file.name);
    const thumbName = file.name.replace(SRC_FOLDER, TARGET_FOLDER);
    const thumbFile = bucket.file(thumbName);
    thumbFile.get(function(err) {
      if (err) {
        console.log('Creating thumb image for ', thumbName)
        resizeImageAndUpload(file, thumbName);
      }

    });
  });
  
  } else {
	  console.log(err)
  }
});

function resizeImageAndUpload(inputFile, newPath) {
  inputFile.download().then(function(data) {
    const contents = data[0];
    const image = sharp(contents);
    sharp(contents)
    .jpeg()
    .toBuffer()
    // .metadata()
    .then(function(buffer) {
      return sharp(buffer)
      .metadata()
    })
    .then(function(metadata) {
      // console.log(metadata);
      if (metadata.size > TARGET_THUMB_SIZE) {
        const conversionFactor = Math.sqrt(metadata.size / TARGET_THUMB_SIZE);
        return image
        .resize(Math.round(metadata.width / conversionFactor))
        .jpeg()
        .toBuffer();
      }
      return image
        .jpeg()
        .toBuffer();
      
    })
    .then(function(data) {
      const newFile = bucket.file(newPath);
      // Initiate the source
      var bufferStream = new stream.PassThrough();
    
      // Write your buffer
      bufferStream.end(Buffer.from(data));
    
      // Pipe it to something else  
      bufferStream
      .pipe(
        newFile.createWriteStream({
          metadata: {
            contentType: 'image/jpeg',
          }
        })
        .on('error', function(err) {})
        .on('finish', function() {
          // The file upload is complete.
          console.log('Upload complete ', newPath)
        })
      )
    })

  });
}
