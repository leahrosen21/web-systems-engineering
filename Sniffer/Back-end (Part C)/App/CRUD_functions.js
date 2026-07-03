import sql from "./db.js";

// for populating data that is aligned with the database (dropdown menus)
const getLocations = function(req, res) {
    sql.query("SELECT id, city FROM locations", (err, result) => {
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
    sql.query("SELECT id, name FROM breeds", (err, result) => {
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
    sql.query("SELECT id, name FROM sizes ORDER BY CASE WHEN name = 'Any' THEN 0 ELSE 1 END, name", (err, result) => {
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
    sql.query("SELECT id, name FROM personalities ORDER BY CASE WHEN name = 'Any' THEN 0 ELSE 1 END, name", (err, result) => {
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
    sql.query("SELECT id, name FROM energy_levels", (err, result) => {
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
    sql.query("SELECT id, name FROM play_styles", (err, result) => {
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
    sql.query("SELECT id, name FROM compatibility_types", (err, result) => {
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
    sql.query("SELECT id, name FROM genders", (err, result) => {
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
    sql.query("SELECT id, name FROM interaction_types ORDER BY CASE WHEN name = 'Any' THEN 0 ELSE 1 END, name", (err, result) => {
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
    sql.query("SELECT id, name FROM recommendation_categories", (err, result) => {
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

    // check email and username aren't already taken before inserting
    sql.query(
        "SELECT email, username FROM users WHERE email = ? OR username = ?",
        [req.body.email, req.body.username],
        (err, existing) => {
            if (err) { res.redirect('/signup?error=server'); return; }
            if (existing.length > 0) {
                const taken = existing[0];
                if (taken.username === req.body.username) {
                    res.redirect('/signup?error=username');
                } else {
                    res.redirect('/signup?error=email');
                }
                return;
            }
            doInsert();
        }
    );

    function doInsert() {
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
            // ER_DUP_ENTRY means username or email already exists in the DB
            if (err.code === "ER_DUP_ENTRY") {
                if (err.message.includes("username")) {
                    res.redirect('/signup?error=username');
                } else {
                    res.redirect('/signup?error=email');
                }
                return;
            }
            console.log("Error creating user:", err);
            res.redirect('/signup?error=server');
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
                res.redirect('/signup?error=server');
                return;
            }

            const newPreferences = {
                "user_id": newUserId,
                "size_id": req.body["pref-size"],
                "personality_id": req.body["pref-personality"],
                "interaction_type_id": req.body["pref-interaction"],
                "location_id": req.body["pref-location"]
            };

            sql.query("INSERT INTO preferences SET ?", newPreferences, (err) => {
                if (err) {
                    console.log("Error creating preferences:", err);
                    res.redirect('/signup?error=server');
                    return;
                }

                console.log("Signup complete for user_id:", newUserId);
                const sessionJSON = JSON.stringify(JSON.stringify({ user_id: newUserId, username: req.body.username }));
                res.send(
                    '<!DOCTYPE html><html><body><script>' +
                    'localStorage.setItem("sniffer_session",' + sessionJSON + ');' +
                    'window.location.href="/";' +
                    '<\/script></body></html>'
                );
            });
        });
    });
    } // end doInsert
};


// login function to authenticate user credentials
const login = function(req, res) {
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    const { email, password } = req.body;

    // finding user by email first
    sql.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (err) {
            console.log("Error during login:", err);
            res.status(500).send("Error during login: " + err);
            return;
        }

        if (result.length === 0) {
            res.redirect('/login?error=credentials');
            return;
        }

        const user = result[0];

        if (user.password !== password) {
            res.redirect('/login?error=credentials');
            return;
        }

        console.log("Login successful for user_id:", user.id);
        const sessionJSON = JSON.stringify(JSON.stringify({ user_id: user.id, username: user.username }));
        res.send(
            '<!DOCTYPE html><html><body><script>' +
            'localStorage.setItem("sniffer_session",' + sessionJSON + ');' +
            'window.location.href="/";' +
            '<\/script></body></html>'
        );
    });
};

// fetches a user's full profile including display names from all lookup tables
const getUser = function(req, res) {
    const userId = req.params.id;

    sql.query(`
        SELECT u.*,
               gl.name  AS gender_name,
               l.city   AS location_city,
               d.id     AS dog_id,       d.name AS dog_name,  d.age AS dog_age,
               d.breed_id,               b.name AS breed_name,
               d.size_id,                s.name AS size_name,
               d.gender_id AS dog_gender_id,    dg.name AS dog_gender_name,
               d.energy_level_id,        el.name AS energy_name,
               d.personality_id,         pe.name AS personality_name,
               d.compatibility_id,       c.name  AS compat_name,
               d.vaccinated,
               d.play_style_id,          ps.name AS play_name,
               d.about_dog,              d.photo,
               p.id AS pref_id,
               p.size_id AS pref_size_id,               ps2.name AS pref_size_name,
               p.personality_id AS pref_personality_id, pe2.name AS pref_personality_name,
               p.interaction_type_id,                   it.name  AS interaction_name,
               p.location_id AS pref_location_id,       pl.city  AS pref_location_city
        FROM users u
        LEFT JOIN genders           gl  ON gl.id  = u.gender_id
        LEFT JOIN locations         l   ON l.id   = u.location_id
        LEFT JOIN dogs              d   ON d.user_id = u.id
        LEFT JOIN breeds            b   ON b.id   = d.breed_id
        LEFT JOIN sizes             s   ON s.id   = d.size_id
        LEFT JOIN genders           dg  ON dg.id  = d.gender_id
        LEFT JOIN energy_levels     el  ON el.id  = d.energy_level_id
        LEFT JOIN personalities     pe  ON pe.id  = d.personality_id
        LEFT JOIN compatibility_types c ON c.id   = d.compatibility_id
        LEFT JOIN play_styles       ps  ON ps.id  = d.play_style_id
        LEFT JOIN preferences       p   ON p.user_id = u.id
        LEFT JOIN sizes             ps2 ON ps2.id = p.size_id
        LEFT JOIN personalities     pe2 ON pe2.id = p.personality_id
        LEFT JOIN interaction_types it  ON it.id  = p.interaction_type_id
        LEFT JOIN locations         pl  ON pl.id  = p.location_id
        WHERE u.id = ?
    `, [userId], (err, result) => {
        if (err) {
            console.log("Error fetching user:", err);
            res.status(500).send("Error fetching user: " + err);
            return;
        }
        if (result.length === 0) {
            res.status(404).send("User not found.");
            return;
        }
        res.json(result[0]);
    });
};

// updates user profile fields — only sends fields that were actually changed
const editUser = function(req, res) {
    const userId = req.params.id;

    const updatedFields = {};

    if (req.body.username)          updatedFields.username    = req.body.username;
    if (req.body.email)             updatedFields.email       = req.body.email;
    if (req.body.password)          updatedFields.password    = req.body.password;
    if (req.body.name)              updatedFields.name        = req.body.name;
    if (req.body.age)               updatedFields.age         = req.body.age;
    if (req.body.gender)            updatedFields.gender_id   = req.body.gender;
    if (req.body.location)          updatedFields.location_id = req.body.location;
    if (req.body.phone)             updatedFields.phone       = req.body.phone;
    if (req.body["about-owner"])    updatedFields.about_owner = req.body["about-owner"];

    if (Object.keys(updatedFields).length === 0) {
        res.status(400).send("No fields to update.");
        return;
    }

    function doUpdate() {
        sql.query("UPDATE users SET ? WHERE id = ?", [updatedFields, userId], (err) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    if (err.message.includes("username")) {
                        res.status(400).send("Username already taken.");
                    } else {
                        res.status(400).send("Email already registered.");
                    }
                    return;
                }
                res.status(400).send("Error updating profile: " + err);
                return;
            }
            res.send("Profile updated successfully!");
        });
    }

    // if phone is being changed, make sure no other user already has it
    if (updatedFields.phone) {
        sql.query(
            "SELECT id FROM users WHERE phone = ? AND id != ?",
            [updatedFields.phone, userId],
            (err, result) => {
                if (err) { res.status(500).send("Error checking phone: " + err); return; }
                if (result.length > 0) {
                    res.status(400).send("Phone number already in use by another account.");
                    return;
                }
                doUpdate();
            }
        );
    } else {
        doUpdate();
    }
};

// updates dog fields — looks up the dog by user_id (each user has one dog)
const editDog = function(req, res) {
    const userId = req.params.id;

    const updatedFields = {};

    if (req.file)                       updatedFields.photo            = "../images/" + req.file.filename;
    if (req.body["dog-name"])           updatedFields.name             = req.body["dog-name"];
    if (req.body["dog-age"])            updatedFields.age              = req.body["dog-age"];
    if (req.body["dog-breed"])          updatedFields.breed_id         = req.body["dog-breed"];
    if (req.body["dog-size"])           updatedFields.size_id          = req.body["dog-size"];
    if (req.body["dog-gender"])         updatedFields.gender_id        = req.body["dog-gender"];
    if (req.body["dog-energy"])         updatedFields.energy_level_id  = req.body["dog-energy"];
    if (req.body["dog-personality"])    updatedFields.personality_id   = req.body["dog-personality"];
    if (req.body["dog-compat"])         updatedFields.compatibility_id = req.body["dog-compat"];
    if (req.body["dog-vaccinated"])     updatedFields.vaccinated       = req.body["dog-vaccinated"] === "Yes";
    if (req.body["dog-play"])           updatedFields.play_style_id    = req.body["dog-play"];
    if (req.body["dog-about"])          updatedFields.about_dog        = req.body["dog-about"];

    if (Object.keys(updatedFields).length === 0) {
        res.status(400).send("No fields to update.");
        return;
    }

    sql.query("UPDATE dogs SET ? WHERE user_id = ?", [updatedFields, userId], (err) => {
        if (err) {
            res.status(400).send("Error updating dog: " + err);
            return;
        }
        res.send("Dog profile updated successfully!");
    });
};

// updates matching preferences — looks up preferences by user_id
const editPreferences = function(req, res) {
    const userId = req.params.id;

    const updatedFields = {};

    if (req.body["pref-size"])          updatedFields.size_id              = req.body["pref-size"];
    if (req.body["pref-personality"])   updatedFields.personality_id       = req.body["pref-personality"];
    if (req.body["pref-interaction"])   updatedFields.interaction_type_id  = req.body["pref-interaction"];
    if (req.body["pref-location"])      updatedFields.location_id          = req.body["pref-location"];

    if (Object.keys(updatedFields).length === 0) {
        res.status(400).send("No fields to update.");
        return;
    }

    sql.query("UPDATE preferences SET ? WHERE user_id = ?", [updatedFields, userId], (err) => {
        if (err) {
            res.status(400).send("Error updating preferences: " + err);
            return;
        }
        res.send("Preferences updated successfully!");
    });
};




// ===== MATCHING =====

// records a like or skip, then checks if a mutual match exists
const likeOrSkip = function(req, res) {
    const likerId  = req.userId;                 // set by authenticate middleware
    const likedId  = req.body.liked_id;
    const action   = req.body.action;            // 'like' or 'skip'

    if (!likedId || !action) {
        res.status(400).send("liked_id and action are required.");
        return;
    }

    // skips are not stored — only likes are recorded
    if (action !== 'like') {
        res.json({ match: false });
        return;
    }

    sql.query(
        "INSERT INTO likes (liker_id, liked_id) VALUES (?, ?)",
        [likerId, likedId],
        (err) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    res.status(409).send("Already liked this user.");
                    return;
                }
                res.status(500).send("Error recording like: " + err);
                return;
            }

            // check if the other person already liked us back
            sql.query(
                "SELECT id FROM likes WHERE liker_id = ? AND liked_id = ?",
                [likedId, likerId],
                (err, result) => {
                    if (err) {
                        res.status(500).send("Error checking match: " + err);
                        return;
                    }

                    if (result.length === 0) {
                        res.json({ match: false });
                        return;
                    }

                    // mutual like — create a match
                    // store with lower id as user1 to avoid duplicates
                    const user1 = Math.min(likerId, likedId);
                    const user2 = Math.max(likerId, likedId);

                    sql.query(
                        "INSERT IGNORE INTO matches (user1_id, user2_id) VALUES (?, ?)",
                        [user1, user2],
                        (err) => {
                            if (err) {
                                res.status(500).send("Error creating match: " + err);
                                return;
                            }
                            res.json({ match: true });
                        }
                    );
                }
            );
        }
    );
};

// returns all matches for a user, including the other user's profile and dog info
const getMatches = function(req, res) {
    const userId = parseInt(req.params.id);

    sql.query(`
        SELECT m.id AS match_id,
               u.id AS user_id, u.username, u.name, u.about_owner, u.phone, u.age,
               g.name AS gender_name,
               l.city AS location_city,
               d.name AS dog_name, d.photo, d.age AS dog_age, d.vaccinated,
               s.name AS size_name, b.name AS breed_name,
               pe.name AS personality_name, el.name AS energy_name
        FROM matches m
        JOIN users u ON u.id = IF(m.user1_id = ?, m.user2_id, m.user1_id)
        LEFT JOIN locations l ON l.id = u.location_id
        LEFT JOIN dogs d ON d.user_id = u.id
        LEFT JOIN sizes s ON s.id = d.size_id
        LEFT JOIN breeds b ON b.id = d.breed_id
        LEFT JOIN personalities pe ON pe.id = d.personality_id
        LEFT JOIN energy_levels el ON el.id = d.energy_level_id
        LEFT JOIN genders g ON g.id = u.gender_id
        WHERE m.user1_id = ? OR m.user2_id = ?
    `, [userId, userId, userId], (err, result) => {
        if (err) {
            res.status(500).send("Error fetching matches: " + err);
            return;
        }
        res.json(result);
    });
};

// removes a match — only a user who is part of the match can delete it
const deleteMatch = function(req, res) {
    const matchId = req.params.id;
    const userId  = req.userId;

    sql.query(
        "DELETE FROM matches WHERE id = ? AND (user1_id = ? OR user2_id = ?)",
        [matchId, userId, userId],
        (err, result) => {
            if (err) { res.status(500).send("Error deleting match: " + err); return; }
            if (result.affectedRows === 0) {
                res.status(403).send("Not found or not authorized.");
                return;
            }
            res.send("Match removed.");
        }
    );
};

// ===== RECOMMENDATIONS =====

// returns all recommendations (community-wide, newest first)
const getRecommendations = function(req, res) {
    sql.query(`
        SELECT r.*, u.username, u.name AS owner_name, rc.name AS category_name, l.city AS location_city
        FROM recommendations r
        JOIN users u ON u.id = r.user_id
        LEFT JOIN recommendation_categories rc ON rc.id = r.category_id
        LEFT JOIN locations l ON l.id = r.location_id
        ORDER BY r.created_at DESC
    `, (err, result) => {
        if (err) {
            res.status(500).send("Error fetching recommendations: " + err);
            return;
        }
        res.json(result);
    });
};

// adds a new recommendation posted by the logged-in user
const addRecommendation = function(req, res) {
    const photoPath = req.file ? "../images/" + req.file.filename : null;
    const newRec = {
        "user_id":     req.userId,
        "title":       req.body.title,
        "category_id": req.body.category_id,
        "description": req.body.description,
        "photo":       photoPath,
        "location_id": req.body.location_id || null
    };

    if (!newRec.title || !newRec.description) {
        res.status(400).send("Title and description are required.");
        return;
    }

    sql.query("INSERT INTO recommendations SET ?", newRec, (err, result) => {
        if (err) {
            res.status(500).send("Error adding recommendation: " + err);
            return;
        }
        res.status(201).json({ success: true, id: result.insertId });
    });
};

// deletes a recommendation — only the author can delete their own
const deleteRecommendation = function(req, res) {
    const recId  = req.params.id;
    const userId = req.userId;

    sql.query(
        "DELETE FROM recommendations WHERE id = ? AND user_id = ?",
        [recId, userId],
        (err, result) => {
            if (err) {
                res.status(500).send("Error deleting recommendation: " + err);
                return;
            }
            if (result.affectedRows === 0) {
                res.status(403).send("Not found or not authorized to delete.");
                return;
            }
            res.send("Recommendation deleted.");
        }
    );
};

// ===== PROFILES (DISCOVER) =====

// returns unseen profiles ranked by compatibility score:
// +1 for each attribute/preference that aligns between the two users
const getProfiles = function(req, res) {
    const userId = req.userId;

    // step 1: fetch the current user's own dog attributes + preferences
    sql.query(`
        SELECT d.size_id              AS my_dog_size,
               d.personality_id       AS my_dog_personality,
               d.energy_level_id      AS my_dog_energy,
               d.play_style_id        AS my_dog_play,
               p.size_id              AS my_pref_size,
               p.personality_id       AS my_pref_personality,
               p.interaction_type_id  AS my_pref_interaction,
               p.location_id          AS my_pref_location,
               u.location_id          AS my_location
        FROM users u
        LEFT JOIN dogs d ON d.user_id = u.id
        LEFT JOIN preferences p ON p.user_id = u.id
        WHERE u.id = ?
    `, [userId], (err, meResult) => {
        if (err) { res.status(500).send("Error fetching user data: " + err); return; }
        if (meResult.length === 0) { res.status(404).send("User not found."); return; }

        const me = meResult[0];

        // step 2: score every unseen candidate; each IF() adds 1 point when a field aligns
        sql.query(`
            SELECT u.id, u.username, u.name, u.about_owner,
                   l.city AS location_city,
                   d.name AS dog_name, d.photo, d.age AS dog_age, d.about_dog,
                   b.name AS breed_name, s.name AS size_name,
                   dg.name AS dog_gender_name, el.name AS energy_name,
                   pe.name AS personality_name, ps.name AS play_name,
                   c.name AS compat_name, d.vaccinated,
                   (
                     IF(d.size_id             = ?, 1, 0) +
                     IF(d.personality_id      = ?, 1, 0) +
                     IF(p.interaction_type_id = ?, 1, 0) +
                     IF(p.size_id             = ?, 1, 0) +
                     IF(p.personality_id      = ?, 1, 0) +
                     IF(p.location_id = ? OR p.location_id = ?, 1, 0) +
                     IF(d.energy_level_id     = ?, 1, 0) +
                     IF(d.play_style_id       = ?, 1, 0) +
                     IF(u.location_id         = ?, 1, 0)
                   ) AS match_score
            FROM users u
            LEFT JOIN locations l ON l.id = u.location_id
            LEFT JOIN dogs d ON d.user_id = u.id
            LEFT JOIN breeds b ON b.id = d.breed_id
            LEFT JOIN sizes s ON s.id = d.size_id
            LEFT JOIN genders dg ON dg.id = d.gender_id
            LEFT JOIN energy_levels el ON el.id = d.energy_level_id
            LEFT JOIN personalities pe ON pe.id = d.personality_id
            LEFT JOIN play_styles ps ON ps.id = d.play_style_id
            LEFT JOIN compatibility_types c ON c.id = d.compatibility_id
            LEFT JOIN preferences p ON p.user_id = u.id
            WHERE u.id != ?
              AND u.is_active = 1
              AND u.id NOT IN (
                  SELECT liked_id FROM likes WHERE liker_id = ?
              )
              AND u.id NOT IN (
                  SELECT user1_id FROM matches WHERE user2_id = ?
                  UNION
                  SELECT user2_id FROM matches WHERE user1_id = ?
              )
            ORDER BY match_score DESC
        `, [
            me.my_pref_size,         // their dog size = my preferred size
            me.my_pref_personality,  // their dog personality = my preferred personality
            me.my_pref_interaction,  // their preferred interaction type = mine
            me.my_dog_size,          // their pref size = my dog's size
            me.my_dog_personality,   // their pref personality = my dog's personality
            me.my_location,          // their pref location = where I live
            me.my_pref_location,     // their pref location = my preferred location
            me.my_dog_energy,        // their dog energy level = mine
            me.my_dog_play,          // their dog play style = mine
            me.my_location,          // they live in the same city as me
            userId,                  // exclude self
            userId,                  // exclude already-liked users
            userId,                  // exclude already-matched (user2_id check)
            userId                   // exclude already-matched (user1_id check)
        ], (err, result) => {
            if (err) { res.status(500).send("Error fetching profiles: " + err); return; }
            res.json(result);
        });
    });
};


// finds user by email and updates their password
const resetPassword = function(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        res.redirect('/reset-password?error=missing');
        return;
    }

    sql.query("SELECT id FROM users WHERE email = ?", [email], (err, result) => {
        if (err) {
            res.redirect('/reset-password?error=server');
            return;
        }
        if (result.length === 0) {
            res.redirect('/reset-password?error=notfound');
            return;
        }

        sql.query("UPDATE users SET password = ? WHERE email = ?", [password, email], (err) => {
            if (err) {
                res.redirect('/reset-password?error=server');
                return;
            }
            res.redirect('/login?success=reset');
        });
    });
};

const getAvailability = function(req, res) {
    const userId = req.userId;
    sql.query(`
        SELECT a.id, a.day, a.start_time, a.end_time, it.name AS type, a.type_id
        FROM availability a
        LEFT JOIN interaction_types it ON it.id = a.type_id
        WHERE a.user_id = ?
        ORDER BY FIELD(a.day,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), a.start_time
    `, [userId], (err, result) => {
        if (err) { res.status(500).send("Error fetching availability: " + err); return; }
        res.json(result);
    });
};

const addAvailability = function(req, res) {
    const { day, start_time, end_time, type_id } = req.body;
    if (!day || !start_time || !end_time) {
        res.status(400).send("Day, start time and end time are required.");
        return;
    }
    sql.query(
        "INSERT INTO availability (user_id, day, start_time, end_time, type_id) VALUES (?, ?, ?, ?, ?)",
        [req.userId, day, start_time, end_time, type_id || null],
        (err, result) => {
            if (err) { res.status(500).send("Error adding slot: " + err); return; }
            res.status(201).json({ id: result.insertId });
        }
    );
};

const deleteAvailability = function(req, res) {
    sql.query(
        "DELETE FROM availability WHERE id = ? AND user_id = ?",
        [req.params.id, req.userId],
        (err, result) => {
            if (err) { res.status(500).send("Error deleting slot: " + err); return; }
            if (result.affectedRows === 0) { res.status(404).send("Slot not found."); return; }
            res.send("Slot deleted.");
        }
    );
};

const checkAvailability = function(req, res) {
    const { email, username } = req.query;
    if (!email && !username) { res.json({ emailTaken: false, usernameTaken: false }); return; }
    sql.query(
        "SELECT email, username FROM users WHERE email = ? OR username = ?",
        [email || '', username || ''],
        (err, rows) => {
            if (err) { res.status(500).json({ error: 'DB error' }); return; }
            const emailTaken    = rows.some(function(r) { return r.email    === email; });
            const usernameTaken = rows.some(function(r) { return r.username === username; });
            res.json({ emailTaken, usernameTaken });
        }
    );
};

const getMatchedUserAvailability = function(req, res) {
    const requesterId = req.userId;
    const targetId    = parseInt(req.params.targetId);

    sql.query(
        "SELECT id FROM matches WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)",
        [requesterId, targetId, targetId, requesterId],
        (err, rows) => {
            if (err) { res.status(500).send("DB error"); return; }
            if (rows.length === 0) { res.status(403).send("Not matched with this user."); return; }

            sql.query(`
                SELECT a.id, a.day, a.start_time, a.end_time, it.name AS type
                FROM availability a
                LEFT JOIN interaction_types it ON it.id = a.type_id
                WHERE a.user_id = ?
                ORDER BY FIELD(a.day,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), a.start_time
            `, [targetId], (err2, slots) => {
                if (err2) { res.status(500).send("Error fetching slots."); return; }
                res.json(slots);
            });
        }
    );
};

const editAvailability = function(req, res) {
    const slotId = req.params.id;
    const userId = req.userId;
    const { day, start_time, end_time, type_id } = req.body;
    if (!day || !start_time || !end_time) {
        res.status(400).send("Day, start time and end time are required.");
        return;
    }
    sql.query(
        "UPDATE availability SET day = ?, start_time = ?, end_time = ?, type_id = ? WHERE id = ? AND user_id = ?",
        [day, start_time, end_time, type_id || null, slotId, userId],
        (err, result) => {
            if (err) { res.status(500).send("DB error"); return; }
            if (result.affectedRows === 0) { res.status(403).send("Not authorized."); return; }
            res.json({ success: true });
        }
    );
};

const editRecommendation = function(req, res) {
    const recId = req.params.id;
    const userId = req.userId;
    const { title, category_id, description, location_id } = req.body;
    if (!title || !description) {
        res.status(400).send("Title and description are required.");
        return;
    }
    sql.query("SELECT photo FROM recommendations WHERE id = ? AND user_id = ?", [recId, userId], (err, rows) => {
        if (err) { res.status(500).send("DB error"); return; }
        if (rows.length === 0) { res.status(403).send("Not authorized."); return; }
        const photo = req.file ? "../images/" + req.file.filename : rows[0].photo;
        sql.query(
            "UPDATE recommendations SET title = ?, category_id = ?, description = ?, location_id = ?, photo = ? WHERE id = ?",
            [title, category_id, description, location_id || null, photo, recId],
            (err2) => {
                if (err2) { res.status(500).send("DB error"); return; }
                res.json({ success: true });
            }
        );
    });
};

const pauseAccount = function(req, res) {
    const userId = req.userId;
    sql.query("SELECT is_active FROM users WHERE id = ?", [userId], (err, rows) => {
        if (err) { res.status(500).send("DB error"); return; }
        if (rows.length === 0) { res.status(404).send("User not found"); return; }
        const newStatus = rows[0].is_active ? 0 : 1;
        sql.query("UPDATE users SET is_active = ? WHERE id = ?", [newStatus, userId], (err2) => {
            if (err2) { res.status(500).send("DB error"); return; }
            res.json({ is_active: newStatus });
        });
    });
};

const deleteAccount = function(req, res) {
    const userId = req.userId;
    const steps = [
        "DELETE FROM availability    WHERE user_id = ?",
        "DELETE FROM recommendations WHERE user_id = ?",
        "DELETE FROM likes           WHERE liker_id = ? OR liked_id = ?",
        "DELETE FROM matches         WHERE user1_id = ? OR user2_id = ?",
        "DELETE FROM preferences     WHERE user_id = ?",
        "DELETE FROM dogs            WHERE user_id = ?",
        "DELETE FROM users           WHERE id = ?"
    ];
    const twoParam = [2, 3];
    let i = 0;
    function next(err) {
        if (err) { res.status(500).send("Error deleting account: " + err); return; }
        if (i >= steps.length) { res.send("Account deleted."); return; }
        const idx = i++;
        const params = twoParam.includes(idx) ? [userId, userId] : [userId];
        sql.query(steps[idx], params, next);
    }
    next(null);
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
                    createUserWithDogAndPreferences,
                    login,
                    getUser,
                    editUser,
                    editDog,
                    editPreferences,
                    likeOrSkip,
                    getMatches,
                    deleteMatch,
                    getRecommendations,
                    addRecommendation,
                    deleteRecommendation,
                    getProfiles,
                    resetPassword,
                    checkAvailability,
                    getAvailability,
                    addAvailability,
                    deleteAvailability,
                    getMatchedUserAvailability,
                    editAvailability,
                    editRecommendation,
                    pauseAccount,
                    deleteAccount
                }
