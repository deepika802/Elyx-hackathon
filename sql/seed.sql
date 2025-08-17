INSERT INTO users (name, age) VALUES ('John Doe', 34);

INSERT INTO diseases (user_id, name, diagnosed_at) VALUES (1,'Type 2 Diabetes','2018-05-10');

INSERT INTO exercise_plans (user_id, title, frequency, notes)
VALUES (1,'HIIT & Walk','3x/week','Evening walk 30min');

INSERT INTO diet_plans (user_id, title, calories, notes)
VALUES (1,'Low Carb','1800','Reduce simple sugars');

INSERT INTO labs (user_id, name, scheduled_at, status)
VALUES (1,'Comprehensive Metabolic Panel','2025-12-18','Ordered');

INSERT INTO metrics (user_id, metric_key, metric_value) VALUES
 (1,'health_score',84),
 (1,'metabolic_momentum',92),
 (1,'sleep_hours',7.8),
 (1,'rhr',62);

INSERT INTO decisions (user_id, title, created_by, note)
VALUES (1,'Metformin Dosage Adjustment','Dr. Smith','Reduced from 1000mg to 500mg');

INSERT INTO chats (user_id, sender, message) VALUES
 (1,'Coach Sarah','Start with 10 min warm-up'),
 (1,'John Doe','Will do, thanks!');
