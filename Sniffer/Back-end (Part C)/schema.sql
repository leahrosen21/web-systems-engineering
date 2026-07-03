-- =============================================
-- LOOKUP TABLES
-- =============================================
CREATE TABLE IF NOT EXISTS locations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO locations (city) VALUES
('Tel Aviv'), ('Jerusalem'), ('Haifa'), ('Beer Sheva'),
('Rishon LeZion'), ('Petah Tikva'), ('Ashdod'), ('Netanya'),
('Holon'), ('Bnei Brak'), ('Ramat Gan'), ('Rehovot'),
('Ashkelon'), ('Bat Yam'), ('Herzliya'), ('Kfar Saba'),
('Modi\'in'), ('Eilat'), ('Nazareth'), ('Lod'), ('Ramla'),
('Ra\'anana'), ('Hadera'), ('Rosh HaAyin'), ('Givatayim'),
('Or Yehuda'), ('Kiryat Ata'), ('Akko'), ('Kiryat Bialik'),
('Kiryat Yam'), ('Kiryat Motzkin'), ('Tiberias'), ('Tzfat'),
('Dimona'), ('Afula'), ('Beit Shemesh'), ('Nahariya'),
('Nesher'), ('Kiryat Shmona'), ('Sderot'), ('Ofakim'),
('Arad'), ('Yavne'), ('Bet She\'an'), ('Migdal HaEmek'),
('Tirat Carmel'), ('Kiryat Malachi'), ('Kiryat Gat'),
('Nof HaGalil'), ('Tamra'), ('Sakhnin'), ('Shfaram'),
('Umm al-Fahm'), ('Baqa al-Gharbiyye'), ('Yokneam'),
('Zichron Yaakov'), ('Pardes Hanna-Karkur'), ('Gan Yavne'),
('Gedera'), ('Yehud'), ('Or Akiva'), ('Kiryat Ekron'),
('Mevasseret Zion'), ('Meitar'), ('Omer'), ('Ramat HaSharon'),
('Hod HaSharon'), ('Kfar Yona'), ('Rosh Pinna'), ('Ma\'alot'),
('Netivot'), ('Yeruham'), ('Mitzpe Ramon'), ('Rahat'),
('Hura'), ('Segev Shalom'), ('Lakiya'), ('Tel Sheva'),
('Ar\'ara BaNegev'), ('Kuseife'), ('Shoham'),
('Even Yehuda'), ('Kfar Shmaryahu'), ('Savyon'),
('Givat Shmuel'), ('Kiryat Ono'), ('Tzur Yigal'),
('Kfar Yabetz'), ('Nirit'), ('Beit Arye'),
('Alfei Menashe'), ('Mghar'), ('Kafr Kanna'),
('Majd al-Krum'), ('Arraba'), ('Deir Hanna'),
('Kafr Manda'), ('Reineh'), ('Iksal'), ('Bi\'ina'),
('Nahf'), ('Abu Snan'), ('Yirka'), ('Daliyat al-Karmel'),
('Isfiya'), ('Kabul'), ('Kisra-Sumei'), ('Judeide-Makr'),
('Yanuh-Jat'), ('Kfar Tavor'), ('Beit She\'arim'),
('Megiddo'), ('Bet Alfa'), ('Ein Harod'), ('Lehavim');



