#[cfg(target_os = "linux")]
fn main() {
    use std::os::unix::process::CommandExt;
    use std::process::Command;

    // This executable is launched by the Tauri application.
    // Capture its parent before installing the parent-death signal.
    let parent_pid = unsafe { libc::getppid() };

    unsafe {
        // Ask Linux to kill this launcher if its parent dies.
        if libc::prctl(libc::PR_SET_PDEATHSIG, libc::SIGKILL) != 0 {
            eprintln!("Failed to configure parent-death signal");
            std::process::exit(1);
        }

        // Close the race where the parent dies before prctl().
        if libc::getppid() != parent_pid {
            std::process::exit(1);
        }
    }

    let executable = std::env::var_os("GO2RTC_EXECUTABLE").expect("GO2RTC_EXECUTABLE is required");

    let error = Command::new(executable)
        .args(std::env::args_os().skip(1))
        .exec();

    eprintln!("Failed to exec go2rtc: {error}");
    std::process::exit(1);
}

#[cfg(not(target_os = "linux"))]
fn main() {
    eprintln!("This launcher is intended for Linux only");
    std::process::exit(1);
}
