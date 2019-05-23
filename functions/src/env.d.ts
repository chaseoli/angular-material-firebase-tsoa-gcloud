import { AppOptions, credential } from 'firebase-admin';

export interface Environment  {
   build: 'dev' | 'prod';
   portalUrl: string;
   firebaseProjectId: string;
   firebasePrivateKey: string;
   firebaseClientEmail: string; 
   firebaseDbUrl: string;
} 