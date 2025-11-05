import { AuthProvider } from "@/context/AuthContext";

// This layout will override the root layout for /login
export default function LoginLayout({
  children,
}) {
  return (
    // No Layout component here, direct children
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}