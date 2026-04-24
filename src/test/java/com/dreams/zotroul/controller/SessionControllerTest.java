package com.dreams.zotroul.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Date;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.dreams.zotroul.model.Session;
import com.dreams.zotroul.model.Utilisateur;
import com.dreams.zotroul.model.Vehicule;
import com.dreams.zotroul.repository.SessionRepository;

@WebMvcTest(SessionController.class)
class SessionControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private SessionRepository sessionRepository;

    // ──────────────── helpers ────────────────

    private Utilisateur utilisateur(Long id, String username) {
        Utilisateur u = new Utilisateur();
        u.setId(id);
        u.setUsername(username);
        return u;
    }

    private Vehicule vehicule(Long id, String commune) {
        Vehicule v = new Vehicule();
        v.setId(id);
        v.setCommune(commune);
        v.setEtatBatterie(80.0f);
        return v;
    }

    private Session session(Long id, Double prix, Utilisateur u, Vehicule v) {
        Session s = new Session();
        s.setId(id);
        s.setDateDebut(new Date(1704067200000L)); // 2024-01-01
        s.setDateFin(new Date(1704153600000L));   // 2024-01-02
        s.setPrix(prix);
        s.setUtilisateur(u);
        s.setVehicule(v);
        return s;
    }

    // ──────────────── tests de création ────────────────

    @Test
    void create_retourne_201_avec_session_complete() throws Exception {
        Session saved = session(1L, 29.99, utilisateur(1L, "alice"), vehicule(2L, "Paris"));
        when(sessionRepository.save(any())).thenReturn(saved);

        mvc.perform(post("/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "dateDebut": 1704067200000,
                          "dateFin":   1704153600000,
                          "prix":      29.99,
                          "utilisateur": {"id": 1, "username": "alice"},
                          "vehicule":    {"id": 2, "commune": "Paris", "etatBatterie": 80.0}
                        }
                        """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.prix").value(29.99))
            .andExpect(jsonPath("$.utilisateur.id").value(1))
            .andExpect(jsonPath("$.vehicule.id").value(2));
    }

    @Test
    void create_retourne_201_sans_prix() throws Exception {
        Session saved = session(2L, null, utilisateur(1L, "bob"), vehicule(3L, "Lyon"));
        saved.setPrix(null);
        when(sessionRepository.save(any())).thenReturn(saved);

        mvc.perform(post("/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "dateDebut": 1704067200000,
                          "dateFin":   1704153600000,
                          "utilisateur": {"id": 1, "username": "bob"},
                          "vehicule":    {"id": 3, "commune": "Lyon", "etatBatterie": 50.0}
                        }
                        """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(2))
            .andExpect(jsonPath("$.prix").doesNotExist());
    }

    @Test
    void create_retourne_201_sans_dates() throws Exception {
        Session saved = new Session();
        saved.setId(3L);
        saved.setPrix(15.0);
        saved.setUtilisateur(utilisateur(1L, "carol"));
        saved.setVehicule(vehicule(1L, "Marseille"));
        when(sessionRepository.save(any())).thenReturn(saved);

        mvc.perform(post("/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "prix": 15.0,
                          "utilisateur": {"id": 1, "username": "carol"},
                          "vehicule":    {"id": 1, "commune": "Marseille", "etatBatterie": 60.0}
                        }
                        """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(3))
            .andExpect(jsonPath("$.dateDebut").doesNotExist())
            .andExpect(jsonPath("$.dateFin").doesNotExist());
    }

    @Test
    void create_retourne_session_avec_id_genere_par_la_base() throws Exception {
        Session saved = session(42L, 9.99, utilisateur(5L, "dave"), vehicule(7L, "Bordeaux"));
        when(sessionRepository.save(any())).thenReturn(saved);

        mvc.perform(post("/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "dateDebut": 1704067200000,
                          "dateFin":   1704153600000,
                          "prix":      9.99,
                          "utilisateur": {"id": 5, "username": "dave"},
                          "vehicule":    {"id": 7, "commune": "Bordeaux", "etatBatterie": 90.0}
                        }
                        """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(42));
    }

    @Test
    void create_retourne_utilisateur_et_vehicule_dans_la_reponse() throws Exception {
        Session saved = session(5L, 50.0, utilisateur(3L, "eve"), vehicule(6L, "Nantes"));
        when(sessionRepository.save(any())).thenReturn(saved);

        mvc.perform(post("/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "dateDebut": 1704067200000,
                          "dateFin":   1704153600000,
                          "prix":      50.0,
                          "utilisateur": {"id": 3, "username": "eve"},
                          "vehicule":    {"id": 6, "commune": "Nantes", "etatBatterie": 70.0}
                        }
                        """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.utilisateur.username").value("eve"))
            .andExpect(jsonPath("$.vehicule.commune").value("Nantes"));
    }

    @Test
    void create_retourne_dates_dans_la_reponse() throws Exception {
        Session saved = session(6L, 20.0, utilisateur(1L, "frank"), vehicule(1L, "Nice"));
        when(sessionRepository.save(any())).thenReturn(saved);

        mvc.perform(post("/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "dateDebut": 1704067200000,
                          "dateFin":   1704153600000,
                          "prix":      20.0,
                          "utilisateur": {"id": 1, "username": "frank"},
                          "vehicule":    {"id": 1, "commune": "Nice", "etatBatterie": 75.0}
                        }
                        """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.dateDebut").value("2024-01-01T00:00:00.000Z"))
            .andExpect(jsonPath("$.dateFin").value("2024-01-02T00:00:00.000Z"));
    }
}
