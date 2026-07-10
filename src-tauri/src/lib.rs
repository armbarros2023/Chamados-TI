const KEYCHAIN_SERVICE: &str = "com.arbtechinfo.chamados-ti";
const KEYCHAIN_ACCOUNT: &str = "refresh-token";

fn is_valid_refresh_token(token: &str) -> bool {
    token.len() == 64
        && token
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || byte == b'_' || byte == b'-')
}

fn keychain_entry() -> Result<keyring::Entry, String> {
    keyring::Entry::new(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT)
        .map_err(|_| "Não foi possível acessar o Keychain.".to_string())
}

#[tauri::command]
fn save_refresh_token(refresh_token: String) -> Result<(), String> {
    if !is_valid_refresh_token(&refresh_token) {
        return Err("Formato de sessão inválido.".to_string());
    }
    keychain_entry()?
        .set_password(&refresh_token)
        .map_err(|_| "Não foi possível proteger a sessão no Keychain.".to_string())
}

#[tauri::command]
fn load_refresh_token() -> Result<Option<String>, String> {
    match keychain_entry()?.get_password() {
        Ok(token) if is_valid_refresh_token(&token) => Ok(Some(token)),
        Ok(_) => Err("A sessão protegida possui formato inválido.".to_string()),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(_) => Err("Não foi possível ler a sessão protegida.".to_string()),
    }
}

#[tauri::command]
fn clear_refresh_token() -> Result<(), String> {
    match keychain_entry()?.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(_) => Err("Não foi possível remover a sessão protegida.".to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            save_refresh_token,
            load_refresh_token,
            clear_refresh_token
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::is_valid_refresh_token;

    #[test]
    fn validates_only_the_expected_refresh_token_format() {
        assert!(is_valid_refresh_token(&"a".repeat(64)));
        assert!(is_valid_refresh_token(&format!("{}-_", "a".repeat(62))));
        assert!(!is_valid_refresh_token("short"));
        assert!(!is_valid_refresh_token(&format!("{}!", "a".repeat(63))));
    }
}
