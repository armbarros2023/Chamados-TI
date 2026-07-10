package com.arbtechinfo.chamadosti;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class SecureSessionPluginTest {
    @Test
    public void acceptsOnlyExpectedRefreshTokenFormat() {
        assertTrue(SecureSessionPlugin.isValidRefreshToken("A".repeat(64)));
        assertTrue(SecureSessionPlugin.isValidRefreshToken("a1_-".repeat(16)));
        assertFalse(SecureSessionPlugin.isValidRefreshToken(null));
        assertFalse(SecureSessionPlugin.isValidRefreshToken("short"));
        assertFalse(SecureSessionPlugin.isValidRefreshToken("A".repeat(63) + "!"));
    }
}
