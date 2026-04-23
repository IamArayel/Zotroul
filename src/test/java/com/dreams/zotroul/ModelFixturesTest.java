package com.dreams.zotroul;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import com.dreams.zotroul.model.Session;
import com.dreams.zotroul.model.Utilisateur;
import com.dreams.zotroul.model.Vehicule;

@SpringBootTest
public class ModelFixturesTest {

    @PersistenceContext
    private EntityManager entityManager;

    @Test
    void testFixturesLoaded() {
        List<Utilisateur> utilisateurs = entityManager
            .createQuery("SELECT u FROM Utilisateur u", Utilisateur.class)
            .getResultList();
        assertThat(utilisateurs).hasSize(3);

        List<Vehicule> vehicules = entityManager
            .createQuery("SELECT v FROM Vehicule v", Vehicule.class)
            .getResultList();
        assertThat(vehicules).hasSize(3);

        List<Session> sessions = entityManager
            .createQuery("SELECT s FROM Session s", Session.class)
            .getResultList();
        assertThat(sessions).hasSize(3);
    }
}