export const generateWhatsAppLink = (phone) => {
  if (!phone) return null;
  const message = `
Hello 👋

Your Mess Registration is successful.

Please visit the mess counter to scan your QR and mark attendance.

Thank you.
`;
  return `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
};
