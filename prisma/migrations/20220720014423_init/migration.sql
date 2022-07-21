-- CreateTable
CREATE TABLE "admin_users" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR NOT NULL DEFAULT E'',
    "encrypted_password" VARCHAR NOT NULL DEFAULT E'',
    "reset_password_token" VARCHAR,
    "reset_password_sent_at" TIMESTAMP(6),
    "remember_created_at" TIMESTAMP(6),
    "sign_in_count" INTEGER NOT NULL DEFAULT 0,
    "current_sign_in_at" TIMESTAMP(6),
    "last_sign_in_at" TIMESTAMP(6),
    "current_sign_in_ip" INET,
    "last_sign_in_ip" INET,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "albums" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR NOT NULL DEFAULT E'',
    "unique_identifier" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "session_id" INTEGER,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ar_internal_metadata" (
    "key" VARCHAR NOT NULL,
    "value" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "ar_internal_metadata_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR NOT NULL DEFAULT E'',
    "image_id" VARCHAR NOT NULL DEFAULT E'',
    "mail_sent" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "language" VARCHAR,
    "session_id" INTEGER,
    "story_read" BOOLEAN DEFAULT false,
    "story_mail_sent" BOOLEAN DEFAULT false,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "es_cached_records" (
    "id" BIGSERIAL NOT NULL,
    "image_id" VARCHAR NOT NULL,
    "es_data" JSONB,
    "last_es_fetched_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "old_es_data" TEXT,

    CONSTRAINT "es_cached_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" BIGSERIAL NOT NULL,
    "album_id" BIGINT,
    "searched_image_blob" TEXT,
    "searched_image_s3_url" TEXT,
    "es_response" VARCHAR,
    "search_engine" VARCHAR,
    "response_time" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "result_image_url" VARCHAR,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schema_migrations" (
    "version" VARCHAR NOT NULL,

    CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" BIGSERIAL NOT NULL,
    "session_id" VARCHAR NOT NULL,
    "data" JSON,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "lang_pref" VARCHAR,
    "blob" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR,
    "slug" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR NOT NULL DEFAULT E'',
    "is_subscribed" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translations" (
    "id" BIGSERIAL NOT NULL,
    "parent_id" INTEGER,
    "screen_text" TEXT DEFAULT E'',
    "english_translation" TEXT,
    "chinese_translation" TEXT,
    "french_translation" TEXT,
    "german_translation" TEXT,
    "italian_translation" TEXT,
    "japanese_translation" TEXT,
    "korean_translation" TEXT,
    "russian_translation" TEXT,
    "spanish_translation" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "display_order" INTEGER,
    "unique_identifier" VARCHAR,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "index_admin_users_on_email" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "index_admin_users_on_reset_password_token" ON "admin_users"("reset_password_token");

-- CreateIndex
CREATE INDEX "index_albums_on_session_id" ON "albums"("session_id");

-- CreateIndex
CREATE INDEX "index_albums_on_unique_identifier" ON "albums"("unique_identifier");

-- CreateIndex
CREATE INDEX "index_albums_on_unique_identifier_and_session_id" ON "albums"("unique_identifier", "session_id");

-- CreateIndex
CREATE INDEX "index_bookmarks_on_email" ON "bookmarks"("email");

-- CreateIndex
CREATE INDEX "index_bookmarks_on_image_id" ON "bookmarks"("image_id");

-- CreateIndex
CREATE INDEX "index_bookmarks_on_language" ON "bookmarks"("language");

-- CreateIndex
CREATE INDEX "index_bookmarks_on_mail_sent" ON "bookmarks"("mail_sent");

-- CreateIndex
CREATE INDEX "index_bookmarks_on_session_id" ON "bookmarks"("session_id");

-- CreateIndex
CREATE INDEX "index_bookmarks_on_session_id_and_email" ON "bookmarks"("session_id", "email");

-- CreateIndex
CREATE INDEX "index_bookmarks_on_story_read" ON "bookmarks"("story_read");

-- CreateIndex
CREATE INDEX "index_bookmarks_on_story_read_and_story_mail_sent" ON "bookmarks"("story_read", "story_mail_sent");

-- CreateIndex
CREATE INDEX "index_es_cached_records_on_es_data" ON "es_cached_records"("es_data");

-- CreateIndex
CREATE INDEX "index_es_cached_records_on_image_id" ON "es_cached_records"("image_id");

-- CreateIndex
CREATE INDEX "index_es_cached_records_on_last_es_fetched_at" ON "es_cached_records"("last_es_fetched_at");

-- CreateIndex
CREATE INDEX "index_photos_on_album_id" ON "photos"("album_id");

-- CreateIndex
CREATE UNIQUE INDEX "index_sessions_on_session_id" ON "sessions"("session_id");

-- CreateIndex
CREATE INDEX "index_sessions_on_blob" ON "sessions"("blob");

-- CreateIndex
CREATE INDEX "index_sessions_on_updated_at" ON "sessions"("updated_at");

-- CreateIndex
CREATE INDEX "index_stories_on_slug" ON "stories"("slug");

-- CreateIndex
CREATE INDEX "index_stories_on_title" ON "stories"("title");

-- CreateIndex
CREATE INDEX "index_subscriptions_on_email" ON "subscriptions"("email");

-- CreateIndex
CREATE INDEX "index_subscriptions_on_is_subscribed" ON "subscriptions"("is_subscribed");

-- CreateIndex
CREATE INDEX "index_translations_on_display_order" ON "translations"("display_order");

-- CreateIndex
CREATE INDEX "index_translations_on_parent_id" ON "translations"("parent_id");

-- CreateIndex
CREATE INDEX "index_translations_on_unique_identifier" ON "translations"("unique_identifier");
