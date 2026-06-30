import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import bodyParser from "body-parser";
import multer from "multer"; // for saving the dog image as link
import CRUD_functions from "./CRUD_functions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // current directory (App dir)
const __parentdir = path.join(__dirname, ".."); // parent directory (Back-end dir)
const __projectdir = path.join(__dirname, "..", ".."); // project directory (Sniffer dir)
const __frontendir = path.join(__projectdir, "Front-end (Part B)"); // frontend directory (Front-end dir)
const __pagesdir = path.join(__frontendir, "pages"); // pages directory (Front-end dir)

console.log("__filename:", __filename);
console.log("__dirname:", __dirname);
console.log("__parentdir:", __parentdir);
console.log("__projectdir:", __projectdir);
console.log("__frontendir:", __frontendir);
console.log("__pagesdir:", __pagesdir);

const app = express(); // the server
const port = 8080;


// to access the static files from the Front-end (Part B) directory
app.use(express.static(__frontendir));

app.use(bodyParser.urlencoded({ extended: true })); // for parsing data from URL
app.use(bodyParser.json()); // for parsing data from JSON



// page that appears when customer enters home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__pagesdir, "home.html"));
});


app.get("/locations", CRUD_functions.getLocations)
app.get("/breeds", CRUD_functions.getBreeds)
app.get("/sizes", CRUD_functions.getSizes)
app.get("/personalities", CRUD_functions.getPersonalities)
app.get("/energy_levels", CRUD_functions.getEnergyLevels)
app.get("/play_styles", CRUD_functions.getPlayStyles)
app.get("/compatibility_types", CRUD_functions.getCompatTypes)
app.get("/genders", CRUD_functions.getGenders)
app.get("/interaction_types", CRUD_functions.getInteractionTypes)


// multer middleware - saves uploaded dog photos to Front-end (Part B)/images/
export const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__frontendir, "images"));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname); // e.g. 1234567890-buddy.jpg
    }
  }),
  fileFilter: function (req, file, cb) {
    cb(null, file.mimetype.startsWith("image/")); // only allow images
  }
});

app.post("/signup", upload.single("dog-photos"), CRUD_functions.createUserWithDogAndPreferences);







app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



