PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS cms_articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Dermatologie',
  author_name TEXT NOT NULL DEFAULT 'Dr Yassir Chaibi',
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','in_review','published','archived')),
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  reviewed_by TEXT,
  reviewed_at TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  cover_image TEXT,
  CONSTRAINT slug_format CHECK(slug GLOB '[a-z0-9]*' AND slug NOT GLOB '*[^a-z0-9-]*')
);
CREATE INDEX IF NOT EXISTS idx_cms_articles_status_date ON cms_articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_cms_articles_updated ON cms_articles(updated_at DESC);

CREATE TABLE IF NOT EXISTS cms_videos (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Dermatologie',
  author_name TEXT NOT NULL DEFAULT 'Dr Yassir Chaibi',
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','in_review','published','archived')),
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  reviewed_by TEXT,
  reviewed_at TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT
);
CREATE INDEX IF NOT EXISTS idx_cms_videos_status_date ON cms_videos(status, published_at DESC);

CREATE TABLE IF NOT EXISTS cms_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  details_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_cms_audit_entity ON cms_audit_log(entity_type, entity_id, occurred_at DESC);
