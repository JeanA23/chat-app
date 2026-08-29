package com.jeananani.chatapp.services;

import com.jeananani.chatapp.models.User;
import com.jeananani.chatapp.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final String[] colors = {"#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"};

    public User createOrGetUser(String username) {

        var existingUser = userRepository.findByUsername(username);

        if (existingUser.isPresent()) {

            var user = existingUser.get();
            user.setOnline(true);
            user.setLastSeen(LocalDateTime.now());

            return userRepository.save(user);
        }
        var randomColor = colors[new Random().nextInt(colors.length)];
        var newUser = new User(username, randomColor);
        newUser.setOnline(true);

        return userRepository.save(newUser);
    }

    public User findUserByUsername(String username) {

        return userRepository.findByUsername(username).orElse(null);
    }

    public List<User> getOnlineUsers() {

        return userRepository.findByIsOnlineTrue();
    }

    public void setUsersOffline(User user) {

        user.setOnline(false);
        userRepository.save(user);
    }

    public boolean existsByUsername(String username) {

        return userRepository.existsByUsername(username);
    }
}
