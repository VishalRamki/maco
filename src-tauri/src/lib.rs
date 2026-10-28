
use std::{
    io,
    process::Command,
    sync::Mutex,
    time::Duration,
};

use tauri::{Manager, RunEvent};
use tauri_kit_sidecar::{Output, Sidecar};

#[cfg(target_os = "linux")]
use std::os::unix::process::CommandExt;

struct Go2RtcState(Mutex<Option<Sidecar>>);

fn go2rtc_path(
    app: &tauri::AppHandle,
) -> tauri::Result<std::path::PathBuf> {
    let filename = if cfg!(target_os = "windows") {
        "go2rtc.exe"
    } else {
        "go2rtc"
    };

    Ok(app.path().resource_dir()?.join(filename))
}

fn start_go2rtc(
    app: &tauri::AppHandle,
) -> io::Result<Sidecar> {
    let path = go2rtc_path(app)
        .map_err(|e| io::Error::other(e.to_string()))?;

    if !path.is_file() {
        return Err(io::Error::new(
            io::ErrorKind::NotFound,
            format!(
                "go2rtc executable not found: {}",
                path.display()
            ),
        ));
    }

    let mut command = Command::new(&path);

    // Add any go2rtc arguments here:
    // command.arg("-config").arg(config_path);

    #[cfg(target_os = "linux")]
    {
        // Linux PDEATHSIG is associated with the thread that
        // creates the child, not merely the parent process.
        let expected_parent = unsafe { libc::getpid() };

        unsafe {
            command.pre_exec(move || {
                // Install the signal before checking the parent.
                // This ordering closes the parent-exits-before-setup
                // race.
                if libc::prctl(
                    libc::PR_SET_PDEATHSIG,
                    libc::SIGKILL,
                ) != 0
                {
                    return Err(io::Error::last_os_error());
                }

                // If the parent died before prctl was installed,
                // getppid() will no longer match.
                if libc::getppid() != expected_parent {
                    return Err(io::Error::new(
                        io::ErrorKind::BrokenPipe,
                        "Tauri parent exited before go2rtc started",
                    ));
                }

                Ok(())
            });
        }
    }

    // tauri_kit_sidecar manages the process tree:
    // Windows: Job Object with kill-on-job-close.
    // Unix: dedicated process group for explicit shutdown.
    Sidecar::spawn(command, Output::Discard)
}

fn stop_go2rtc(app: &tauri::AppHandle) {
    let sidecar = match app.try_state::<Go2RtcState>() {
        Some(state) => state
            .0
            .lock()
            .ok()
            .and_then(|mut guard| guard.take()),
        None => None,
    };

    if let Some(sidecar) = sidecar {
        match sidecar.shutdown(Duration::from_secs(2)) {
            Ok(_) => println!("[Tauri] go2rtc stopped"),
            Err(err) => {
                eprintln!("[Tauri] Error stopping go2rtc: {err}");
            }
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let sidecar = start_go2rtc(app.handle())?;

            println!(
                "[Tauri] go2rtc started with PID {}",
                sidecar.id()
            );

            app.manage(Go2RtcState(Mutex::new(Some(sidecar))));

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building Tauri application")
        .run(|app_handle, event| {
            if matches!(event, RunEvent::Exit) {
                stop_go2rtc(app_handle);
            }
        });
}
