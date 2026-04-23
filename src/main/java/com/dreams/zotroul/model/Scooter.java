package com.dreams.zotroul.model;

import jakarta.persistence.Entity;

@Entity
public class Scooter extends Vehicule {
    private boolean panier;

    public Scooter() {
        super();
    }

    public boolean isPanier() {
        return panier;
    }

    public void setPanier(boolean panier) {
        this.panier = panier;
    }

}
