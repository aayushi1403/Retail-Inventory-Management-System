package com.hcl.RetailManagement.security;

import com.hcl.RetailManagement.entity.User;
import com.hcl.RetailManagement.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new UsernameNotFoundException("Email or User ID cannot be empty");
        }

        String cleaned = identifier.trim();
        if (cleaned.startsWith("#")) {
            cleaned = cleaned.substring(1).trim();
        }

        User user = null;
        if (cleaned.matches("\\d+")) {
            try {
                user = userRepository.findById(Integer.parseInt(cleaned)).orElse(null);
            } catch (Exception ignored) {
            }
        }

        if (user == null) {
            user = userRepository.findByEmail(cleaned.toLowerCase())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + identifier));
        }

        return new CustomUserDetails(user);
    }
}
