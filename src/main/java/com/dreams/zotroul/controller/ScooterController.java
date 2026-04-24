package com.dreams.zotroul.controller;

import io.swagger.v3.oas.annotations.Operation;
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

import com.dreams.zotroul.model.Scooter;
import com.dreams.zotroul.repository.ScooterRepository;

@RestController
@RequestMapping("/scooters")
public class ScooterController {

    @Autowired
    private ScooterRepository scooterRepository;

    // Cette route GET /scooters recupere tous les scooters en base.
    @Operation(summary = "Lister les scooters", description = "Retourne la liste de tous les scooters enregistres.")
    @GetMapping
    public Iterable<Scooter> getAll() {
        return scooterRepository.findAll();
    }

    // Cette route GET /scooters/{id} recupere un scooter par son identifiant.
    @Operation(summary = "Recuperer un scooter", description = "Retourne un scooter a partir de son identifiant.")
    @GetMapping("/{id}")
    public ResponseEntity<Scooter> get(@PathVariable Long id) {
        return scooterRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cette route POST /scooters cree un nouveau scooter avec les donnees du JSON
    // envoye.
    @Operation(summary = "Creer un scooter", description = "Cree un nouveau scooter a partir des donnees envoyees dans la requete.")
    @PostMapping
    public ResponseEntity<Scooter> create(@RequestBody Scooter scooter) {
        Scooter savedScooter = scooterRepository.save(scooter);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedScooter);
    }

    // Cette route PUT /scooters/{id} modifie un scooter existant a partir des
    // nouvelles donnees recues.
    @Operation(summary = "Modifier un scooter", description = "Met a jour les informations d'un scooter existant.")
    @PutMapping("/{id}")
    public ResponseEntity<Scooter> update(@PathVariable Long id, @RequestBody Scooter scooter) {
        return scooterRepository.findById(id)
                .map(existingScooter -> {
                    existingScooter.setCommune(scooter.getCommune());
                    existingScooter.setEtatBatterie(scooter.getEtatBatterie());
                    existingScooter.setCoffre(scooter.isCoffre());

                    Scooter updatedScooter = scooterRepository.save(existingScooter);
                    return ResponseEntity.ok(updatedScooter);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cette route DELETE /scooters/{id} supprime un scooter si son id existe.
    @Operation(summary = "Supprimer un scooter", description = "Supprime un scooter a partir de son identifiant.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!scooterRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        scooterRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
