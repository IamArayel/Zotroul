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

import com.dreams.zotroul.model.Scooter;
import com.dreams.zotroul.repository.ScooterRepository;

@RestController
@RequestMapping("/scooters")
public class ScooterController {

    @Autowired
    private ScooterRepository scooterRepository;

    // Cette route GET /scooters recupere tous les scooters en base.
    @GetMapping
    public Iterable<Scooter> getAll() {
        return scooterRepository.findAll();
    }

    // Cette route GET /scooters/{id} recupere un scooter par son identifiant.
    @GetMapping("/{id}")
    public ResponseEntity<Scooter> get(@PathVariable Long id) {
        return scooterRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cette route POST /scooters cree un nouveau scooter avec les donnees du JSON
    // envoye.
    @PostMapping
    public ResponseEntity<Scooter> create(@RequestBody Scooter scooter) {
        Scooter savedScooter = scooterRepository.save(scooter);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedScooter);
    }

    // Cette route PUT /scooters/{id} modifie un scooter existant a partir des
    // nouvelles donnees recues.
    @PutMapping("/{id}")
    public ResponseEntity<Scooter> update(@PathVariable Long id, @RequestBody Scooter scooter) {
        return scooterRepository.findById(id)
                .map(existingScooter -> {
                    existingScooter.setCommune(scooter.getCommune());
                    existingScooter.setEtatBatterie(scooter.getEtatBatterie());

                    Scooter updatedScooter = scooterRepository.save(existingScooter);
                    return ResponseEntity.ok(updatedScooter);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cette route DELETE /scooters/{id} supprime un scooter si son id existe.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!scooterRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        scooterRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
