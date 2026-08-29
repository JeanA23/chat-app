package com.jeananani.chatapp.repositories;

import com.jeananani.chatapp.models.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    //Récupère a liste des 50 derniers messages
    List<Message> findTop50ByOrderByTimestampDesc();

    //Rend les messages en ordre croissant
    List<Message> findAllByOrderByTimestampAsc();
}
