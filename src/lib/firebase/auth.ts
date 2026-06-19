import { getAuth, type Auth } from "firebase/auth";
import { firebaseApp } from "./app";

export const auth: Auth = firebaseApp ? getAuth(firebaseApp) : ({} as Auth);
