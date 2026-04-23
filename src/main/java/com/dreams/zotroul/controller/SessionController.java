package com.dreams.zotroul.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dreams.zotroul.model.Session;
import com.dreams.zotroul.repository.SessionRepository;

@RestController
@RequestMapping("/sessions") // Toutes les routes de ce controller commencent par /sessions
public class SessionController {

    @Autowired
    private SessionRepository sessionRepository; // Injection du repository pour communiquer avec la base de donnees

    public SessionController() {
    }

    // Cette route GET /sessions recupere toutes les sessions de la base et les
    // retourne en JSON.
    @GetMapping
    public Iterable<Session> getAll() {
        // findAll() recupere toutes les sessions en base
        return sessionRepository.findAll();
    }

    // Cette route GET /sessions/{id} recupere une session par son id et retourne
    // 404 si elle n'existe pas.
    @GetMapping("/{id}")
    public ResponseEntity<Session> get(@PathVariable Long id) {
        // findById(id) cherche une session par son identifiant
        return sessionRepository.findById(id)
                // Si la session existe, elle est retournee dans une reponse 200 OK
                .map(ResponseEntity::ok)
                // Sinon, une reponse 404 Not Found est retournee
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cette route POST /sessions cree une nouvelle session a partir du JSON envoye
    // dans la requete.
    @PostMapping
    public ResponseEntity<Session> create(@RequestBody Session session) {
        // save(session) insere la nouvelle session dans la base
        Session savedSession = sessionRepository.save(session);
        // Retourne le code 201 avec l'objet cree
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSession);
    }

    // Cette route PUT /sessions/{id} modifie une session existante avec les
    // nouvelles donnees envoyees.
    @PutMapping("/{id}")
    public ResponseEntity<Session> update(@PathVariable Long id, @RequestBody Session session) {
        // Recherche de la session a modifier
        return sessionRepository.findById(id)
                .map(existingSession -> {
                    // Mise a jour de la date de debut
                    existingSession.setDateDebut(session.getDateDebut());
                    // Mise a jour de la date de fin
                    existingSession.setDateFin(session.getDateFin());
                    // Mise a jour du prix
                    existingSession.setPrix(session.getPrix());
                    // Mise a jour de l'utilisateur lie a la session
                    existingSession.setUtilisateur(session.getUtilisateur());
                    // Mise a jour du vehicule lie a la session
                    existingSession.setVehicule(session.getVehicule());

                    // Sauvegarde de la session modifiee
                    Session updatedSession = sessionRepository.save(existingSession);
                    // Retourne HTTP 200 avec la session mise a jour
                    return ResponseEntity.ok(updatedSession);
                })
                // Si aucune session n'est trouvee avec cet id, retourne HTTP 404
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cette route DELETE /sessions/{id} supprime une session si elle existe sinon
    // retourne 404.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        // Verification de l'existence de la session
        if (!sessionRepository.existsById(id)) {
            // Si l'id n'existe pas, retourne 404
            return ResponseEntity.notFound().build();
        }

        // Suppression de la session en base
        sessionRepository.deleteById(id);
        // Retourne 204 pour indiquer que la suppression a reussi sans contenu a
        // renvoyer
        return ResponseEntity.noContent().build();
    }

    // Cette route GET /sessions/utilisateur/{id} recupere toutes les sessions liees
    // a un utilisateur.
    @GetMapping("/utilisateur/{id}")
    public ResponseEntity<Iterable<Session>> getByUtilisateur(@PathVariable Long id) {
        return ResponseEntity.ok(sessionRepository.findByUtilisateurId(id));
    }

    // Cette route GET /sessions/vehicule/{id} recupere toutes les sessions liees a
    // un vehicule.
    @GetMapping("/vehicule/{id}")
    public ResponseEntity<Iterable<Session>> getByVehicule(@PathVariable Long id) {
        return ResponseEntity.ok(sessionRepository.findByVehiculeId(id));
    }

}
