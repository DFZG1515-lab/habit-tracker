import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseApp } from "./app";

export const db: Firestore = firebaseApp
  ? getFirestore(firebaseApp)
  : ({} as Firestore);
