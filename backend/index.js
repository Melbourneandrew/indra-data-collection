const mqtt = require("mqtt");
const fs = require("fs");
const app = require("express")();
var bodyParser = require("body-parser");
var cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/.env" });

console.log(process.env.MQTT_BROKER_URL)
var options = {
  host: process.env.MQTT_BROKER_URL,
  port: 8883,
  protocol: "mqtts",
  username: process.env.MQTT_BROKER_UNAME,
  password: process.env.MQTT_BROKER_PWORD,
};
const client = mqtt.connect(options);
const topicName = "indra";
client.on("error", function (err) {
  console.log("error");
  console.log(err);
});
client.on("connect", () => console.log("mqtt connected"));

app.use(bodyParser.json());
app.use(cors());
app.get("/record-data", async (req, res) => {
  try {
    const groundTruth = req.query.gt;
    const date = new Date();
    const fileName = `${groundTruth}${date.getHours()}:${date.getMinutes()}.csv`;
    const filePath = path.join(__dirname, `data/${fileName}`);
    console.log("Recording data to " + filePath);

    client.subscribe(topicName, function (err) {
      if (err) return console.log(err);
      console.log("Subscribed to topic: " + topicName);
    });
    client.on("message", function (topic, message) {
      // console.log("Message recieved!");
      const msgJson = JSON.parse(message.toString());

      var dataRecord = "";
      for (let i = 1; i < msgJson.length; i++) {
        let packet = msgJson[i];

        if (packet["3-axisData"] === undefined) continue;
        let x = hexToDecimal(
          packet["3-axisData"].substring(0, 4)
        );
        let y = hexToDecimal(
          packet["3-axisData"].substring(5, 9)
        );
        let z = hexToDecimal(
          packet["3-axisData"].substring(10, 14)
        );
        let rssi = packet.RSSI;

        // let packetData = `${x},${y},${z},${rssi}\n`
        // console.log(packetData);
        dataRecord += `${x},${y},${z},${rssi}\n`;
      }
      fs.appendFileSync(filePath, dataRecord, { flag: "a+" });
    });

    return res.status(200).json({ m: "success" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ e: error });
  }
});

app.get("/stop-recording", async (req, res) => {
  console.log("Stoping data recording");
  try {
    client.unsubscribe(topicName);
    return res.status(200).json({ m: "success" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ e: error });
  }
});

process.on("exit", () => {
  client.end();
});

var hexToDecimal = (hex) => parseInt(hex, 16);

const port = 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
