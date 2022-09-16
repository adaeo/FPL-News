var express = require("express");
var router = express.Router();
require("dotenv").config();
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: process.env.AWS_REGION,
});

console.log("\nLoading with ENV variables:")
console.log("\nACCESS_KEY_ID: " + process.env.AWS_ACCESS_KEY_ID);
console.log("\nSECRET_ACCESS_KEY: " + process.env.AWS_SECRET_ACCESS_KEY);
console.log("\nSESSION_TOKEN: " + process.env.AWS_SESSION_TOKEN);
console.log("\nREGION: " + process.env.AWS_REGION + "\n");
console.log("\nNEWS_API_KEY: " + process.env.NEWS_API_KEY + "\n");

// Cloud Services Set-up
// Create unique bucket name
const bucketName = "n10771727-counter-store";
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
(async () => {
  try {
    await s3.createBucket({ Bucket: bucketName }).promise();
    console.log(`Created bucket: ${bucketName}`);
  } catch (err) {
    // We will ignore 409 errors which indicate that the bucket already exists
    if (err.statusCode !== 409) {
      console.log(`Error creating bucket: ${err}`);
    }
  }
})();

router.get("/", async (req, res) => {
  try {
    // Get total visit count
    const s3Key = `mashupCounter`;
    const params = { Bucket: bucketName, Key: s3Key };
    const s3Result = await s3.getObject(params).promise();
    const resultJSON = await JSON.parse(s3Result.Body);
    
    const s3Body = JSON.stringify({counter: resultJSON.counter + 1});
    const objParams = { Bucket: bucketName, Key: s3Key, Body: s3Body };
    await s3.putObject(objParams).promise();

    res.status(200).json({msg: "incremented counter", count: resultJSON.counter + 1});
    return;
  } catch (err) {
    try {
      if (err.statusCode === 404) {
        const s3Key = `mashupCounter`;
        const s3Body = JSON.stringify({counter: 0});
        const objParams = { Bucket: bucketName, Key: s3Key, Body: s3Body };
        await s3.putObject(objParams).promise();
        res.status(200).json({message: "added counter obj"});
        return;
      }
      console.log(err);
      res.status(500).json({ message: err });
      return;
    }
    catch (err) {
      console.log(err);
      res.status(500).json({ message: err });
      return;
    }
  }
});

module.exports = router;
