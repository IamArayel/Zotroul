package com.dreams.zotroul.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import com.dreams.zotroul.model.Session;

public interface SessionRepository extends CrudRepository<Session, Long> {

    List<Session> findByUtilisateurId(Long id);

    List<Session> findByVehiculeId(Long id);

}
