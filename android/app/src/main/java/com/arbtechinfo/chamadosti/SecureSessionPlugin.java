package com.arbtechinfo.chamadosti;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.security.KeyStore;
import java.util.regex.Pattern;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

@CapacitorPlugin(name = "SecureSession")
public class SecureSessionPlugin extends Plugin {
    private static final String KEYSTORE = "AndroidKeyStore";
    private static final String KEY_ALIAS = "chamados_ti_refresh_token";
    private static final String PREFERENCES = "secure_session";
    private static final String CIPHERTEXT = "refresh_token_ciphertext";
    private static final String IV = "refresh_token_iv";
    private static final Pattern TOKEN_PATTERN = Pattern.compile("^[A-Za-z0-9_-]{64}$");

    static boolean isValidRefreshToken(String value) {
        return value != null && TOKEN_PATTERN.matcher(value).matches();
    }

    @PluginMethod
    public void save(PluginCall call) {
        String refreshToken = call.getString("refreshToken");
        if (!isValidRefreshToken(refreshToken)) {
            call.reject("Token de sessão inválido.");
            return;
        }

        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey());
            byte[] encrypted = cipher.doFinal(refreshToken.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            preferences().edit()
                .putString(CIPHERTEXT, Base64.encodeToString(encrypted, Base64.NO_WRAP))
                .putString(IV, Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP))
                .apply();
            call.resolve();
        } catch (Exception exception) {
            call.reject("Não foi possível proteger a sessão no dispositivo.");
        }
    }

    @PluginMethod
    public void load(PluginCall call) {
        String encryptedValue = preferences().getString(CIPHERTEXT, null);
        String ivValue = preferences().getString(IV, null);
        JSObject result = new JSObject();
        if (encryptedValue == null || ivValue == null) {
            call.resolve(result);
            return;
        }

        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(
                Cipher.DECRYPT_MODE,
                getOrCreateKey(),
                new GCMParameterSpec(128, Base64.decode(ivValue, Base64.NO_WRAP))
            );
            String refreshToken = new String(
                cipher.doFinal(Base64.decode(encryptedValue, Base64.NO_WRAP)),
                java.nio.charset.StandardCharsets.UTF_8
            );
            if (isValidRefreshToken(refreshToken)) result.put("refreshToken", refreshToken);
            else preferences().edit().clear().apply();
        } catch (Exception exception) {
            preferences().edit().clear().apply();
        }
        call.resolve(result);
    }

    @PluginMethod
    public void clear(PluginCall call) {
        preferences().edit().clear().apply();
        call.resolve();
    }

    private SharedPreferences preferences() {
        return getContext().getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE);
    }

    private SecretKey getOrCreateKey() throws Exception {
        KeyStore keyStore = KeyStore.getInstance(KEYSTORE);
        keyStore.load(null);
        if (keyStore.containsAlias(KEY_ALIAS)) {
            return ((KeyStore.SecretKeyEntry) keyStore.getEntry(KEY_ALIAS, null)).getSecretKey();
        }

        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE);
        generator.init(new KeyGenParameterSpec.Builder(
            KEY_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setRandomizedEncryptionRequired(true)
            .build());
        return generator.generateKey();
    }
}
