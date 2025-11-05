// src/actions/contactActions.js

// ✅ Get all contact messages
export async function fetchContacts() {
  const response = await fetch("/api/contact");
  if (!response.ok) throw new Error("Failed to fetch contact messages");
  return response.json();
}

// ✅ Add new contact message
export async function addContact(contact) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contact),
  });

  if (!response.ok) throw new Error("Failed to add contact message");
  return response.json();
}

// ✅ Update contact message (for example: mark as read / replied)
export async function updateContact(contact) {
  const response = await fetch("/api/contact", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contact),
  });

  if (!response.ok) throw new Error("Failed to update contact message");
  return response.json();
}

// ✅ Delete contact message
export async function deleteContact(contactId) {
  const response = await fetch(`/api/contact?id=${contactId}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete contact message");
  return response.json();
}
