/**
 * Typings for the AgoraEuFalo ecosystem - Multi-Category Access System
 * Generated as part of the critical refactoring.
 */

// Basic enums for categories
export type UserCategory = 
  | "member_free"
  | "member_pago"
  | "member_mentoria"
  | "admin"
  | "legado_1"
  | "legado_2"
  | "venda_avulsa";

export type BillingPeriod = "monthly" | "annual" | "lifetime";

export type AccessStatus = 
  | "active" 
  | "overdue_grace_period" 
  | "canceled_grace" 
  | "canceled_immediate" 
  | "revoked";

// Subscription state specifically for member_pago
export interface SubscriptionData {
  billingPeriod: BillingPeriod;
  status: AccessStatus;
  expiresAt?: string | null;     // ISO String Date
  graceUntil?: string | null;    // ISO String Date
  gateway: "hotmart" | "stripe" | "manual";
  lastEvent?: string;            // Webhook event type
  updatedAt?: string;
}

// User Profile representation from Firestore
export interface AEFUser {
  id: string;                    // Usually email username (lowercase, _ instead of non-alphanumeric)
  uid: string;
  email: string;
  name: string;
  phone?: string;
  
  // -- NEW SCHEMA --
  categories: UserCategory[];
  purchasedProducts: string[];   // Standalone purchases ("Venda Avulsa")
  subscription?: SubscriptionData | null;
  
  // -- BACKWARD COMPATIBILITY (Legacy) --
  tier: string;
  role: "student" | "moderator" | "admin";
  enrolledProducts: string[];
  
  // -- METADATA --
  createdAt?: string;
  updatedAt?: string;
}

// Nova Taxonomia de Cursos
export type CourseCategory = 
  | 'magic_stories' 
  | 'foundations' 
  | 'survival' 
  | 'real_english';

export type CourseAccessTier = 
  | 'all_access' 
  | 'standalone' 
  | 'free';

// Course/Product representation
export interface AEFCourse {
  id: string;
  title: string;
  slug?: string;
  
  // -- NEW TAXONOMY --
  categories: CourseCategory[];
  accessTier: CourseAccessTier;
  priceInCents?: number;
  isPublished?: boolean;
  sortOrder?: number;
}

// Module representation inside a Course
export interface AEFModule {
  id: string;
  title: string;
  isFreeTier?: boolean;          // Explicitly free module regardless of course access rules
  lessons?: AEFLesson[];
}

export type MediaType = "video_youtube" | "video_vimeo" | "video_mp4" | "audio_mp3";
export interface AEFMedia {
  type: MediaType;
  url: string;
  title: string;
  durationStr?: string;
  thumbnailUrl?: string;
}

export type DownloadType = "pdf" | "mp3" | "zip";
export interface AEFDownload {
  type: DownloadType;
  url: string;
  title: string;
}

// Lesson representation inside a Module
export interface AEFLesson {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string; // Legacy/Main 16:9 thumbnail
  artworkUrl?: string;   // 1:1 artwork
  
  // -- NEW SCHEMA (Multi-Media) --
  media: AEFMedia[];
  downloads: AEFDownload[];
  
  // -- BACKWARD COMPATIBILITY (Legacy) --
  videoUrl?: string;
  pdfUrl?: string;
  audioUrl?: string;
}

