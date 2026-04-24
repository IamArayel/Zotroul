package com.dreams.zotroul.model;

import jakarta.persistence.Entity;

@Entity
public class Velo extends Vehicule {

    private Boolean porteBagage;

    public Velo() {
        super();
    }

    public Boolean getPorteBagage() {
        return porteBagage;
    }

    public void setPorteBagage(Boolean porteBagage) {
        this.porteBagage = porteBagage;
    }

    

}
