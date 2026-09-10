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

// Course/Product representation
export interface AEFCourse {
  id: string;
  title: string;
  
  // -- NEW SCHEMA --
  accessCategories: UserCategory[];
  availableForPurchase: boolean; // Indicates if it acts as a standalone "Venda Avulsa" product
  freeModuleIds?: string[];      // Module IDs that are explicitly free, even in paid courses
  
  // -- BACKWARD COMPATIBILITY (Legacy) --
  tierRequired: string;
}

// Module representation inside a Course
export interface AEFModule {
  id: string;
  title: string;
  isFreeTier?: boolean;          // Explicitly free module regardless of course access rules
}
