package com.dreams.zotroul.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dreams.zotroul.model.Utilisateur;

/**
 * Repository Spring Data pour l'entité Utilisateur.
 * Hérite de JpaRepository pour fournir automatiquement les opérations CRUD.
 */
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    /**
     * Recherche un utilisateur par son username.
     * @param username nom d'utilisateur
     * @return Optional contenant l'utilisateur s'il existe
     */
    Optional<Utilisateur> findByUsername(String username);

    /**
     * Vérifie si un utilisateur existe déjà pour ce username.
     * @param username nom d'utilisateur
     * @return true si au moins un utilisateur existe avec ce username
     */
    boolean existsByUsername(String username);

    List<Utilisateur> findAllByUsernameIgnoreCase(String username);

    boolean existsByNumeroTelephone(String numeroTelephone);

    boolean existsByNumeroTelephoneAndIdNot(String numeroTelephone, Long id);
}