-- Users
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

-- Posts
DROP TABLE IF EXISTS posts;
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

-- Post Votes
DROP TABLE IF EXISTS post_votes;
CREATE TABLE post_votes
(
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id VARCHAR(8) NOT NULL,
  user_id VARCHAR(20) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  CONSTRAINT post_votes_posts_id_fk FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT post_votes_users_twitter_id_fk FOREIGN KEY (user_id) REFERENCES users (twitter_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Profile View
DROP VIEW IF EXISTS v_users;
CREATE VIEW v_users AS
  SELECT
    u.twitter_id AS twitter_id,
    u.handle AS handle,
    u.display_name AS display_name,
    (SELECT COUNT(p.id) FROM posts p WHERE p.user_id = u.twitter_id) AS post_count,
    u.created_at AS created_at,
    u.updated_at AS updated_at
  FROM
    users u
;

-- Post View
DROP VIEW IF EXISTS v_posts;
CREATE VIEW v_posts AS
  SELECT
    p.id AS id,
    p.user_id AS user_id,
    u.handle AS user_handle,
    u.display_name AS user_display_name,
    p.title AS title,
    p.source AS source,
    (SELECT COUNT(v.id) FROM post_votes v WHERE v.post_id = p.id) AS vote_count,
    p.created_at AS created_at,
    p.updated_at AS updated_at
  FROM
    posts p
    LEFT JOIN users u ON p.user_id = u.twitter_id
;
