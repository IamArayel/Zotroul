package com.dreams.zotroul.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dreams.zotroul.model.Utilisateur;
import com.dreams.zotroul.repository.UtilisateurRepository;

@RestController
@RequestMapping("/utilisateurs")
public class UtilisateurController {

    private final UtilisateurRepository utilisateurRepository;

    public UtilisateurController(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    // Récupérer tous les utilisateurs
    @GetMapping
    public List<Utilisateur> getAll() {
        return utilisateurRepository.findAll();
    }

    // Récupérer un utilisateur par son ID
    @GetMapping("/{id}")
    public ResponseEntity<Utilisateur> getById(@PathVariable Long id) {
        return utilisateurRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Créer un nouvel utilisateur
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Utilisateur utilisateur) {
        if (utilisateur.getUsername() == null || utilisateur.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "username est obligatoire"));
        }
        if (utilisateurRepository.existsByUsername(utilisateur.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "username deja utilise"));
        }
        utilisateur.setId(null); // sécurité : on ne laisse pas le client imposer un ID
        Utilisateur saved = utilisateurRepository.save(utilisateur);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Mettre à jour un utilisateur existant
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Utilisateur utilisateur) {
        return utilisateurRepository.findById(id).map(existing -> {
            // Si username modifié, on vérifie qu'il n'est pas déjà pris
            if (utilisateur.getUsername() != null && !utilisateur.getUsername().isBlank()
                    && !utilisateur.getUsername().equals(existing.getUsername())
                    && utilisateurRepository.existsByUsername(utilisateur.getUsername())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "username deja utilise"));
            }
            if (utilisateur.getUsername() != null && !utilisateur.getUsername().isBlank()) {
                existing.setUsername(utilisateur.getUsername());
            }
            existing.setNumeroTelephone(utilisateur.getNumeroTelephone());
            Utilisateur saved = utilisateurRepository.save(existing);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Supprimer un utilisateur par son ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!utilisateurRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        utilisateurRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}