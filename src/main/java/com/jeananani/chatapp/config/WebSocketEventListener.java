package com.jeananani.chatapp.config;

import com.jeananani.chatapp.models.Message;
import com.jeananani.chatapp.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.socket.messaging.SessionConnectedEvent;

import java.util.Objects;

@Configuration
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final UserService userService;
    private final SimpMessageSendingOperations messagingTemplate;


    @EventListener
    public void handleWebSocketDisconnectListener(SessionConnectedEvent event) {

        var headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        var username = Objects.requireNonNull(headerAccessor.getSessionAttributes()).get("username").toString();

        if (Objects.nonNull(username)) {

            var user = userService.findUserByUsername(username);
            userService.setUsersOffline(user);

            var leaveMessage = new Message();
            leaveMessage.setType(Message.MessageType.LEAVE);
            leaveMessage.setSender(user);

            messagingTemplate.convertAndSend("/topic/public", leaveMessage);
        }


        userService.getOnlineUsers().forEach(user -> messagingTemplate.convertAndSend("/topic/users", user));
    }
}
