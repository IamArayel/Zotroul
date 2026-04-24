package com.dreams.zotroul.controller;

import java.util.List;

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

    @GetMapping
    public List<Velo> getAll() {
        return veloRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Velo> getById(@PathVariable Long id) {
        return veloRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Velo> create(@RequestBody Velo velo) {
        velo.setId(null);
        Velo saved = veloRepository.save(velo);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Velo> update(@PathVariable Long id, @RequestBody Velo velo) {
        if (!veloRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        velo.setId(id);
        Velo updated = veloRepository.save(velo);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!veloRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        veloRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}