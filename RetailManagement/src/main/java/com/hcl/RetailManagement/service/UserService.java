package com.hcl.RetailManagement.service;




import com.hcl.RetailManagement.entity.User;
import com.hcl.RetailManagement.repository.RoleRepository;
import com.hcl.RetailManagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    // CREATE
    public User createUser(User user) {
        if (user.getRole() != null) {
            if (user.getRole().getRoleId() != null) {
                roleRepository.findById(user.getRole().getRoleId()).ifPresent(user::setRole);
            } else if (user.getRole().getRoleName() != null) {
                roleRepository.findByRoleNameIgnoreCase(user.getRole().getRoleName()).ifPresent(user::setRole);
            }
        }
        if (user.getStatus() == null || user.getStatus().trim().isEmpty()) {
            user.setStatus("ACTIVE");
        }
        if (user.getEmail() != null) {
            user.setEmail(user.getEmail().trim().toLowerCase());
        }
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

        if (userDetails.getRole() != null) {
            if (userDetails.getRole().getRoleId() != null) {
                roleRepository.findById(userDetails.getRole().getRoleId()).ifPresent(user::setRole);
            } else if (userDetails.getRole().getRoleName() != null) {
                roleRepository.findByRoleNameIgnoreCase(userDetails.getRole().getRoleName()).ifPresent(user::setRole);
            }
        }

        if (userDetails.getFirstName() != null) {
            user.setFirstName(userDetails.getFirstName());
        }
        if (userDetails.getLastName() != null) {
            user.setLastName(userDetails.getLastName());
        }
        if (userDetails.getEmail() != null) {
            user.setEmail(userDetails.getEmail().trim().toLowerCase());
        }
        if (userDetails.getPassword() != null && !userDetails.getPassword().trim().isEmpty()) {
            user.setPassword(userDetails.getPassword().trim());
        }
        if (userDetails.getPhone() != null) {
            user.setPhone(userDetails.getPhone());
        }
        if (userDetails.getStatus() != null) {
            user.setStatus(userDetails.getStatus());
        }

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
