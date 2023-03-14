import express from "express";
const router = express.Router();


router.route("/").get(async (req, res) => {
  res.status(200).send("Farkle api -- working");
})

export default router;