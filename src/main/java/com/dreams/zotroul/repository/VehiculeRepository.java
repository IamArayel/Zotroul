package com.dreams.zotroul.repository;

import com.dreams.zotroul.model.Vehicule;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VehiculeRepository extends JpaRepository<Vehicule, Long> {

    List<Vehicule> findAllByCommuneIgnoreCase(String commune);

}
