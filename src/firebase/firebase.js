import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let firebase_app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(firebase_app);
export const db = getFirestore(firebase_app);
export const storage = getStorage(firebase_app);

export const signOutUser = async () => {
  await signOut(auth);
};

export const createUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
  return user;
};

export const signInUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
  return user;
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;
  return user;
};

export const uploadImage = async (file) => {
  const storageRef = ref(storage, file.name);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await snapshot.ref.getDownloadURL();
  return url;
};

export const addPost = async (post) => {
  const docRef = await addDoc(collection(db, "posts"), post);
  return docRef;
};

export const uploadFile = async (file) => {
  const storageRef = ref(storage, `files/${file.name}`);
  await uploadBytes(storageRef, file);
  console.log("File uploaded");
};

export const uploadDataToFirestore = async (data) => {
  try {
    const docRef = await setDoc(doc(db, usuario.uid, usuario.uid), { data });
    if (docRef) {
      console.log("Datos subidos correctamente a Firestore: ", docRef.id);
    } else {
      console.error(
        "Error al subir los datos a Firestore: No se obtuvo un documento de referencia"
      );
    }
  } catch (error) {
    console.error("Error al subir los datos a Firestore:", error);
    throw error;
  }
};

export const updateAnimeLink = async (animeId, capituloId, leido) => {
  const animeRef = doc(db, "nombre_de_la_coleccion", animeId);

  try {
    await updateDoc(animeRef, {
      [`data.${animeId}.link.${capituloId}.leido`]: leido,
    });
    console.log("Link updated");
  } catch (error) {
    console.error("Error updating link:", error);
  }
};

export {
  initializeApp,
  getApps,
  getApp,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  getFirestore,
  collection,
  addDoc,
  setDoc,
  getStorage,
  ref,
  uploadBytes,
  doc,
  updateDoc,
  getDoc,
};

export default firebase_app;
