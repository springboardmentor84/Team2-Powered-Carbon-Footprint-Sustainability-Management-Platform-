package com.ecotrack.backend.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserDetailsService userDetailsService
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String requestPath = request.getServletPath();

        // Public authentication endpoints
        if (requestPath.startsWith("/api/v1/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");

        // No token present
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            System.out.println(
                    "[JWT] No Bearer token received for: "
                            + request.getMethod()
                            + " "
                            + requestPath
            );

            filterChain.doFilter(request, response);
            return;
        }

        try {

            String jwt = authHeader.substring(7).trim();

            System.out.println(
                    "[JWT] Token received for: "
                            + request.getMethod()
                            + " "
                            + requestPath
            );

            if (jwt.isBlank()) {
                sendErrorResponse(
                        response,
                        "JWT token is empty"
                );
                return;
            }

            String userEmail =
                    jwtService.extractUsername(jwt);

            System.out.println(
                    "[JWT] Username extracted from token: "
                            + userEmail
            );

            if (userEmail == null || userEmail.isBlank()) {

                sendErrorResponse(
                        response,
                        "JWT token does not contain a username"
                );

                return;
            }

            if (SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(userEmail);

                System.out.println(
                        "[JWT] User found in database: "
                                + userDetails.getUsername()
                );

                boolean tokenValid =
                        jwtService.isTokenValid(
                                jwt,
                                userDetails
                        );

                System.out.println(
                        "[JWT] Token valid: "
                                + tokenValid
                );

                if (!tokenValid) {

                    sendErrorResponse(
                            response,
                            "JWT token validation failed"
                    );

                    return;
                }

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authToken);

                System.out.println(
                        "[JWT] Authentication successful for: "
                                + userEmail
                );
            }

        } catch (Exception ex) {

            System.err.println(
                    "[JWT] AUTHENTICATION FAILED"
            );

            System.err.println(
                    "[JWT] Exception type: "
                            + ex.getClass().getName()
            );

            System.err.println(
                    "[JWT] Exception message: "
                            + ex.getMessage()
            );

            ex.printStackTrace();

            SecurityContextHolder.clearContext();

            sendErrorResponse(
                    response,
                    "JWT authentication failed: "
                            + ex.getMessage()
            );

            return;
        }

        filterChain.doFilter(
                request,
                response
        );
    }

    private void sendErrorResponse(
            HttpServletResponse response,
            String message
    ) throws IOException {

        response.setStatus(
                HttpServletResponse.SC_UNAUTHORIZED
        );

        response.setContentType(
                "application/json"
        );

        response.setCharacterEncoding(
                "UTF-8"
        );

        response.getWriter().write(
                "{\"error\":\"Unauthorized\",\"message\":\""
                        + escapeJson(message)
                        + "\"}"
        );
    }

    private String escapeJson(
            String value
    ) {

        if (value == null) {
            return "Unknown authentication error";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }
}