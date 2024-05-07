import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose
  .connect("mongodb://localhost:27017/DE", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });

// Schema
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

const SubjectSchema = new mongoose.Schema({
  subjectName: String,
  subjectcode: String,
});

const Subject = mongoose.model("Subject", SubjectSchema);

//year and semester schema
const semesterSchema = new mongoose.Schema({
  semester: String,
  academicYear: String,
});
const Semester = mongoose.model("Semester", semesterSchema);
// Routes
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        res.send({ message: "User already registered" });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });
        return newUser.save();
      }
    })
    .then(() => {
      res.send({ message: "Successfully Registered, Please login now." });
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.send({ message: "User not registered" });
      }
      if (password === user.password) {
        res.send({ message: "Login Successful", user: user });
      } else {
        res.send({ message: "Password didn't match" });
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post("/addFaculty", (req, res) => {
  const { facultyName, facultyNumber, email, phoneNumber } = req.body;
  const newFaculty = new Faculty({
    facultyName,
    facultyNumber,
    email,
    phoneNumber,
  });
  newFaculty
    .save()
    .then(() => {
      res.send({ message: "Faculty added successfully" });
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});
app.get("/faculty", (req, res) => {
  Faculty.find()
    .then((faculty) => {
      res.send(faculty);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});
app.post("/addsubject", (req, res) => {
  const { subjectName, subjectcode } = req.body;
  const newSubject = new Subject({
    subjectName,
    subjectcode,
  });
  newSubject
    .save()
    .then(() => {
      res.send({ message: "subject added successfully" });
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});
app.get("/subject", (req, res) => {
  Subject.find()
    .then((subject) => {
      res.send(subject);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});
//sem year
app.post("/addsemester", (req, res) => {
  const { semester, academicYear } = req.body;
  const newSemester = new Semester({
    semester,
    academicYear,
  });
  newSemester
    .save()
    .then(() => {
      res.send({ message: "Semester added successfully" });
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});
app.get("/sem", (req, res) => {
  Seme.find()
    .then((semesters) => {
      res.send(semesters);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

const PORT = process.env.PORT || 9002;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
