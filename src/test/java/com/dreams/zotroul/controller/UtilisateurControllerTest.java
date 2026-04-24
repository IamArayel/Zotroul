package com.dreams.zotroul.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.dreams.zotroul.model.Utilisateur;
import com.dreams.zotroul.repository.UtilisateurRepository;

@WebMvcTest(UtilisateurController.class)
class UtilisateurControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private UtilisateurRepository repo;

    @Test
    void create_retourne_201_avec_utilisateur_valide() throws Exception {
        Utilisateur saved = utilisateur(10L, "newuser", "0600000000");
        when(repo.existsByUsername("newuser")).thenReturn(false);
        when(repo.save(any())).thenReturn(saved);

        mvc.perform(post("/utilisateurs")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"newuser\",\"numeroTelephone\":\"0600000000\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(10))
            .andExpect(jsonPath("$.username").value("newuser"));
    }

    @Test
    void create_retourne_400_si_username_absent() throws Exception {
        mvc.perform(post("/utilisateurs")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"numeroTelephone\":\"0600000000\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void create_retourne_400_si_username_vide() throws Exception {
        mvc.perform(post("/utilisateurs")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void create_retourne_409_si_username_duplique() throws Exception {
        when(repo.existsByUsername("alice")).thenReturn(true);

        mvc.perform(post("/utilisateurs")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"alice\"}"))
            .andExpect(status().isConflict());
    }

    @Test
    void update_preserve_numeroTelephone_si_non_fourni() throws Exception {
        Utilisateur existing = utilisateur(1L, "alice", "0123456789");
        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.existsByUsername("alice-updated")).thenReturn(false);
        // Retourne l'entité telle qu'elle est passée à save() pour vérifier son état réel
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        mvc.perform(put("/utilisateurs/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"alice-updated\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("alice-updated"))
            .andExpect(jsonPath("$.numeroTelephone").value("0123456789"));
    }

    private Utilisateur utilisateur(Long id, String username, String tel) {
        Utilisateur u = new Utilisateur();
        u.setId(id);
        u.setUsername(username);
        u.setNumeroTelephone(tel);
        return u;
    }
}
