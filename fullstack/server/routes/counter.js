var express = require("express");
var router = express.Router();
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: "ASIA5DYSEEJ4WYYACP7P",
  secretAccessKey: "RNgI0kBGtexQyUDuecSVXDPVKblY2cnH33wMRYFs",
  sessionToken: "IQoJb3JpZ2luX2VjEOr//////////wEaDmFwLXNvdXRoZWFzdC0yIkcwRQIhAOAkd4/C3Vas3QI8cDG9yjWpJ906v4IAJipH4rvBDqjXAiAR3x8LzXrzvniIrS3RWHvvas/Fk0aHH44ze5tLAkNm/yqvAwhzEAIaDDkwMTQ0NDI4MDk1MyIMms8O2RaqVxSqlH0SKowDBY/L58prKt5NaJlo0ZEE7GKXYqcbFbeXg/8REN7fY+pc+E4+GSQRW7ekcaeo75kDHiNWbaskydLjFGgibeEHYKYy4PEEtklwZaXckSVO3AkVWbUsJdjT/WyFuM5z1x7Jk9SgBw+LSF9uKGNiHlKtb3dvSclI7hkqF3+S5oz38FXfR/x6HxxtIP3SxF/lOGcVIw7juDBQ8wKu+7TlNT2VdhQiqXWW3+lLcljYVGM5xSwZ9A+w0BK0IGEkst8plNjfPwbwcRvyyocwmZ+u+7EtgmFJ6VU9Rj8PJYdfk6yC1+1eJZNzbT+EBfOFssZ5iqEHSvtEa1sFOL3hZLYmma62HksD8d6x0y+hd7KNFc4vL1Ow+GP4GdLFyFyPSAvcyVqYKbKAQU3XMHYWug+P4UxAlV2kdAiaYAJE75UJY/zCFysmIeW8FVSrrfvIsc1OnOFxofi5MbEtDuK5AIQwPewbb/t4VaPHVe3wLGC5GNjMZs/9xDAhA2ZS3oEPe9eg5i7uYfNFYKXK3I/JBeN7MLaGwpgGOqYB/5p0pApwwyTcBqY5Fzf7xRnb2nQ86bODSS5MGDkLNcb41RniQPvra8XVUzAJEp1W7vVr7xeLOqA0mV8snYCvksHxEpTbGe0M9eSH3BHZTaIsORk3kY17vFnrbBnZQrQNpcTL/oFD3yc5NJgQaOPuvJJIHope45JXcJXvHFJKFwaZmuwuEacc920mtt3s73KN9h1KTkXocG/lDEcdUv2lQXU5luFxzg==",
  region: "ap-southeast-2",
});

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
