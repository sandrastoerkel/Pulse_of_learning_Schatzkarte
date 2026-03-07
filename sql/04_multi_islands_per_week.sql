-- Migration: Mehrere Inseln pro Woche erlauben
-- Vorher: Unique-Constraint auf (group_id, week_number) -> nur 1 Insel/Woche
-- Nachher: Unique-Constraint auf (group_id, week_number, island_id) -> mehrere Inseln/Woche

-- Alten Constraint entfernen (Name kann variieren)
ALTER TABLE group_weekly_islands
  DROP CONSTRAINT IF EXISTS group_weekly_islands_group_id_week_number_key;
ALTER TABLE group_weekly_islands
  DROP CONSTRAINT IF EXISTS group_weekly_islands_pkey;

-- Neuen Constraint: gleiche Insel darf nicht doppelt in derselben Woche sein
ALTER TABLE group_weekly_islands
  ADD CONSTRAINT group_weekly_islands_group_week_island_key
  UNIQUE (group_id, week_number, island_id);

-- Falls die Tabelle eine id-Spalte hat, diese als Primary Key behalten/hinzufuegen
-- (Supabase generiert normalerweise eine id-Spalte)