CREATE TABLE IF NOT EXISTS breeds (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO breeds (name) VALUES
('Golden Retriever'), ('Labrador Retriever'), ('German Shepherd'),
('French Bulldog'), ('Bulldog'), ('Poodle'), ('Beagle'),
('Rottweiler'), ('Yorkshire Terrier'), ('Boxer'),
('Dachshund'), ('Siberian Husky'), ('Doberman'),
('Great Dane'), ('Shih Tzu'), ('Miniature Schnauzer'),
('Chihuahua'), ('Cavalier King Charles Spaniel'),
('Border Collie'), ('Australian Shepherd'),
('Cocker Spaniel'), ('Dalmatian'), ('Pomeranian'),
('Maltese'), ('Bernese Mountain Dog'), ('Corgi'),
('Shetland Sheepdog'), ('Whippet'), ('Greyhound'),
('Samoyed'), ('Akita'), ('Chow Chow'), ('Bichon Frise'),
('Vizsla'), ('Weimaraner'), ('Bloodhound'), ('Mastiff'),
('Saint Bernard'), ('Newfoundland'), ('Mixed Breed'), ('Other');


CREATE TABLE IF NOT EXISTS sizes (
  id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO sizes (name) VALUES
('Small (up to 10 kg)'),
('Medium (10–25 kg)'),
('Large (25–40 kg)'),
('Extra Large (40+ kg)'),
('Any');

CREATE TABLE IF NOT EXISTS genders (
  id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO genders (name) VALUES
('Male'), ('Female'), ('Non-Binary'), ('Prefer Not To Say');



CREATE TABLE IF NOT EXISTS energy_levels (
  id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO energy_levels (name) VALUES
('Couch Potato'),
('Relaxed'),
('Balanced'),
('Energetic'),
('Hyperactive');


CREATE TABLE IF NOT EXISTS personalities (
  id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO personalities (name) VALUES
('Friendly'), ('Playful'), ('Curious'), ('Adventurous'),
 ('Other') ,('Calm'), ('Protective'), ('Shy'), ('Social'), ('Independent');


CREATE TABLE IF NOT EXISTS compatibility_types (
  id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO compatibility_types (name) VALUES
('All dogs'),
('Extra Small dogs only'),
('Small dogs only'),
('Medium dogs only'),
('Large dogs only'),
('Extra Large dogs only'),
('Small & Medium dogs'),
('Medium & Large dogs'),
('Small to Large dogs'),
('No small animals');

CREATE TABLE IF NOT EXISTS play_styles (
  id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO play_styles (name) VALUES
('Outdoor'), ('Indoor'), ('Both');


CREATE TABLE IF NOT EXISTS interaction_types (
  id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO interaction_types (name) VALUES
('Walk'), ('Playdate'), ('Both');


CREATE TABLE IF NOT EXISTS recommendation_categories (
  id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO recommendation_categories (name) VALUES
('park'), ('product'), ('service');


-- =============================================
-- MAIN TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(50),
  age TINYINT UNSIGNED,
  location_id INT UNSIGNED,
  phone VARCHAR(20),
  about_owner TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS dogs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  name VARCHAR(50),
  photo VARCHAR(255),
  age TINYINT UNSIGNED,
  breed_id INT UNSIGNED,
  size_id TINYINT UNSIGNED,
  gender_id TINYINT UNSIGNED,
  energy_level_id TINYINT UNSIGNED,
  personality_id TINYINT UNSIGNED,
  compatibility_id TINYINT UNSIGNED,
  vaccinated BOOLEAN NOT NULL DEFAULT FALSE,
  play_style_id TINYINT UNSIGNED,
  about_dog TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (breed_id) REFERENCES breeds(id) ON DELETE SET NULL,
  FOREIGN KEY (size_id) REFERENCES sizes(id) ON DELETE SET NULL,
  FOREIGN KEY (gender_id) REFERENCES genders(id) ON DELETE SET NULL,
  FOREIGN KEY (energy_level_id) REFERENCES energy_levels(id) ON DELETE SET NULL,
  FOREIGN KEY (personality_id) REFERENCES personalities(id) ON DELETE SET NULL,
  FOREIGN KEY (compatibility_id) REFERENCES compatibility_types(id) ON DELETE SET NULL,
  FOREIGN KEY (play_style_id) REFERENCES play_styles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS preferences (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  size_id TINYINT UNSIGNED,
  personality_id TINYINT UNSIGNED,
  interaction_type_id TINYINT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (size_id) REFERENCES sizes(id) ON DELETE SET NULL,
  FOREIGN KEY (personality_id) REFERENCES personalities(id) ON DELETE SET NULL,
  FOREIGN KEY (interaction_type_id) REFERENCES interaction_types(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS availability (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  day ENUM(
    'Monday','Tuesday','Wednesday','Thursday',
    'Friday','Saturday','Sunday'
  ),
  start_time TIME,
  end_time TIME,
  type_id TINYINT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES interaction_types(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS likes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  liker_id INT UNSIGNED NOT NULL,
  liked_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (liker_id, liked_id),
  CHECK (liker_id <> liked_id),

  FOREIGN KEY (liker_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (liked_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS matches (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user1_id INT UNSIGNED NOT NULL,
  user2_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (user1_id, user2_id),
  CHECK (user1_id <> user2_id),

  FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS recommendations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED,
  category_id TINYINT UNSIGNED,
  title VARCHAR(255),
  description TEXT,
  recommendation_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES recommendation_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;






INSERT INTO users (id, username, email, password, name, age, location_id, phone, about_owner) VALUES
(1, 'maya_gold', 'maya@example.com', '123456', 'Maya', 28, 1, '0521234567', 'Love long walks and dog beaches.'),
(2, 'noam_beagle', 'noam@example.com', '123456', 'Noam', 35, 1, '0539876543', 'Engineer & dog dad.'),
(3, 'dana_corgi', 'dana@example.com', '123456', 'Dana', 24, 1, '0547654321', 'WFH with my corgi.'),
(4, 'ron_husky', 'ron@example.com', '123456', 'Ron', 31, 1, '0521112222', 'Weekend hiker.'),
(5, 'lior_lab', 'lior@example.com', '123456', 'Lior', 29, 2, '0502221111', 'Dogs are my therapy.'),
(6, 'sara_poodle', 'sara@example.com', '123456', 'Sara', 26, 2, '0513334444', 'Poodle lover.'),
(7, 'amit_boxer', 'amit@example.com', '123456', 'Amit', 33, 3, '0529998888', 'Active lifestyle only.'),
(8, 'noa_maltese', 'noa@example.com', '123456', 'Noa', 22, 3, '0541112222', 'Small dogs = big love.'),
(9, 'yoni_dalmatian', 'yoni@example.com', '123456', 'Yoni', 38, 4, '0532223333', 'Runs every morning.'),
(10,'tamar_mix', 'tamar@example.com', '123456', 'Tamar', 27, 1, '0554445555', 'Mixed breed rescue advocate.');


INSERT INTO dogs
(id, user_id, name, photo, age, breed_id, size_id, gender_id, energy_level_id, personality_id, compatibility_id, vaccinated, play_style_id, about_dog)
VALUES
(1, 1, 'Buddy', '../images/dogs/buddy.jpg', 3, 1, 4, 1, 3, 1, 1, TRUE, 3, 'Friendly golden retriever.'),
(2, 2, 'Pickle', '../images/dogs/pickle.jpg', 1, 7, 3, 2, 3, 2, 7, TRUE, 3, 'Zoomies all day.'),
(3, 3, 'Pretzel', '../images/dogs/pretzel.jpg', 4, 18, 3, 1, 2, 3, 1, TRUE, 1, 'Structured playdates only.'),
(4, 4, 'Blizzard', '../images/dogs/blizzard.jpg', 2, 12, 5, 1, 3, 4, 8, TRUE, 1, 'Needs running partner.'),
(5, 5, 'Max', '../images/dogs/max.jpg', 5, 2, 4, 1, 2, 1, 1, TRUE, 3, 'Calm lab, very social.'),
(6, 6, 'Luna', '../images/dogs/luna.jpg', 2, 6, 3, 2, 2, 8, 7, TRUE, 3, 'Very intelligent poodle.'),
(7, 7, 'Rocky', '../images/dogs/rocky.jpg', 3, 10, 4, 1, 3, 4, 8, TRUE, 1, 'High energy boxer.'),
(8, 8, 'Mimi', '../images/dogs/mimi.jpg', 6, 24, 1, 2, 1, 5, 2, TRUE, 2, 'Tiny but confident.'),
(9, 9, 'Bolt', '../images/dogs/bolt.jpg', 4, 22, 4, 1, 3, 4, 1, TRUE, 1, 'Fast dalmatian runner.'),
(10,10, 'Shadow', '../images/dogs/shadow.jpg', 3, 26, 3, 1, 2, 3, 1, TRUE, 3, 'Mixed breed rescue.');

INSERT INTO preferences (user_id, size_id, personality_id, interaction_type_id) VALUES
(1, 5, 1, 2),
(2, 3, 2, 1),
(3, 3, 5, 2),
(4, 4, 4, 1),
(5, 3, 1, 2),
(6, 2, 8, 2),
(7, 4, 4, 1),
(8, 1, 7, 2),
(9, 4, 4, 1),
(10,3, 3, 2);


INSERT INTO likes (liker_id, liked_id) VALUES
(1,2),(2,1),
(1,5),(5,1),
(3,8),(8,3),
(4,7),(7,4),
(6,8),(8,6),
(9,4),(4,9),
(10,1),(1,10);

INSERT INTO matches (user1_id, user2_id) VALUES
(1,2),
(1,5),
(3,8),
(4,7);


INSERT INTO availability (user_id, day, start_time, end_time, type_id) VALUES

-- Maya
(1, 'Monday', '17:00', '19:00', 1),
(1, 'Saturday', '09:00', '11:00', 2),

-- Noam
(2, 'Monday', '18:00', '20:00', 1),
(2, 'Friday', '16:00', '18:00', 2),

-- Dana
(3, 'Tuesday', '17:00', '19:00', 1),
(3, 'Saturday', '10:00', '12:00', 2),

-- Ron
(4, 'Monday', '18:00', '20:00', 1),
(4, 'Sunday', '08:00', '10:00', 2),

-- Lior
(5, 'Wednesday', '17:00', '19:00', 1),
(5, 'Saturday', '09:00', '11:00', 2),

-- Sara
(6, 'Monday', '17:00', '19:00', 1),
(6, 'Thursday', '18:00', '20:00', 2),

-- Amit
(7, 'Friday', '16:00', '19:00', 1),
(7, 'Saturday', '09:00', '12:00', 2),

-- Noa
(8, 'Tuesday', '16:00', '18:00', 1),
(8, 'Sunday', '10:00', '12:00', 2),

-- Yoni
(9, 'Monday', '06:00', '08:00', 1),
(9, 'Saturday', '07:00', '09:00', 2),

-- Tamar
(10, 'Wednesday', '17:00', '19:00', 1),
(10, 'Sunday', '11:00', '13:00', 2);


ALTER TABLE users
  ADD COLUMN gender_id int(10) NULL AFTER age,
  ADD CONSTRAINT fk_users_gender FOREIGN KEY (gender_id) REFERENCES genders(id);


UPDATE users SET gender_id = CASE id
  WHEN 1 THEN 2
  WHEN 2 THEN 1
  WHEN 3 THEN 2
  WHEN 4 THEN 1
  WHEN 5 THEN 1
  WHEN 6 THEN 2
  WHEN 7 THEN 1
  WHEN 8 THEN 2
  WHEN 9 THEN 1
  WHEN 10 THEN 2
END
WHERE id IN (1,2,3,4,5,6,7,8,9,10);


ALTER TABLE preferences
    ->   ADD COLUMN location_id int unsigned NULL,
    ->   ADD CONSTRAINT fk_preferences_location FOREIGN KEY (location_id) REFERENCES locations(id);


UPDATE preferences SET location_id = CASE user_id
  WHEN 1 THEN 1
  WHEN 2 THEN 2
  WHEN 3 THEN 3
  WHEN 4 THEN 4
  WHEN 5 THEN 1
  WHEN 6 THEN 2
  WHEN 7 THEN 3
  WHEN 8 THEN 4
  WHEN 9 THEN 1
  WHEN 10 THEN 2
END
WHERE user_id IN (1,2,3,4,5,6,7,8,9,10);


ALTER TABLE recommendations ADD COLUMN photo VARCHAR(255) NULL;


SET @uid = (SELECT MIN(id) FROM users);

INSERT INTO recommendations (user_id, title, category_id, description, photo, created_at) VALUES
(
  @uid,
  'Hayarkon Park Dog Area',
  (SELECT id FROM recommendation_categories WHERE LOWER(name) LIKE '%park%' LIMIT 1),
  'Huge off-leash zone near the lake. Always clean, well fenced, and easy to find parking. Best early mornings on weekdays.',
  '../images/park.jpg',
  '2026-04-12'
),
(
  @uid,
  'Freeze-dried Salmon Treats',
  (SELECT id FROM recommendation_categories WHERE LOWER(name) LIKE '%product%' LIMIT 1),
  'My vet recommended these for training. High-value reward, single ingredient, and dogs go absolutely wild for them.',
  '../images/product.jpg',
  '2026-04-05'
),
(
  @uid,
  'Bark & Brew Grooming',
  (SELECT id FROM recommendation_categories WHERE LOWER(name) LIKE '%service%' LIMIT 1),
  'Amazing mobile groomer who comes to you. Very calm with nervous dogs. Book in advance, she fills up fast.',
  '../images/service.jpg',
  '2026-04-01'
);

ALTER TABLE recommendations DROP COLUMN recommendation_date;

ALTER TABLE recommendations ADD COLUMN location_id INT NULL

ALTER TABLE recommendations MODIFY COLUMN location_id INT UNSIGNED NULL;

ALTER TABLE recommendations 
ADD CONSTRAINT fk_rec_location 
FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL;


UPDATE recommendations SET location_id = 1 WHERE id = 1;

UPDATE recommendations SET location_id = 3 WHERE id = 3;

UPDATE recommendations SET location_id = 17 WHERE id = 6;

ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1;

UPDATE users SET email = 'maya@gmail.com',  password = 'MayaGold1!'       WHERE id = 1;
UPDATE users SET email = 'noam@gmail.com',  password = 'NoamBeagle1!'     WHERE id = 2;
UPDATE users SET email = 'dana@gmail.com',  password = 'DanaCorgi1!'      WHERE id = 3;
UPDATE users SET email = 'ron@gmail.com',   password = 'RonHusky1!'       WHERE id = 4;
UPDATE users SET email = 'lior@gmail.com',  password = 'LiorLab1!'        WHERE id = 5;
UPDATE users SET email = 'sara@gmail.com',  password = 'SaraPoodle1!'     WHERE id = 6;
UPDATE users SET email = 'amit@gmail.com',  password = 'AmitBoxer1!'      WHERE id = 7;
UPDATE users SET email = 'noa@gmail.com',   password = 'NoaMaltese1!'     WHERE id = 8;
UPDATE users SET email = 'yoni@gmail.com',  password = 'YoniDalmatian1!'  WHERE id = 9;
UPDATE users SET email = 'tamar@gmail.com', password = 'TamarMix1!'       WHERE id = 10;


