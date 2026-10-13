package com.hcl.RetailManagement.service;




import com.hcl.RetailManagement.entity.User;
import com.hcl.RetailManagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // CREATE
    public User createUser(User user) {
        return userRepository.save(user);
    }

    // GET ALL
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // GET BY ID
    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    // GET BY EMAIL
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // UPDATE
    public User updateUser(Integer id, User userDetails) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(userDetails.getRole());
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setEmail(userDetails.getEmail());
        user.setPassword(userDetails.getPassword());
        user.setPhone(userDetails.getPhone());
        user.setStatus(userDetails.getStatus());

        return userRepository.save(user);
    }

    // DELETE
    public void deleteUser(Integer id) {

        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }

        userRepository.deleteById(id);
    }
}
