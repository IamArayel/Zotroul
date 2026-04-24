package com.dreams.zotroul.controller;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
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

import com.dreams.zotroul.model.Trotinette;
import com.dreams.zotroul.repository.TrotinetteRepository;

@RestController
@RequestMapping("/trotinettes")
public class TrotinetteController {

    private final TrotinetteRepository trotinetteRepository;

    public TrotinetteController(TrotinetteRepository trotinetteRepository) {
        this.trotinetteRepository = trotinetteRepository;
    }

    // Cette route GET /trotinettes recupere toutes les trotinettes.
    @Operation(summary = "Lister les trotinettes", description = "Retourne la liste complete des trotinettes.")
    @GetMapping
    public List<Trotinette> getAll() {
        return trotinetteRepository.findAll();
    }

    // Cette route GET /trotinettes/{id} recupere une trotinette par son id.
    @Operation(summary = "Recuperer une trotinette", description = "Retourne une trotinette a partir de son identifiant.")
    @GetMapping("/{id}")
    public ResponseEntity<Trotinette> getById(@PathVariable Long id) {
        return trotinetteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cette route POST /trotinettes cree une nouvelle trotinette.
    @Operation(summary = "Creer une trotinette", description = "Cree une nouvelle trotinette avec les donnees envoyees.")
    @PostMapping
    public ResponseEntity<Trotinette> create(@RequestBody Trotinette trotinette) {
        trotinette.setId(null);
        Trotinette saved = trotinetteRepository.save(trotinette);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Cette route PUT /trotinettes/{id} met a jour une trotinette existante.
    @Operation(summary = "Modifier une trotinette", description = "Met a jour une trotinette existante a partir de son identifiant.")
    @PutMapping("/{id}")
    public ResponseEntity<Trotinette> update(@PathVariable Long id, @RequestBody Trotinette trotinette) {
        return trotinetteRepository.findById(id)
                .map(existingTrotinette -> {
                    existingTrotinette.setCommune(trotinette.getCommune());
                    existingTrotinette.setEtatBatterie(trotinette.getEtatBatterie());
                    existingTrotinette.setPanier(trotinette.isPanier());

                    Trotinette updated = trotinetteRepository.save(existingTrotinette);
                    return ResponseEntity.ok(updated);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cette route DELETE /trotinettes/{id} supprime une trotinette par son id.
    @Operation(summary = "Supprimer une trotinette", description = "Supprime une trotinette a partir de son identifiant.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!trotinetteRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        trotinetteRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
