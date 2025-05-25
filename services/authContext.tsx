import { use, createContext, type PropsWithChildren, useEffect } from "react";
import { useStorageState } from "./useStorageState";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { Alert } from "react-native";

const AuthContext = createContext<{
  signIn: (email: any, password: any) => Promise<boolean>;
  signOut: () => void;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: async () => Promise.resolve(false),
  signOut: () => null,
  signUp: async () =>  Promise.resolve(false),
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");

  const parsedSession = session ? JSON.parse(session) : null;
  console.log("Session :", parsedSession);

  useEffect(() => {
    if (parsedSession?.expiresAt && Date.now() > parsedSession.expiresAt) {
      console.log("Session in effect:", parsedSession);
      Alert.alert('Session expired. PLease sign in again');
      setSession(null);
      router.replace('/sign-in');
    }
  }, [session]);

  return (
    <AuthContext
      value={{
        signIn: async (email: string, password: string) => {

          const normalizedEmail = email.trim().toLowerCase();

          const emailsRaw = await SecureStore.getItemAsync("emails");
          const emails = emailsRaw ? JSON.parse(emailsRaw) : [];

          console.log("Emails", emails);

          const passwordsRaw = await SecureStore.getItemAsync("passwords");
          const passwords = passwordsRaw ? JSON.parse(passwordsRaw) : [];
          console.log("pass", passwords);

          const index = emails.indexOf(normalizedEmail);

          if (index !== -1 && passwords[index] === password) {
            // Save session with optional expiry logic if you want
            await setSession(JSON.stringify({
              email,
              expiresAt: Date.now() + 1000 * 3, // 1 hour
            }));
            return true;
          }

          return false; // Login failed
        },

        signOut: () => {
          setSession(null);
          router.replace('/sign-in');
        },
        signUp: async (name: string, email: string, password: string) => {
          console.log("Hello");
          const normalizedEmail = email.trim().toLowerCase();

          const emailsRaw = await SecureStore.getItemAsync("emails");
          const emails = emailsRaw ? JSON.parse(emailsRaw) : [];

          console.log(emails);

          if (emails.includes(normalizedEmail)) {
            console.log("Email already exists");
            return false;
          }

          emails.push(normalizedEmail);
          await SecureStore.setItemAsync("emails", JSON.stringify(emails));

          // Store passwords (in order — insecure, but okay for demo)
          const passwordsRaw = await SecureStore.getItemAsync("passwords");
          const passwords = passwordsRaw ? JSON.parse(passwordsRaw) : [];
          passwords.push(password);
          await SecureStore.setItemAsync(
            "passwords",
            JSON.stringify(passwords)
          );

          const namesRaw = await SecureStore.getItemAsync("names");
          const names = namesRaw ? JSON.parse(namesRaw) : [];
          names.push(name);
          await SecureStore.setItemAsync("names", JSON.stringify(names));

          return true;
        },

        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext>
  );
}
