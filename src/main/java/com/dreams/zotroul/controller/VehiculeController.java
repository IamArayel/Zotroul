package com.dreams.zotroul.controller;

import com.dreams.zotroul.model.Vehicule;
import com.dreams.zotroul.repository.VehiculeRepository;
import io.swagger.v3.oas.annotations.Operation;
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
    @Operation(summary = "Lister les vehicules", description = "Retourne la liste de tous les vehicules.")
    @GetMapping
    public List<Vehicule> getAll() {
        return vehiculeRepository.findAll();
    }

    // Retourne un véhicule par son identifiant, 404 s'il n'existe pas
    @Operation(summary = "Recuperer un vehicule", description = "Retourne un vehicule a partir de son identifiant.")
    @GetMapping("/{id}")
    public ResponseEntity<Vehicule> getById(@PathVariable Long id) {
        return vehiculeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Rechercher des vehicules par commune", description = "Retourne les vehicules d'une commune.")
    @GetMapping("/commune/{commune}")
    public ResponseEntity<List<Vehicule>> getByCommune(@PathVariable String commune) {
        List<Vehicule> vehicules = vehiculeRepository.findAllByCommuneIgnoreCase(commune);
        return ResponseEntity.ok(vehicules);
    }

    // Crée un nouveau véhicule et retourne 201 avec la ressource créée
    @Operation(summary = "Creer un vehicule", description = "Cree un nouveau vehicule avec les donnees envoyees.")
    @PostMapping
    public ResponseEntity<Vehicule> create(@RequestBody Vehicule vehicule) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehiculeRepository.save(vehicule));
    }

    // Met à jour un véhicule existant, 404 s'il n'existe pas
    @Operation(summary = "Modifier un vehicule", description = "Met a jour un vehicule existant a partir de son identifiant.")
    @PutMapping("/{id}")
    public ResponseEntity<Vehicule> update(@PathVariable Long id, @RequestBody Vehicule vehicule) {
        if (!vehiculeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        vehicule.setId(id);
        return ResponseEntity.ok(vehiculeRepository.save(vehicule));
    }

    // Supprime un véhicule par son identifiant, 404 s'il n'existe pas
    @Operation(summary = "Supprimer un vehicule", description = "Supprime un vehicule a partir de son identifiant.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!vehiculeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        vehiculeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
