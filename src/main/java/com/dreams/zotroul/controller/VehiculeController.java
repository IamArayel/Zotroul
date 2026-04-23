package com.dreams.zotroul.controller;

import com.dreams.zotroul.model.Vehicule;
import com.dreams.zotroul.repository.VehiculeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicules")
public class VehiculeController {

    private final VehiculeRepository vehiculeRepository;

    public VehiculeController(VehiculeRepository vehiculeRepository) {
        this.vehiculeRepository = vehiculeRepository;
    }

    // Retourne la liste de tous les véhicules
    @GetMapping
    public List<Vehicule> getAll() {
        return vehiculeRepository.findAll();
    }

    // Retourne un véhicule par son identifiant, 404 s'il n'existe pas
    @GetMapping("/{id}")
    public ResponseEntity<Vehicule> getById(@PathVariable Long id) {
        return vehiculeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Crée un nouveau véhicule et retourne 201 avec la ressource créée
    @PostMapping
    public ResponseEntity<Vehicule> create(@RequestBody Vehicule vehicule) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehiculeRepository.save(vehicule));
    }

    // Met à jour un véhicule existant, 404 s'il n'existe pas
    @PutMapping("/{id}")
    public ResponseEntity<Vehicule> update(@PathVariable Long id, @RequestBody Vehicule vehicule) {
        if (!vehiculeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        vehicule.setId(id);
        return ResponseEntity.ok(vehiculeRepository.save(vehicule));
    }

    // Supprime un véhicule par son identifiant, 404 s'il n'existe pas
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!vehiculeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        vehiculeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
