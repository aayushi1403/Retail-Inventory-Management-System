package com.hcl.RetailManagement.security;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenRevocationService {

    // Store revoked tokens with their expiration dates
    private final Map<String, Date> revokedTokens = new ConcurrentHashMap<>();

    private final JwtService jwtService;

    public TokenRevocationService(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public void revokeToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return;
        }
        if (token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }

        try {
            Date expiration = jwtService.extractExpiration(token);
            revokedTokens.put(token, expiration);
        } catch (Exception e) {
            // If already expired or unparseable, store with short duration
            revokedTokens.put(token, new Date(System.currentTimeMillis() + 60000));
        }
    }

    public boolean isRevoked(String token) {
        if (token == null) return false;
        if (token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }
        return revokedTokens.containsKey(token);
    }

    // Clean up expired tokens from revocation store every hour to prevent memory growth
    @Scheduled(fixedRate = 3600000)
    public void cleanupExpiredRevocations() {
        Date now = new Date();
        revokedTokens.entrySet().removeIf(entry -> entry.getValue().before(now));
    }
}
