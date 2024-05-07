import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cors());

// Load Faculty model
import Faculty from "../modal/Addfac.js";

// POST route to add a new faculty member
router.post("/add", (req, res) => {
  const { fcname, fcnumber, fcemail, fcphone } = req.body;
  const newFaculty = new Faculty({
    fcname,
    fcnumber,
    fcemail,
    fcphone,
  });

  newFaculty
    .save()
    .then((faculty) => {
      res.status(200).json({ message: "Faculty added successfully", faculty });
    })
    .catch((err) => {
      res.status(500).json({ error: "Failed to add faculty", details: err });
    });
});

// GET route to retrieve all faculty members
router.get("/all", (req, res) => {
  Faculty.find()
    .then((faculty) => {
      res.status(200).json(faculty);
    })
    .catch((err) => {
      res.status(500).json({ error: "Failed to fetch faculty", details: err });
    });
});

export default router;
