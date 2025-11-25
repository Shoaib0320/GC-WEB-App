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
  const json = await response.json();
  try {
    // notify other tabs/components that contacts changed
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new BroadcastChannel("contacts-updates");
      bc.postMessage({ type: "contacts:update", action: "added", id: json.data?._id || null, timestamp: Date.now() });
      bc.close();
    }
  } catch (e) {
    // ignore
  }
  return json;
}

// ✅ Update contact message (for example: mark as read / replied)
export async function updateContact(contact) {
  const response = await fetch("/api/contact", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contact),
  });

  if (!response.ok) throw new Error("Failed to update contact message");
  const json = await response.json();
  try {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new BroadcastChannel("contacts-updates");
      bc.postMessage({ type: "contacts:update", action: "updated", id: json.data?._id || contact._id || null, timestamp: Date.now() });
      bc.close();
    }
  } catch (e) {}
  return json;
}

// ✅ Delete contact message
export async function deleteContact(contactId) {
  const response = await fetch(`/api/contact?id=${contactId}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete contact message");
  const json = await response.json();
  try {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new BroadcastChannel("contacts-updates");
      bc.postMessage({ type: "contacts:update", action: "deleted", id: contactId, timestamp: Date.now() });
      bc.close();
    }
  } catch (e) {}
  return json;
}

// ✅ Reply to a contact (sends reply email / marks as replied)
export async function replyContact(contactId, subject, message) {
  const response = await fetch(`/api/contact/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contactId, subject, message }),
  });

  if (!response.ok) throw new Error("Failed to send reply to contact");
  const json = await response.json();
  try {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new BroadcastChannel("contacts-updates");
      bc.postMessage({ type: "contacts:update", action: "replied", id: contactId, timestamp: Date.now() });
      bc.close();
    }
  } catch (e) {}
  return json;
}
