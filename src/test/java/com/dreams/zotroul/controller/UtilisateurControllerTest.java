package com.dreams.zotroul.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;
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

    // ──────────────── helper ────────────────

    private Utilisateur utilisateur(Long id, String username, String tel) {
        Utilisateur u = new Utilisateur();
        u.setId(id);
        u.setUsername(username);
        u.setNumeroTelephone(tel);
        return u;
    }

    // ──────────────── GET /utilisateurs ────────────────

    @Test
    void getAll_retourne_200_avec_liste() throws Exception {
        when(repo.findAll()).thenReturn(List.of(
                utilisateur(1L, "alice", "0600000001"),
                utilisateur(2L, "bob",   "0600000002")));

        mvc.perform(get("/utilisateurs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].username").value("alice"))
            .andExpect(jsonPath("$[1].username").value("bob"));
    }

    // ──────────────── GET /utilisateurs/{id} ────────────────

    @Test
    void getById_retourne_200_si_trouve() throws Exception {
        when(repo.findById(1L)).thenReturn(Optional.of(utilisateur(1L, "alice", "0600000001")));

        mvc.perform(get("/utilisateurs/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.username").value("alice"));
    }

    @Test
    void getById_retourne_404_si_non_trouve() throws Exception {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        mvc.perform(get("/utilisateurs/99"))
            .andExpect(status().isNotFound());
    }

    // ──────────────── GET /utilisateurs/username/{username} ────────────────

    @Test
    void getByUsername_retourne_200_avec_utilisateurs_trouves() throws Exception {
        when(repo.findAllByUsernameIgnoreCase("alice"))
                .thenReturn(List.of(utilisateur(1L, "alice", "0600000001")));

        mvc.perform(get("/utilisateurs/username/alice"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].username").value("alice"));
    }

    @Test
    void getByUsername_retourne_404_si_aucun_resultat() throws Exception {
        when(repo.findAllByUsernameIgnoreCase("inconnu")).thenReturn(List.of());

        mvc.perform(get("/utilisateurs/username/inconnu"))
            .andExpect(status().isNotFound());
    }

    // ──────────────── POST /utilisateurs ────────────────

    @Test
    void create_retourne_201_avec_utilisateur_valide() throws Exception {
        Utilisateur saved = utilisateur(10L, "newuser", "0600000000");
        when(repo.existsByNumeroTelephone("0600000000")).thenReturn(false);
        when(repo.save(any())).thenReturn(saved);

        mvc.perform(post("/utilisateurs")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"newuser\",\"numeroTelephone\":\"0600000000\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(10))
            .andExpect(jsonPath("$.username").value("newuser"))
            .andExpect(jsonPath("$.numeroTelephone").value("0600000000"));
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
                .content("{\"username\":\"\",\"numeroTelephone\":\"0600000000\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void create_retourne_400_si_numeroTelephone_absent() throws Exception {
        mvc.perform(post("/utilisateurs")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"alice\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void create_retourne_400_si_numeroTelephone_vide() throws Exception {
        mvc.perform(post("/utilisateurs")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"alice\",\"numeroTelephone\":\"\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void create_retourne_409_si_numeroTelephone_deja_utilise() throws Exception {
        when(repo.existsByNumeroTelephone("0600000000")).thenReturn(true);

        mvc.perform(post("/utilisateurs")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"alice\",\"numeroTelephone\":\"0600000000\"}"))
            .andExpect(status().isConflict());
    }

    // ──────────────── PUT /utilisateurs/{id} ────────────────

    @Test
    void update_retourne_200_et_modifie_username() throws Exception {
        Utilisateur existing = utilisateur(1L, "alice", "0123456789");
        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        mvc.perform(put("/utilisateurs/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"alice-updated\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("alice-updated"));
    }

    @Test
    void update_preserve_numeroTelephone_si_non_fourni() throws Exception {
        Utilisateur existing = utilisateur(1L, "alice", "0123456789");
        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        mvc.perform(put("/utilisateurs/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"alice-updated\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("alice-updated"))
            .andExpect(jsonPath("$.numeroTelephone").value("0123456789"));
    }

    @Test
    void update_modifie_numeroTelephone_si_disponible() throws Exception {
        Utilisateur existing = utilisateur(1L, "alice", "0123456789");
        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.existsByNumeroTelephoneAndIdNot("0700000000", 1L)).thenReturn(false);
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        mvc.perform(put("/utilisateurs/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"numeroTelephone\":\"0700000000\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.numeroTelephone").value("0700000000"));
    }

    @Test
    void update_retourne_409_si_telephone_deja_utilise_par_un_autre() throws Exception {
        Utilisateur existing = utilisateur(1L, "alice", "0123456789");
        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.existsByNumeroTelephoneAndIdNot("0700000000", 1L)).thenReturn(true);

        mvc.perform(put("/utilisateurs/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"numeroTelephone\":\"0700000000\"}"))
            .andExpect(status().isConflict());
    }

    @Test
    void update_retourne_404_si_utilisateur_inexistant() throws Exception {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        mvc.perform(put("/utilisateurs/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"ghost\"}"))
            .andExpect(status().isNotFound());
    }

    // ──────────────── DELETE /utilisateurs/{id} ────────────────

    @Test
    void delete_retourne_204_apres_suppression() throws Exception {
        when(repo.existsById(1L)).thenReturn(true);

        mvc.perform(delete("/utilisateurs/1"))
            .andExpect(status().isNoContent());

        verify(repo).deleteById(1L);
    }

    @Test
    void delete_retourne_404_si_utilisateur_inexistant() throws Exception {
        when(repo.existsById(99L)).thenReturn(false);

        mvc.perform(delete("/utilisateurs/99"))
            .andExpect(status().isNotFound());
    }
}
