CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id text NOT NULL,
  user_name text NOT NULL DEFAULT 'Anonymous',
  content text NOT NULL,
  likes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_comments" ON comments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_comments" ON comments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_comments_likes" ON comments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_comments" ON comments FOR DELETE TO anon, authenticated USING (true);
