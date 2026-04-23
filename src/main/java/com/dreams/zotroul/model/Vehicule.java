package com.dreams.zotroul.model;

import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Vehicule {

    @Id
    @GeneratedValue
    private Long id;

    private Float etat_batterie;

    private String commune;

    @OneToMany(mappedBy = "vehicule")
    private Set<Session> sessions; 


    public Vehicule() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Float getEtat_batterie() {
        return etat_batterie;
    }

    public void setEtat_batterie(Float etat_batterie) {
        this.etat_batterie = etat_batterie;
    }

    public String getCommune() {
        return commune;
    }

    public void setCommune(String commune) {
        this.commune = commune;
    }


    

}
