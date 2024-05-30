import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import _ from "lodash";

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect("mongodb://localhost:27017/DE", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("Error connecting to database:", err));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

const facultySchema = new mongoose.Schema({
  facultyName: String,
  facultyNumber: String,
  email: String,
  phoneNumber: String,
});
const Faculty = mongoose.model("Faculty", facultySchema);

const subjectSchema = new mongoose.Schema({
  subjectName: String,
  subjectCode: String,
  semester: String,
  division: String, // Corrected spelling from 'divison' to 'division'
});
const Subject = mongoose.model("Subject", subjectSchema);

const timetableSchema = new mongoose.Schema({
  subjectName: String,
  facultyName: String,
  day: String,
  startTime: String,
  endTime: String,
  semester: String,
  division: String,
});
const Timetable = mongoose.model("Timetable", timetableSchema);

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).send({ message: "All fields are required" });
  }
  User.findOne({ email })
    .then((user) => {
      if (user) {
        res.status(400).send({ message: "User already registered" });
      } else {
        const newUser = new User({ name, email, password });
        newUser
          .save()
          .then(() =>
            res.send({ message: "Successfully Registered, Please login now." })
          );
      }
    })
    .catch((err) => res.status(500).send(err));
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({ message: "Email and password are required" });
  }
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        res.status(400).send({ message: "User not registered" });
      } else if (password === user.password) {
        res.send({ message: "Login Successful", user });
      } else {
        res.status(400).send({ message: "Password didn't match" });
      }
    })
    .catch((err) => res.status(500).send(err));
});

app.post("/addFaculty", (req, res) => {
  const { facultyName, facultyNumber, email, phoneNumber } = req.body;
  if (!facultyName || !facultyNumber || !email || !phoneNumber) {
    return res.status(400).send({ message: "All fields are required" });
  }
  const newFaculty = new Faculty({
    facultyName,
    facultyNumber,
    email,
    phoneNumber,
  });
  newFaculty
    .save()
    .then(() => res.send({ message: "Faculty added successfully" }))
    .catch((err) => res.status(500).send(err));
});

app.get("/faculty", (req, res) => {
  Faculty.find()
    .then((faculty) => res.send(faculty))
    .catch((err) => res.status(500).send(err));
});

app.post("/addSubject", (req, res) => {
  const { subjectName, subjectCode, semester, division } = req.body;
  console.log("Received request to add subject:", req.body);

  if (!subjectName || !subjectCode || !semester || !division) {
    console.log("Missing required fields");
    return res.status(400).send({ message: "All fields are required" });
  }

  const newSubject = new Subject({
    subjectName,
    subjectCode,
    semester,
    division,
  });

  newSubject
    .save()
    .then(() => res.send({ message: "Subject added successfully" }))
    .catch((err) => {
      console.error("Error adding subject:", err);
      res.status(500).send(err);
    });
});

app.get("/subject", (req, res) => {
  Subject.find()
    .then((subject) => res.send(subject))
    .catch((err) => res.status(500).send(err));
});

app.post("/generateTimetable", async (req, res) => {
  const { semester, division } = req.body;
  if (!semester || !division) {
    return res
      .status(400)
      .send({ message: "Semester and division are required" });
  }

  try {
    const existingTimetable = await Timetable.findOne({ semester, division });
    if (existingTimetable) {
      return res.status(400).send({
        message: "Timetable already generated for this semester and division",
      });
    }

    const subjects = await Subject.find({ semester, division });
    const faculties = await Faculty.find();
    if (!subjects.length || !faculties.length) {
      return res
        .status(400)
        .send({ message: "Insufficient subjects or faculties available" });
    }

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = [
      "09:00-10:00",
      "10:00-11:00",
      "11:00-12:00",
      "13:00-14:00",
      "14:00-15:00",
      "15:00-16:00",
    ];

    let timetable = [];
    let subjectIndex = 0;
    let facultyIndex = 0;

    for (const day of days) {
      for (const slot of timeSlots) {
        if (subjectIndex >= subjects.length) subjectIndex = 0;
        if (facultyIndex >= faculties.length) facultyIndex = 0;

        const subject = subjects[subjectIndex++];
        const faculty = faculties[facultyIndex++];

        const isFacultyAvailable = await Timetable.findOne({
          facultyName: faculty.facultyName,
          day: day,
          startTime: slot.split("-")[0],
          endTime: slot.split("-")[1],
        });

        if (isFacultyAvailable) {
          facultyIndex--; // Retry with the next faculty
        } else {
          timetable.push({
            subjectName: subject.subjectName,
            facultyName: faculty.facultyName,
            day: day,
            startTime: slot.split("-")[0],
            endTime: slot.split("-")[1],
            semester: semester,
            division: division,
          });
        }
      }
    }

    await Timetable.insertMany(timetable);
    res.send({ message: "Timetable generated successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/timetable", (req, res) => {
  Timetable.find()
    .then((timetable) => res.send(timetable))
    .catch((err) => res.status(500).send(err));
});

app.listen(9003, () => console.log("Server started at port 9003"));
