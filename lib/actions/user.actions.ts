"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signInFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";

// Sign in the user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user);

    return { success: true, message: "Connexion réussi" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      success: false,
      message: "L'email ou le mot de passe est incorrecte !",
    };
  }
}

// Sign user out
export async function signOutUser() {
  await signOut();
}
