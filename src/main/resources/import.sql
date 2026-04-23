-- Fixtures pour les utilisateurs
INSERT INTO utilisateur (id, username, numero_telephone) VALUES (1, 'alice', '0123456789');
INSERT INTO utilisateur (id, username, numero_telephone) VALUES (2, 'bob', '0987654321');
INSERT INTO utilisateur (id, username, numero_telephone) VALUES (3, 'charlie', '0567890123');

-- Fixtures pour les véhicules
INSERT INTO vehicule (id, etat_batterie, commune) VALUES (1, 85.5, 'Saint-Denis');
INSERT INTO vehicule (id, etat_batterie, commune) VALUES (2, 92.0, 'Sainte-Marie');
INSERT INTO vehicule (id, etat_batterie, commune) VALUES (3, 78.3, 'Saint-Pierre');

-- Fixtures pour les sessions
INSERT INTO session (id, date_debut, date_fin, prix, utilisateur_id, vehicule_id) VALUES (1, '2023-01-01 10:00:00', '2023-01-01 12:00:00', 15.0, 1, 1);
INSERT INTO session (id, date_debut, date_fin, prix, utilisateur_id, vehicule_id) VALUES (2, '2023-01-02 14:00:00', '2023-01-02 16:00:00', 20.0, 2, 2);
INSERT INTO session (id, date_debut, date_fin, prix, utilisateur_id, vehicule_id) VALUES (3, '2023-01-03 09:00:00', '2023-01-03 11:00:00', 18.5, 3, 3);


-- Resynchronisation des séquences après insertion des fixtures
SELECT setval(pg_get_serial_sequence('vehicule', 'id'), (SELECT MAX(id) FROM vehicule));
SELECT setval(pg_get_serial_sequence('utilisateur', 'id'), (SELECT MAX(id) FROM utilisateur));
SELECT setval(pg_get_serial_sequence('session', 'id'), (SELECT MAX(id) FROM session));
