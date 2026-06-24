export type UserRole = "member" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  youtube_url: string;
  series: string | null;
  published_at: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  published_at: string;
  created_at: string;
}

export interface GivingRecord {
  id: string;
  user_id: string | null;
  amount_cents: number;
  currency: string;
  fund: "general" | "building" | "missions";
  frequency: "one_off" | "monthly";
  stripe_session_id: string;
  created_at: string;
}

export interface PrayerRequest {
  id: string;
  user_id: string | null;
  name: string | null;
  request: string;
  is_public: boolean;
  created_at: string;
}
