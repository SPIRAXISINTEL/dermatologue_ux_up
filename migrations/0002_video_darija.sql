-- V4.1: public website and all text remain French; videos are spoken in Moroccan Darija.
ALTER TABLE cms_videos ADD COLUMN spoken_language TEXT NOT NULL DEFAULT 'ar-MA' CHECK(spoken_language = 'ar-MA');
