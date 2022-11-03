const tf = require("@tensorflow/tfjs-node");
const cocoSsd = require("@tensorflow-models/coco-ssd");
//const image = require("get-image-data");
const { get, getSync } = require("@andreekeberg/imagedata");
const fs = require("fs");
var path = require("path");

//const classes = ['rock', 'paper', 'scissors'];

exports.makePredictions = async (req, res, next) => {
  const imagePath = `./images/${req && req["filename"]}`;
  try {
    const loadModel = async (img) => {
      const output = {};
      // laod model
      console.log("Loading.......");
      const model = await cocoSsd.load();
      // classify
      // output.predictions = await model.predict(img).data();
      let predictions = await model.detect(img);
      //predictions = Array.from(predictions);
      output.predictions = predictions;
      res.statusCode = 200;
      res.json(output);
    };
    get(imagePath, async (err, imageData) => {
      try {
        const image = fs.readFileSync(imagePath);
        let tensor = tf.node.decodeImage(image);
        await loadModel(tensor);
        // delete image file
        fs.unlinkSync(imagePath, (error) => {
          if (error) {
            console.error(error);
          }
        });
      } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
      }
    });
  } catch (error) {
    console.log(error);
  }
};
