// Import SweetAlert2
import Swal from "sweetalert2"

// ── SUCCESS ALERT ─────────────────────────────────────────────────────────
// Use this when something works correctly
// Example: alert.success("Account created successfully!")

export const success = (message, title = "Success") => {
    return Swal.fire({
        icon: "success",
        title,
        text: message,
        confirmButtonText: "OK",
        confirmButtonColor: "#2563eb",
        timer: 3000,
        timerProgressBar: true,
    })
}

// ── ERROR ALERT ───────────────────────────────────────────────────────────
// Use this when something goes wrong
// Example: alert.error("Invalid email or password")

export const error = (message, title = "Something went wrong") => {
    return Swal.fire({
        icon: "error",
        title,
        text: message,
        confirmButtonText: "Try Again",
        confirmButtonColor: "#dc2626",
    })
}

// ── WARNING ALERT ─────────────────────────────────────────────────────────
// Use this before a destructive action
// Example: alert.warning("Are you sure you want to delete this report?")

export const warning = (message, title = "Are you sure?") => {
    return Swal.fire({
        icon: "warning",
        title,
        text: message,
        showCancelButton: true,
        confirmButtonText: "Yes, continue",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d97706",
        cancelButtonColor: "#6b7280",
    })
}

// ── INFO ALERT ────────────────────────────────────────────────────────────
// Use this to show information to the user
// Example: alert.info("Check your email for a verification code")

export const info = (message, title = "Info") => {
    return Swal.fire({
        icon: "info",
        title,
        text: message,
        confirmButtonText: "OK",
        confirmButtonColor: "#2563eb",
    })
}

// ── CONFIRM ALERT ─────────────────────────────────────────────────────────
// Use this when you need the user to confirm before doing something
// Returns true if user clicked confirm, false if they cancelled
// Example:
//   const confirmed = await alert.confirm("Delete this report?")
//   if (confirmed) { ...delete it... }

export const confirm = async (message, title = "Are you sure?") => {

    // Show the alert and wait for the user's response
    const result = await Swal.fire({
        icon: "question",
        title,
        text: message,
        showCancelButton: true,
        confirmButtonText: "Yes, I'm sure",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#6b7280",
    })

    // Return true if user clicked confirm, false if cancelled
    return result.isConfirmed
}

// ── TOAST ─────────────────────────────────────────────────────────────────
// Small notification that appears in the corner and disappears automatically
// Use for non-critical updates like "Message sent" or "Profile updated"
// Example: alert.toast("Report created successfully!", "success")

export const toast = (message, icon = "success") => {

    // Create a toast instance
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    })

    return Toast.fire({
        icon,
        title: message,
    })
}

// ── LOADING ALERT ─────────────────────────────────────────────────────────
// Shows a loading spinner — call alert.loading() before an async operation
// Then call Swal.close() when done
// Example:
//   alert.loading("Creating your account...")
//   await signup(...)
//   Swal.close()

export const loading = (message = "Please wait...") => {
    return Swal.fire({
        title: message,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            // Start the loading spinner
            Swal.showLoading()
        },
    })
}