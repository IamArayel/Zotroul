package com.dreams.zotroul.controller;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dreams.zotroul.model.Velo;
import com.dreams.zotroul.repository.VeloRepository;

@RestController
@RequestMapping("/velos")
public class VeloController {

    private final VeloRepository veloRepository;

    public VeloController(VeloRepository veloRepository) {
        this.veloRepository = veloRepository;
    }

    @Operation(summary = "Lister les velos", description = "Retourne la liste complete des velos.")
    @GetMapping
    public List<Velo> getAll() {
        return veloRepository.findAll();
    }

    @Operation(summary = "Recuperer un velo", description = "Retourne un velo a partir de son identifiant.")
    @GetMapping("/{id}")
    public ResponseEntity<Velo> getById(@PathVariable Long id) {
        return veloRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Creer un velo", description = "Cree un nouveau velo avec les donnees envoyees.")
    @PostMapping
    public ResponseEntity<Velo> create(@RequestBody Velo velo) {
        velo.setId(null);
        Velo saved = veloRepository.save(velo);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @Operation(summary = "Modifier un velo", description = "Met a jour un velo existant a partir de son identifiant.")
    @PutMapping("/{id}")
    public ResponseEntity<Velo> update(@PathVariable Long id, @RequestBody Velo velo) {
        if (!veloRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        velo.setId(id);
        Velo updated = veloRepository.save(velo);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Supprimer un velo", description = "Supprime un velo a partir de son identifiant.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!veloRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        veloRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
