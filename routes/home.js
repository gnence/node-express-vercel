const express = require("express");
const crypto = require('crypto');
const router = express.Router();

const encrypt = (key, data) => {
  const dataBuffer = Buffer.from(data, 'utf8');
  const encryptedData = crypto.privateEncrypt(
    { key: key, padding: crypto.constants.RSA_PKCS1_PADDING },
    dataBuffer,
  );
  return encryptedData.toString('base64');
}

const base64decode = (base64) => {
  const buff = Buffer.from(base64, 'base64');
  return buff.toString('ascii');
};

const signEncode = async (data, privateKey) => {
  const dataBuffer = Buffer.from(data);
  const sign = await crypto.sign('SHA256', dataBuffer, privateKey);
  return sign.toString('base64');
};

router.get("/", async (req, res, next) => {
  return res.status(200).json({
    title: "Express Testing",
    message: "The app is working properly!",
  });
});

router.post("/auth", async (req, res, next) => {
  console.log(req.headers);
  return res.status(200).json({
    active: true,
    scope: "read write",
    client_id: "test",
    username: "test-user",
    exp: 1661967434
  });
});

router.get("/auth", async (req, res, next) => {
  console.log(req.headers);
  return res.status(200).json({
    active: true,
    scope: "read write",
    client_id: "test",
    username: "test-user",
    exp: 1661967434
  });
});

router.post("/encrypt", async (req, res, next) => {
  console.log(req.headers);
  console.log(`req body : ${JSON.stringify(req.body)}`);
  const payload = req.body.payload;
  const privateKey = req.body.privateKey;
  try {
    const payloadEncrypted = encrypt(
      base64decode(privateKey),
      JSON.stringify(payload),
    );
    const sign = await signEncode(payloadEncrypted, base64decode(privateKey));
    return res.status(200).json({
      payload: payloadEncrypted,
      signData: sign,
    });
  } catch (e) {
    return res.status(500).json({
      error: e.message
    });
  }
});

module.exports = router;
