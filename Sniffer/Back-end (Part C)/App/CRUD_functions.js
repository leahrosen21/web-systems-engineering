import sql from "./db.js";

// for populating data that is aligned with the database (dropdown menus)
const getLocations = function(req, res) {
    sql.query("SELECT city FROM locations", (err, result) => {
        if (err) {
            console.log("Error retrieving locations:", err);
            res.status(500).send("Error retrieving locations");
            return;
        } else {
            console.log("Successfully retrieved locations:", result);
            res.json(result);
            return;
        }
    })};


const getBreeds = function(req, res) {
    sql.query("SELECT name FROM breeds", (err, result) => {
        if (err) {
            console.log("Error retrieving breeds:", err);
            res.status(500).send("Error retrieving breeds");
            return;
        } else {
            console.log("Successfully retrieved breeds:", result);
            res.json(result);
            return;
        }
    })};


const getSizes = function(req, res) {
    sql.query("SELECT name FROM sizes ORDER BY CASE WHEN name = 'Any' THEN 0 ELSE 1 END, name", (err, result) => {
        if (err) {
            console.log("Error retrieving sizes:", err);
            res.status(500).send("Error retrieving sizes");
            return;
        } else {
            console.log("Successfully retrieved sizes:", result);
            res.json(result);
            return;
        }
    })};

const getPersonalities = function(req, res) {
    sql.query("SELECT name FROM personalities ORDER BY CASE WHEN name = 'Any' THEN 0 ELSE 1 END, name", (err, result) => {
        if (err) {
            console.log("Error retrieving personalities:", err);
            res.status(500).send("Error retrieving personalities");
            return;
        } else {
            console.log("Successfully retrieved personalities:", result);
            res.json(result);
            return;
        }
    })};

const getEnergyLevels = function(req, res) {
    sql.query("SELECT name FROM energy_levels", (err, result) => {
        if (err) {
            console.log("Error retrieving energy levels:", err);
            res.status(500).send("Error retrieving energy levels");
            return;
        } else {
            console.log("Successfully retrieved energy levels:", result);
            res.json(result);
            return;
        }
    })};

const getPlayStyles = function(req, res) {
    sql.query("SELECT name FROM play_styles", (err, result) => {
        if (err) {
            console.log("Error retrieving play styles:", err);
            res.status(500).send("Error retrieving play styles");
            return;
        } else {
            console.log("Successfully retrieved play styles:", result);
            res.json(result);
            return;
        }
    })};

const getCompatTypes = function(req, res) {
    sql.query("SELECT name FROM compatibility_types", (err, result) => {
        if (err) {
            console.log("Error retrieving compat types:", err);
            res.status(500).send("Error retrieving compat types");
            return;
        } else {
            console.log("Successfully retrieved compat types:", result);
            res.json(result);
            return;
        }
    })};

const getGenders = function(req, res) {
    sql.query("SELECT name FROM genders", (err, result) => {
        if (err) {
            console.log("Error retrieving genders:", err);
            res.status(500).send("Error retrieving genders");
            return;
        } else {
            console.log("Successfully retrieved genders:", result);
            res.json(result);
            return;
        }
    })};

const getInteractionTypes = function(req, res) {
    sql.query("SELECT name FROM interaction_types ORDER BY CASE WHEN name = 'Any' THEN 0 ELSE 1 END, name", (err, result) => {
        if (err) {
            console.log("Error retrieving interaction types:", err);
            res.status(500).send("Error retrieving interaction types");
            return;
        } else {
            console.log("Successfully retrieved interaction types:", result);
            res.json(result);
            return;
        }
    })};

const getRecommendationCategories = function(req, res) {
    sql.query("SELECT name FROM recommendation_categories", (err, result) => {
        if (err) {
            console.log("Error retrieving recommendation categories:", err);
            res.status(500).send("Error retrieving recommendation categories");
            return;
        } else {
            console.log("Successfully retrieved recommendation categories:", result);
            res.json(result);
            return;
        }
    })};


// creates the user, then the dog, then the preferences (in that order, since dog/preferences need the user_id)
const createUserWithDogAndPreferences = function(req, res) {
    // validating request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    const photoPath = req.file ? "../images/" + req.file.filename : null;

    // user (dog owner) entry
    const newUser = {
        "username": req.body.username,
        "email": req.body.email,
        "password": req.body.password,
        "name": req.body.name,
        "age": req.body.age,
        "gender_id": req.body.gender,
        "location_id": req.body.location,
        "phone": req.body.phone,
        "about_owner": req.body["about-owner"]
    };

    // user (dog owner) first
    sql.query("INSERT INTO users SET ?", newUser, (err, userResult) => {
        if (err) {
            console.log("Error creating user:", err);
            res.status(400).send("Error in creating new user: " + err);
            return;
        }

        const newUserId = userResult.insertId; // extracting user id for dog entry

        // dog entry
        const newDog = {
            "user_id": newUserId, 
            "name": req.body["dog-name"],
            "photo": photoPath,
            "age": req.body["dog-age"],
            "breed_id": req.body["dog-breed"],
            "size_id": req.body["dog-size"],
            "gender_id": req.body["dog-gender"],
            "energy_level_id": req.body["dog-energy"],
            "personality_id": req.body["dog-personality"],
            "compatibility_id": req.body["dog-compat"],
            "vaccinated": req.body["dog-vaccinated"] === "Yes",
            "play_style_id": req.body["dog-play"],
            "about_dog": req.body["dog-about"]
        };

        // insert dog using user id
        sql.query("INSERT INTO dogs SET ?", newDog, (err) => {
            if (err) {
                console.log("Error creating dog:", err);
                res.status(400).send("Error in creating dog: " + err);
                return;
            }

            // dog preferences entry
            const newPreferences = {
                "user_id": newUserId, 
                "size_id": req.body["pref-size"],
                "personality_id": req.body["pref-personality"],
                "interaction_type_id": req.body["pref-interaction"]
            };

            // inserting preferences
            sql.query("INSERT INTO preferences SET ?", newPreferences, (err) => {
                if (err) {
                    console.log("Error creating preferences:", err);
                    res.status(400).send("Error in creating preferences: " + err);
                    return;
                }

                console.log("Signup complete for user_id:", newUserId);
                res.send("New user, dog, and preferences created successfully!")
            });
        });
    });
};


export default {
                    getLocations,
                    getBreeds,
                    getSizes,
                    getPersonalities,
                    getPlayStyles,
                    getCompatTypes,
                    getEnergyLevels,
                    getRecommendationCategories,
                    getInteractionTypes,
                    getGenders,
                    createUserWithDogAndPreferences
                }
