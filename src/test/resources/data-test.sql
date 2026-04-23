-- Fixtures pour les tests : utilisateurs
INSERT INTO utilisateur (id, username, numero_telephone) VALUES (1, 'testuser1', '0111111111');
INSERT INTO utilisateur (id, username, numero_telephone) VALUES (2, 'testuser2', '0222222222');

-- Fixtures pour les tests : véhicules
INSERT INTO vehicule (id, etat_batterie, commune) VALUES (1, 100.0, 'TestCity1');
INSERT INTO vehicule (id, etat_batterie, commune) VALUES (2, 90.0, 'TestCity2');

-- Fixtures pour les tests : sessions
INSERT INTO session (id, date_debut, date_fin, prix, utilisateur_id, vehicule_id) VALUES (1, '2023-01-01 10:00:00', '2023-01-01 12:00:00', 10.0, 1, 1);
INSERT INTO session (id, date_debut, date_fin, prix, utilisateur_id, vehicule_id) VALUES (2, '2023-01-02 14:00:00', '2023-01-02 16:00:00', 12.0, 2, 2);