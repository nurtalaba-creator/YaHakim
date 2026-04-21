import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError } from './firebase';

export interface Doctor {
  id: string;
  name_en: string;
  name_ku: string;
  specialty_en: string;
  specialty_ku: string;
  certification_en?: string;
  certification_ku?: string;
  clinic_en?: string;
  clinic_ku?: string;
  workdays_en?: string;
  workdays_ku?: string;
  fee?: string;
  location_en: string;
  location_ku: string;
  phoneNumber?: string;
  address_en?: string;
  address_ku?: string;
  sourceLink?: string;
  experience: number;
  contact: string;
  bio_en: string;
  bio_ku: string;
  availableToday: boolean;
}

export interface Article {
  id: string;
  title_en: string;
  title_ku: string;
  content_en: string;
  content_ku: string;
  category_en: string;
  category_ku: string;
  audience_en: string;
  audience_ku: string;
  symptoms_en: string[];
  symptoms_ku: string[];
  author: string;
  imageUrl: string;
  publishedAt: string;
}

const DOCTORS_COLLECTION = 'doctors';
const ARTICLES_COLLECTION = 'articles';

export const dataService = {
  // Doctors
  async getDoctors(): Promise<Doctor[]> {
    try {
      const querySnapshot = await getDocs(collection(db, DOCTORS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
    } catch (error) {
      return handleFirestoreError(error, 'list', DOCTORS_COLLECTION);
    }
  },

  async addDoctor(doctor: Omit<Doctor, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, DOCTORS_COLLECTION), doctor);
      return docRef.id;
    } catch (error) {
      return handleFirestoreError(error, 'create', DOCTORS_COLLECTION);
    }
  },

  async updateDoctor(id: string, doctor: Partial<Doctor>): Promise<void> {
    try {
      const docRef = doc(db, DOCTORS_COLLECTION, id);
      await updateDoc(docRef, doctor);
    } catch (error) {
      return handleFirestoreError(error, 'update', `${DOCTORS_COLLECTION}/${id}`);
    }
  },

  async deleteDoctor(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, DOCTORS_COLLECTION, id));
    } catch (error) {
      return handleFirestoreError(error, 'delete', `${DOCTORS_COLLECTION}/${id}`);
    }
  },

  // Articles
  async getArticles(): Promise<Article[]> {
    try {
      const q = query(collection(db, ARTICLES_COLLECTION), orderBy('publishedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[];
    } catch (error) {
      return handleFirestoreError(error, 'list', ARTICLES_COLLECTION);
    }
  },

  async addArticle(article: Omit<Article, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), article);
      return docRef.id;
    } catch (error) {
      return handleFirestoreError(error, 'create', ARTICLES_COLLECTION);
    }
  },

  async updateArticle(id: string, article: Partial<Article>): Promise<void> {
    try {
      const docRef = doc(db, ARTICLES_COLLECTION, id);
      await updateDoc(docRef, article);
    } catch (error) {
      return handleFirestoreError(error, 'update', `${ARTICLES_COLLECTION}/${id}`);
    }
  },

  async deleteArticle(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, ARTICLES_COLLECTION, id));
    } catch (error) {
      return handleFirestoreError(error, 'delete', `${ARTICLES_COLLECTION}/${id}`);
    }
  }
};
