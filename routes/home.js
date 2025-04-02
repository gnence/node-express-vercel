const express = require("express");
const crypto = require("crypto");
const { SHA256 } = require("crypto-js");
const router = express.Router();
const ethers = require("ethers");

const EIP_712_ORDER_TYPE = {
  Order: [
    { name: "maker", type: "address" },
    { name: "taker", type: "address" },
    { name: "tokenId", type: "uint256" },
    { name: "price", type: "uint256" },
    { name: "expiry", type: "uint256" }
  ]
};

const encrypt = (key, data) => {
  const dataBuffer = Buffer.from(data, "utf8");
  const encryptedData = crypto.privateEncrypt(
    { key: key, padding: crypto.constants.RSA_PKCS1_PADDING },
    dataBuffer
  );
  return encryptedData.toString("base64");
};

const base64decode = (base64) => {
  const buff = Buffer.from(base64, "base64");
  return buff.toString("ascii");
};

const signEncode = (data, privateKey) => {
  const dataBuffer = Buffer.from(data);
  const sign = crypto.sign("SHA256", dataBuffer, privateKey);
  return sign.toString("base64");
};

const convertObjToUnit8Array = (obj) => {
   const jsonString = JSON.stringify(obj);
   const buffer = Buffer.from(jsonString, 'utf8');
   return new Uint8Array(buffer);
}

router.get("/", async (req, res, next) => {
  return res.status(200).json({
    title: "Express Testing",
    message: "The app is working properly!",
  });
});

router.post("/auth", async (req, res, next) => {
  console.log("auth path");
  console.log(req.headers);
  console.log(req.body);
  return res.status(200).json({
    active: true,
    scope: "read write",
    client_id: "test",
    username: "test-user",
    exp: Math.floor(Date.now() / 1000) + 60,
  });
});

router.get("/auth", async (req, res, next) => {
  console.log(req.headers);
  return res.status(200).json({
    active: true,
    scope: "read write",
    client_id: "test",
    username: "test-user",
    exp: 1661967434,
  });
});

router.post("/encrypt/account", async (req, res, next) => {
  console.log(req.headers);
  console.log(`req body : ${JSON.stringify(req.body)}`);
  const payload = req.body.payload;
  const privateKey = req.body.privateKey;
  try {
    const payloadEncrypted = encrypt(
      base64decode(privateKey),
      JSON.stringify(payload)
    );
    const sign = signEncode(payloadEncrypted, base64decode(privateKey));
    return res.status(200).json({
      payload: payloadEncrypted,
      signData: sign,
    });
  } catch (e) {
    return res.status(500).json({
      error: e.message,
    });
  }
});

router.post("/encrypt/sign", async (req, res, next) => {
  console.log(req.headers);
  console.log(`req body : ${JSON.stringify(req.body)}`);
  const payload = req.body.payload;
  const payloadHash = SHA256(JSON.stringify(payload));
  const privateKey = req.body.privateKey;
  try {
    const payloadEncrypted = encrypt(
      base64decode(privateKey),
      payloadHash.toString()
    );
    const sign = signEncode(payloadEncrypted, base64decode(privateKey));
    return res.status(200).json({
      hash: payloadEncrypted,
      signData: sign,
      payload: payload,
    });
  } catch (e) {
    return res.status(500).json({
      error: e.message,
    });
  }
});

router.post("/sign/tnx", async (req, res, next) => {
  console.log(req.headers);
  console.log(`req body : ${JSON.stringify(req.body)}`);
  const { txPayload, key } = req.body;
  try {
    const wallet = new ethers.Wallet(key);
    const signedTx = await wallet.signTransaction(txPayload);
    return res.status(200).json({
      raw: signedTx,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: e.message,
    });
  }
});

router.post("/sign/message", async (req, res, next) => {
  console.log(req.headers);
  console.log(`req body : ${JSON.stringify(req.body)}`);
  const { payload, key } = req.body;
  try {
    const wallet = new ethers.Wallet(key);
    const signature = await wallet.signMessage(convertObjToUnit8Array(payload));
    return res.status(200).json({
      signature,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: e.message,
    });
  }
});

router.post("/sign/seaport-order", async (req, res, next) => {
  console.log(req.headers);
  console.log(`req body : ${JSON.stringify(req.body)}`);
  const { orderComponents, domainData, key } = req.body;
  try {
    const wallet = new ethers.Wallet(key);
    let signature = await wallet.signTypedData(
      domainData,
      EIP_712_ORDER_TYPE,
      orderComponents,
    );
    // Use EIP-2098 compact signatures to save gas.
    if (signature.length === 132) {
      signature = ethers.Signature.from(signature).compactSerialized;
    }
    return res.status(200).json({
      signature,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: e.message,
    });
  }
});

router.get("/info", async (req, res, next) => {
  console.log("info path");
  console.log(req.headers);
  return res.status(200).json({
    message: "this is test getting info.",
  });
});

module.exports = router;