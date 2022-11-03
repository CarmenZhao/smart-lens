var AWS = require("aws-sdk");

AWS.config.update({ region: "ap-southeast-2" });
var s3Client = new AWS.S3({ apiVersion: "2006-03-01" });
// Call S3 to list the buckets
function listBuckets() {
  const ListS3 = s3Client.listBuckets(function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.Buckets[0]);
      return data.Buckets;
    }
  });
}
listBuckets();

// const getGetUrl = (filename) => {
//   try {
//     var presignedGetURL = s3Client.getSignedUrlPromise("getObject", {
//       Bucket: "test-bucket-n10966790",
//       Key: filename,
//       Expires: 3600, //time to expire in seconds
//     });

//     //console.log(presignedGetURL);
//     return presignedGetURL;
//   } catch (err) {
//     console.log(`Error creating bucket: ${err}`);
//     return null;
//   }
// };

module.exports = { s3Client };
