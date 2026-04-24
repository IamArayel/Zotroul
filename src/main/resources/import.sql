-- Fixtures pour les utilisateurs
INSERT INTO utilisateur (id, username, numero_telephone) VALUES (1, 'alice', '0123456789');
INSERT INTO utilisateur (id, username, numero_telephone) VALUES (2, 'bob', '0987654321');
INSERT INTO utilisateur (id, username, numero_telephone) VALUES (3, 'charlie', '0567890123');

-- Fixtures pour les vélos
INSERT INTO vehicule (id, etat_batterie, commune) VALUES (1, 85.5, 'Saint-Denis');
INSERT INTO vehicule (id, etat_batterie, commune) VALUES (2, 92.0, 'Sainte-Marie');
INSERT INTO vehicule (id, etat_batterie, commune) VALUES (3, 78.3, 'Saint-Pierre');
INSERT INTO velo (id, porte_bagage) VALUES (1, true);
INSERT INTO velo (id, porte_bagage) VALUES (2, false);
INSERT INTO velo (id, porte_bagage) VALUES (3, true);

-- Fixtures pour les trotinettes
INSERT INTO vehicule (id, etat_batterie, commune) VALUES (4, 66.0, 'Le Tampon');
INSERT INTO vehicule (id, etat_batterie, commune) VALUES (5, 71.5, 'Saint-Paul');
INSERT INTO vehicule (id, etat_batterie, commune) VALUES (6, 88.0, 'Saint-Leu');
INSERT INTO trotinette (id, panier) VALUES (4, false);
INSERT INTO trotinette (id, panier) VALUES (5, true);
INSERT INTO trotinette (id, panier) VALUES (6, false);

-- Fixtures pour les scooters
INSERT INTO vehicule (id, etat_batterie, commune) VALUES (7, 95.0, 'Saint-Benoît');
INSERT INTO vehicule (id, etat_batterie, commune) VALUES (8, 54.5, 'La Possession');
INSERT INTO vehicule (id, etat_batterie, commune) VALUES (9, 80.0, 'Saint-André');
INSERT INTO scooter (id, coffre) VALUES (7, true);
INSERT INTO scooter (id, coffre) VALUES (8, false);
INSERT INTO scooter (id, coffre) VALUES (9, true);

-- Fixtures pour les sessions
INSERT INTO session (id, date_debut, date_fin, prix, utilisateur_id, vehicule_id) VALUES (1, '2023-01-01 10:00:00', '2023-01-01 12:00:00', 15.0, 1, 1);
INSERT INTO session (id, date_debut, date_fin, prix, utilisateur_id, vehicule_id) VALUES (2, '2023-01-02 14:00:00', '2023-01-02 16:00:00', 20.0, 2, 4);
INSERT INTO session (id, date_debut, date_fin, prix, utilisateur_id, vehicule_id) VALUES (3, '2023-01-03 09:00:00', '2023-01-03 11:00:00', 18.5, 3, 7);

-- Resynchronisation des séquences après insertion des fixtures
SELECT setval(pg_get_serial_sequence('vehicule', 'id'), (SELECT MAX(id) FROM vehicule));
SELECT setval(pg_get_serial_sequence('utilisateur', 'id'), (SELECT MAX(id) FROM utilisateur));
SELECT setval(pg_get_serial_sequence('session', 'id'), (SELECT MAX(id) FROM session));