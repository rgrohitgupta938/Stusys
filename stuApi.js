let express = require("express");
const {
  customers,
  students,
  classes,
  faculties,
  courses,
} = require("./nexttask");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
  );
  next();
});
const port = process.env.PORT || 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}`));
app.post("/login", function (req, res) {
  let email = req.body.email;
  let password = req.body.password;
  let cust = customers.find(
    (cu) => cu.email === email && cu.password === password
  );
  if (cust !== []) {
    console.log(cust);
    const log = {
      name: cust.name,
      email: cust.email,
      role: cust.role,
    };
    res.send(log);
  } else {
    res.status(500).send("Invalid Email/Password");
  }
}); //// for login
app.post("/register", function (req, res) {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  let role = req.body.role;
  let custId = customers.length + 1;
  let newCust = { custId, name, password, email, role };
  customers.push(newCust);
  console.log(customers);
  let log = {
    name: name,
    role: role,
    email: email,
  };
  if (role === "student") {
    let newSt = {
      id: students.length + 1,
      name: name,
      dob: "",
      gender: "",
      about: "",
      courses: [],
    };
    console.log(newSt);
    students.unshift(newSt);
  }
  if (role === "faculty") {
    let newSt = {
      id: faculties.length + 1,
      name: name,
      courses: [],
    };
    console.log(newSt);
    faculties.unshift(newSt);
  }
  console.log(log);
  res.send(log);
}); ///// admin
app.get("/getStudentNames", function (req, res) {
  let names = students.map((st) => {
    return st.name;
  });
  console.log(names);
  res.send(names);
}); /// admin
app.get("/getFacultyNames", function (req, res) {
  let names = faculties.map((st) => {
    return st.name;
  });
  console.log(names);
  res.send(names);
});
app.get("/getCourses", function (req, res) {
  console.log(courses);
  res.send(courses);
}); /// admin
app.put("/putCourse", function (req, res) {
  let courseId = req.body.courseId;
  let name = req.body.name;
  let code = req.body.code;
  let description = req.body.description;
  let fac = req.body.faculty;
  let stu = req.body.students;
  let st = courses.findIndex((h) => h.courseId === +courseId);
  console.log(stu);
  if (st >= 0) {
    let newCourse = {
      courseId,
      name,
      code,
      description,
      faculty: fac,
      students: stu,
    };
    courses[st] = newCourse;

    // Update courses array in students
    students.forEach((student) => {
      if (stu.includes(student.name) && !student.courses.includes(name)) {
        student.courses.push(name); // Add course if not already present
      } else if (
        !stu.includes(student.name) &&
        student.courses.includes(name)
      ) {
        const courseIndex = student.courses.indexOf(name);
        student.courses.splice(courseIndex, 1); // Remove course if present but not in stu
      }
    });
    // Update courses array in faculties
    faculties.forEach((faculty) => {
      if (fac.includes(faculty.name) && !faculty.courses.includes(name)) {
        faculty.courses.push(name); // Add course if not already present
      } else if (fac.length === 0 && faculty.courses.includes(name)) {
        const courseIndex = faculty.courses.indexOf(name);
        faculty.courses.splice(courseIndex, 1); // Remove course if present but not in stu
      }
    });
    console.log(newCourse);
    res.send(newCourse);
  } else {
    res.status(404).send("Course Not Found");
  }
});
/// admin
app.get("/getStudents", function (req, res) {
  let page = +req.query.page;
  let course = req.query.course;
  course = course ? course.split(",") : [];
  console.log(course);
  console.log(page);

  let students1 =
    course.length !== 0
      ? students.filter((st) => course.find((tr) => st.courses.includes(tr)))
      : students;
  let studentsPerPage = 3;
  let startIndex = (page - 1) * studentsPerPage;
  let endIndex = startIndex + studentsPerPage;
  let studentsArr = students1.slice(startIndex, endIndex);
  console.log(studentsArr, page);
  let log = {
    page: page,
    items: studentsArr,
    totalItems: studentsArr.length,
    totalNum: students1.length,
  };
  res.send(log);
}); //// admin
app.get("/getFaculties", function (req, res) {
  let page = +req.query.page;
  let course = req.query.course;
  course = course ? course.split(",") : [];
  console.log(course);
  console.log(page);
  let faculties1 =
    course.length !== 0
      ? faculties.filter((st) => course.find((tr) => st.courses.includes(tr)))
      : faculties;

  let facultyPerPage = 3;
  let startIndex = (page - 1) * facultyPerPage;
  let endIndex = startIndex + facultyPerPage;
  let facultyArr = faculties1.slice(startIndex, endIndex);

  let log = {
    page: page,
    items: facultyArr,
    totalItems: facultyArr.length,
    totalNum: faculties1.length,
  };
  res.send(log);
}); ////admin
app.post("/postStudentDetails", function (req, res) {
  let name = req.body.name;
  let dob = req.body.dob;
  let gender = req.body.gender;
  let about = req.body.about;
  let substitue = courses.find((cr) => cr.students.includes(name))
    ? courses.find((cr) => cr.students.includes(name)).name
    : [];
  console.log(substitue);
  let id = students.length + 1;
  let newStu = {
    id: id,
    name: name,
    dob: dob,
    gender: gender,
    about: about,
    courses: substitue,
  };
  students.unshift(newStu);
  console.log(newStu);
  res.send(newStu);
}); /// student
app.get("/getStudentDetails/:name", function (req, res) {
  let name = req.params.name;
  let student = students.find((st) => st.name === name);
  if (student !== undefined) {
    res.send(student);
  } else {
    res.status(500).send("Student Details are not present");
  }
}); /// student
app.get("/getStudentCourse/:name", function (req, res) {
  let name = req.params.name;
  let student = students.find((st) => st.name === name);
  console.log(student, "2");
  if (!student) {
    res.status(500).send("Student Not Found");
  } else {
    let courseDeatils = courses.filter((st1) =>
      student.courses.includes(st1.name)
    );
    console.log(courseDeatils, "2");
    res.send(courseDeatils);
  }
}); /// student
app.get("/getStudentClass/:name", function (req, res) {
  let name = req.params.name;
  let student = students.find((st) => st.name === name);
  console.log(student, "2");
  if (!student) {
    res.status(500).send("Student Not Found");
  } else {
    let classesDetails = classes.filter((cl) =>
      student.courses.includes(cl.course)
    );
    console.log(classesDetails, "3");
    res.send(classesDetails);
  }
}); /// student
app.get("/getFacultyCourse/:name", function (req, res) {
  let name = req.params.name;
  let faculty = faculties.find((f) => f.name === name);
  console.log(faculty);
  if (faculty) {
    let facultyCourse = courses.filter((cr) =>
      faculty.courses.includes(cr.name)
    );
    let array = facultyCourse.map((ar) => ({
      courseId: ar.courseId,
      name: ar.name,
      code: ar.code,
      description: ar.description,
    }));
    console.log(facultyCourse);
    res.send(array);
  } else {
    res.status(500).send("No course for faculty Found");
  }
}); /// faculty
app.get("/getFacultyClass/:name", function (req, res) {
  let name = req.params.name;
  let faculty = faculties.find((f) => f.name === name);
  console.log(faculty);
  if (faculty) {
    let FacultyClass = classes.filter((cr) => faculty.name === cr.facultyName);
    let array = FacultyClass.map((ar) => ({
      classId: ar.classId,
      topic: ar.topic,
      time: ar.time,
      endTime: ar.endTime,
      course: ar.course,
    }));
    console.log(FacultyClass);
    res.send(array);
  } else {
    res.status(500).send("No course for faculty Found");
  }
}); /// faculty
app.post("/postClass", function (req, res) {
  let course = req.body.course;
  let time = req.body.time;
  let endTime = req.body.endTime;
  let topic = req.body.topic;
  let facultyName = req.body.facultyName;
  let classId = classes.length + 1;
  let newClass = { classId, course, time, endTime, topic, facultyName };
  classes.push(newClass);
  console.log(newClass, classes);
  res.send(newClass);
}); /// faculty
app.put("/postClass/:classId", function (req, res) {
  let course = req.body.course;
  let time = req.body.time;
  let endTime = req.body.endTime;
  let topic = req.body.topic;
  let facultyName = req.body.facultyName;
  let classId = +req.params.classId;
  console.log(classId);
  let st = classes.findIndex((r) => r.classId === classId);
  if (st >= 0) {
    let newClass = { classId, course, time, endTime, topic, facultyName };
    classes[st] = newClass;
    console.log(newClass, classes);
    res.send(newClass);
  } else {
    res.status(404).send("Class not found");
  }
}); /// faculty
