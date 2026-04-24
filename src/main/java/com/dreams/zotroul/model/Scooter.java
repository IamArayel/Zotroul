package com.dreams.zotroul.model;

import jakarta.persistence.Entity;

@Entity
public class Scooter extends Vehicule {
    private boolean coffre;

    public Scooter() {
        super();
    }

    public boolean isCoffre() {
        return coffre;
    }

    public void setCoffre(boolean coffre) {
        this.coffre = coffre;
    }

}
