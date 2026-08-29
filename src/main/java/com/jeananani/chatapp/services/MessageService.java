package com.jeananani.chatapp.services;

import com.jeananani.chatapp.models.Message;
import com.jeananani.chatapp.repositories.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    public Message saveMessage(Message message) {

        return messageRepository.save(message);
    }

    public List<Message> getAllMessages() {

        return messageRepository.findAllByOrderByTimestampAsc();
    }

    public List<Message> getRecentMessages() {

        return messageRepository.findTop50ByOrderByTimestampDesc();
    }
}
