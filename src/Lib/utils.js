import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a UTC time string (HH:MM or ISO) to IST in AM/PM format
 * @param {string} utcTime - Time in HH:MM or ISO format
 * @returns {string} - Formatted IST time (e.g., 07:45 PM)
 */
export const formatTimeIST = (utcTime) => {
  if (!utcTime) return "";
  
  try {
    let date;
    // If it's just HH:MM (as required by gemini.md rules for backend)
    if (utcTime.includes(":") && !utcTime.includes("-") && !utcTime.includes("T")) {
      const [hours, minutes] = utcTime.split(":").map(Number);
      date = new Date();
      date.setUTCHours(hours, minutes, 0, 0);
    } else {
      date = new Date(utcTime);
    }

    if (isNaN(date.getTime())) return utcTime; // Fallback to raw if invalid

    return date.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (err) {
    console.warn("Time formatting error:", err);
    return utcTime;
  }
};