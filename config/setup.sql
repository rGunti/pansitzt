DROP TABLE IF EXISTS users;
CREATE TABLE users
(
  twitter_id VARCHAR(20) PRIMARY KEY NOT NULL,
  twitter_token VARCHAR(255) NOT NULL,
  handle VARCHAR(20) NOT NULL,
  display_name VARCHAR(100),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
CREATE UNIQUE INDEX users_twitter_id_uindex ON users (twitter_id);

CREATE TABLE posts
(
  id VARCHAR(8) PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL,
  title VARCHAR(100) NOT NULL,
  source VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  CONSTRAINT post_author_fk FOREIGN KEY (user_id) REFERENCES users (twitter_id)
);
