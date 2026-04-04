import React from "react";
import { signInWithGoogle, signOut as firebaseSignOut } from "@/integrations/firebase/client";

const GoogleAuth: React.FC = () => {
  const signInWithGoogleHandler = async (): Promise<void> => {
    try {
      const result = await signInWithGoogle();
      console.log("Google Auth successful:", result);
    } catch (error) {
      console.error("Error signing in:", error instanceof Error ? error.message : error);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut();
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error instanceof Error ? error.message : error);
    }
  };

  return (
    <div>
      <button onClick={signInWithGoogleHandler}>Sign in with Google</button>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
};

export default GoogleAuth;