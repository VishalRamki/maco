use tauri_plugin_shell::ShellExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Spawn the go2rtc sidecar process on app boot
      match app.shell().sidecar("go2rtc") {
        Ok(cmd) => {
          match cmd.spawn() {
            Ok((_rx, _child)) => {
              println!("[Tauri] go2rtc sidecar started successfully on port 1984");
            }
            Err(err) => {
              eprintln!("[Tauri] Failed to spawn go2rtc sidecar: {:?}", err);
            }
          }
        }
        Err(err) => {
          eprintln!("[Tauri] Could not locate go2rtc sidecar: {:?}", err);
        }
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}