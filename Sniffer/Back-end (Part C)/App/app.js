import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import bodyParser from "body-parser";
import multer from "multer";
import sql from "./db.js";
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

const app = express();
const port = 8080;

// static files from the Front-end (Part B) directory
app.use(express.static(__frontendir));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// multer — saves uploaded dog photos to Front-end (Part B)/images/
export const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__frontendir, "images"));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    }
  }),
  fileFilter: function (req, file, cb) {
    cb(null, file.mimetype.startsWith("image/"));
  }
});

// checks that X-User-Id header exists and matches 
// a real user in the DB
// attaches req.userId for downstream handlers
const authenticate = function(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    res.status(400).send("Not authenticated.");
    return;
  }
  sql.query("SELECT id FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) {
      res.status(500).send("Authentication error.");
      return;
    }
    if (result.length === 0) {
      res.status(400).send("User not found.");
      return;
    }
    req.userId = result[0].id;
    next();
  });
};

// checks that the logged-in user owns the resource they are trying to access
// must be used after authenticate (depends on req.userId being set)
const authorize = function(req, res, next) {
  if (req.userId !== parseInt(req.params.id)) {
    res.status(400).send("You are not authorized to access this resource.");
    return;
  }
  next();
};

// ===== PUBLIC ROUTES (no auth needed) =====

app.get("/", (req, res) => {
  res.sendFile(path.join(__pagesdir, "home.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__pagesdir, "signup.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__pagesdir, "login.html"));
});

app.get("/reset-password", (req, res) => {
  res.sendFile(path.join(__pagesdir, "reset_password.html"));
});

app.post("/reset-password", CRUD_functions.resetPassword);

// lookup tables for dropdowns
app.get("/locations",         CRUD_functions.getLocations)
app.get("/breeds",            CRUD_functions.getBreeds)
app.get("/sizes",             CRUD_functions.getSizes)
app.get("/personalities",     CRUD_functions.getPersonalities)
app.get("/energy_levels",     CRUD_functions.getEnergyLevels)
app.get("/play_styles",       CRUD_functions.getPlayStyles)
app.get("/compatibility_types", CRUD_functions.getCompatTypes)
app.get("/genders",           CRUD_functions.getGenders)
app.get("/interaction_types",          CRUD_functions.getInteractionTypes)
app.get("/recommendation_categories", CRUD_functions.getRecommendationCategories)

app.get("/check-availability",   CRUD_functions.checkAvailability);
app.get("/availability-slots",                    authenticate, CRUD_functions.getAvailability);
app.get("/availability-slots/user/:targetId",     authenticate, CRUD_functions.getMatchedUserAvailability);
app.post("/availability-slots",                   authenticate, CRUD_functions.addAvailability);
app.patch("/availability-slots/:id",              authenticate, CRUD_functions.editAvailability);
app.delete("/availability-slots/:id",             authenticate, CRUD_functions.deleteAvailability);
app.post("/signup", upload.single("dog-photos"), CRUD_functions.createUserWithDogAndPreferences);
app.post("/login",  CRUD_functions.login);

// clears the localStorage session on the client and redirects to login
app.get("/logout", (req, res) => {
  res.send(
    '<!DOCTYPE html><html><body><script>' +
    'localStorage.removeItem("sniffer_session");' +
    'window.location.href="/login";' +
    '<\/script></body></html>'
  );
});

// ===== PROTECTED ROUTES (require authenticate + authorize) =====

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__pagesdir, "profile.html"));
});

app.get("/recommendations", (req, res) => {
  res.sendFile(path.join(__pagesdir, "recommendations.html"));
});

app.get("/matches", (req, res) => {
  res.sendFile(path.join(__pagesdir, "matches.html"));
});

app.get("/availability", (req, res) => {
  res.sendFile(path.join(__pagesdir, "availability.html"));
});

app.get("/users/:id",               authenticate, authorize, CRUD_functions.getUser);
app.patch("/users/:id",             authenticate, authorize, CRUD_functions.editUser);
app.patch("/users/:id/pause",       authenticate, authorize, CRUD_functions.pauseAccount);
app.delete("/users/:id/account",    authenticate, authorize, CRUD_functions.deleteAccount);
app.patch("/users/:id/dog",         authenticate, authorize, upload.single("dog-photos"), CRUD_functions.editDog);
app.patch("/users/:id/preferences", authenticate, authorize, CRUD_functions.editPreferences);

// matching
app.post("/likes",          authenticate, CRUD_functions.likeOrSkip);
app.get("/matches/:id",     authenticate, authorize, CRUD_functions.getMatches);
app.delete("/matches/:id",  authenticate, CRUD_functions.deleteMatch);

// profiles (discover)
app.get("/profiles",        authenticate, CRUD_functions.getProfiles);

// recommendations
app.get("/recommendations-data",        authenticate, CRUD_functions.getRecommendations);
app.post("/recommendations-data",       authenticate, upload.single("rec-image"), CRUD_functions.addRecommendation);
app.patch("/recommendations-data/:id",  authenticate, upload.single("rec-image"), CRUD_functions.editRecommendation);
app.delete("/recommendations-data/:id", authenticate, CRUD_functions.deleteRecommendation);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
