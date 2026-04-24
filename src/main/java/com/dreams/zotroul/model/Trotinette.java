package com.dreams.zotroul.model;

import jakarta.persistence.Entity;

@Entity
public class Trotinette extends Vehicule {

    private boolean panier;

    public Trotinette() {
        super();
    }

    public boolean isPanier() {
        return panier;
    }

    public void setPanier(boolean panier) {
        this.panier = panier;
    }

}
