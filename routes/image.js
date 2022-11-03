var express = require("express");
const { s3Client } = require("../s3/s3");
const multer = require("multer");
const multerS3 = require("multer-s3-v2");
const axios = require("axios");
const cocoSsd = require("@tensorflow-models/coco-ssd");
const tf = require("@tensorflow/tfjs-node");

//const upload = multer({ dest: "uploads/" });
var router = express.Router();

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: "test-bucket-n10966790",
    acl: "public-read",
    contentType: function (req, file, cb) {
      cb(null, file.mimetype);
    },
    key: function (req, file, cb) {
      //console.log(file);
      cb(null, file.originalname);
    },
  }),
});

// read image from file path and decode
const readImage = async (url) => {
  //console.log(url);
  const image = await axios(url, { responseType: "arraybuffer" });
  //const imageBuf = image.data;
  //console.log(image.headers["content-type"]);
  const tfimage = tf.node.decodeImage(image.data);
  return { tfimage };
};

/* GET home page. */
router.post("/", upload.array("image"), async function (req, res, next) {
  //   console.log("headers");
  //   console.log(req.headers);
  //   console.log("body");
  //   console.log(req.body);
  let output = [];
  const model = await cocoSsd.load();
  for (const img of req.files) {
    //console.log(img);
    var params = {
      Bucket: "test-bucket-n10966790",
      Key: img.key,
      Expires: 3600,
    };
    var s3URL = await s3Client.getSignedUrlPromise("getObject", params);
    //(async () => {
    // Load the model.

    // read image
    const { tfimage } = await readImage(s3URL);
    console.log("hahahahahhahah");
    //Predict
    const predictions = await model.detect(tfimage);
    //tfimage.destroy();
    tf.dispose(tfimage);
    output.push(predictions);
    console.log(predictions);
    //})();
  }

  //   for (let i = 0; i < req.files.length; i++) {
  //     console.log(req.files[i].key);
  //     var params = {
  //       Bucket: "test-bucket-n10966790",
  //       Key: req.files[i].key,
  //       Expires: 3600,
  //     };
  //     var s3URL = await s3Client.getSignedUrlPromise("getObject", params);

  //     (async () => {
  //       // Load the model.
  //       const model = await cocoSsd.load();

  //       // read image
  //       const { tfimage, imageBuf } = await readImage(s3URL);

  //       //Predict
  //       const predictions = await model.detect(tfimage);
  //       console.log(predictions);

  //       // let sourceImg = gm(imageBuf);

  //       // predictions.map((obj) => {
  //       //   let pt = obj.bbox;
  //       //   sourceImg
  //       //     .drawRectangle(
  //       //       pt[0].toFixed(2),
  //       //       pt[1].toFixed(2),
  //       //       pt[2].toFixed(2),
  //       //       pt[3].toFixed(2)
  //       //     )
  //       //     .drawText(
  //       //       (pt[0] + pt[2]) / 2,
  //       //       pt[1],
  //       //       `${obj.class}: ${obj.score.toFixed(4)}`
  //       //     );
  //       // });

  //       // sourceImg.write(`F:\\QUT\\${filename}.jpg`, function (err) {
  //       //   console.log(err);
  //       //   if (!err) console.log("done");
  //       // });

  //       // sourceImg.toBuffer(filetype.split("/")[1], async function (err, buffer) {
  //       //   console.log("here:" + filetype.split("/")[1]);
  //       //   let result = await uploadObject(`result-${filename}`, filetype, buffer);
  //       //   if (result.hasOwnProperty("Key")) {
  //       //     let result_url = getGetUrl(result.Key);
  //       //     res.status(200).send(result_url);
  //       //   }
  //       // if (tt.key !== undefined) {
  //       //   console.log("get url");
  //       // }
  //       //console.log(res);
  //       //console.log(buffer);
  //       //});
  //     })();

  //     // promise.then(
  //     //   function (url) {
  //     //     console.log("The URL is", url);
  //     //   },
  //     //   function (err) {}
  //     // );
  //   }

  res.status(200).json(output);
});

module.exports = router;
