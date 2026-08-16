import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";

const AuthContext = createContext(null);

const ADMIN_EMAIL = "admin@littlebear.com";
const ADMIN_PASSWORD = "Admin123!";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("littlebear_user")) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const appUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Customer",
          role: firebaseUser.email?.toLowerCase() === ADMIN_EMAIL ? "admin" : "user",
        };
        setUser(appUser);
        sessionStorage.setItem("littlebear_user", JSON.stringify(appUser));
      } else {
        setUser(null);
        sessionStorage.removeItem("littlebear_user");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      // The admin account must also be a real Firebase Auth account so Firestore
      // can recognize the admin when reading customer orders. On first login,
      // create the demo admin account automatically.
      let result;
      if (normalizedEmail === ADMIN_EMAIL) {
        if (password !== ADMIN_PASSWORD) {
          throw new Error("Invalid admin email or password.");
        }
        try {
          result = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        } catch (adminError) {
          if (adminError.code === "auth/user-not-found" || adminError.code === "auth/invalid-credential") {
            result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
            await updateProfile(result.user, { displayName: "LittleBear Admin" });
          } else {
            throw adminError;
          }
        }
      } else {
        result = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      }
      const isAdmin = normalizedEmail === ADMIN_EMAIL;
      const customer = {
        uid: result.user.uid,
        email: result.user.email,
        name: isAdmin ? "LittleBear Admin" : (result.user.displayName || result.user.email?.split("@")[0] || "Customer"),
        role: isAdmin ? "admin" : "user",
      };
      setUser(customer);
      sessionStorage.setItem("littlebear_user", JSON.stringify(customer));
      return customer;
    } catch (error) {
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        throw new Error("Incorrect email or password.");
      }
      if (error.code === "auth/too-many-requests") {
        throw new Error("Too many attempts. Please try again later.");
      }
      throw new Error(error.message || "Unable to log in.");
    }
  };

  const register = async ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === ADMIN_EMAIL) {
      throw new Error("This email is reserved for the administrator.");
    }
    if (!name.trim()) throw new Error("Please enter your name.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");

    try {
      const result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      await updateProfile(result.user, { displayName: name.trim() });

      const customer = {
        uid: result.user.uid,
        email: result.user.email,
        name: name.trim(),
        role: "user",
      };
      setUser(customer);
      sessionStorage.setItem("littlebear_user", JSON.stringify(customer));
      return customer;
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        throw new Error("An account with this email already exists. Please log in.");
      }
      if (error.code === "auth/invalid-email") {
        throw new Error("Please enter a valid email address.");
      }
      if (error.code === "auth/weak-password") {
        throw new Error("Password must be at least 6 characters.");
      }
      throw new Error(error.message || "Unable to create your account.");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    sessionStorage.removeItem("littlebear_user");
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAdmin: user?.role === "admin",
      isUser: user?.role === "user",
      isLoggedIn: Boolean(user),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const ADMIN_LOGIN_EMAIL = ADMIN_EMAIL;
export const ADMIN_LOGIN_PASSWORD = ADMIN_PASSWORD;
