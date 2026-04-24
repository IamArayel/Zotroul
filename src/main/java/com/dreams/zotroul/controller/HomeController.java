package com.dreams.zotroul.controller;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/")  // Route racine
public class HomeController {

    // GET / affiche un message de bienvenue
    @Operation(summary = "Afficher l'accueil", description = "Retourne un message de bienvenue et les informations principales de l'API.")
    @GetMapping
    public ResponseEntity<Map<String, String>> home() {
        return ResponseEntity.ok(Map.of(
            "message", "Bienvenue sur Zotroul",
            "description", "Plateforme de Gestion de Mobilité Urbaine Partagée",
            "version", "1.0.0"
        ));
    }
}
