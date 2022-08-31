const express = require("express");
const router = express.Router();

router.get("/", async (req, res, next) => {
  return res.status(200).json({
    title: "Express Testing",
    message: "The app is working properly!",
  });
});

router.post("/auth", async (req, res, next) => {
  return res.status(200).json({
    active: true,
    scope: "read write",
    client_id: "test",
    username: "test-user",
    exp: 1661967434
  });
});

module.exports = router;
