import { supabase, isSupabaseConfigured } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  avatar_url: string;
  name: string;
  tier: 'Free' | 'Pro';
  storage_used: number; // in bytes
}

export interface FileItem {
  id: string;
  user_id: string;
  name: string;
  size: number;
  type: string;
  hash: string;
  storage_path: string;
  storage_tier: 'Hot' | 'Cold' | 'Frozen';
  is_favorite: boolean;
  is_trashed: boolean;
  created_at: string;
  last_accessed: string;
  thumbnail: string | null;
  access_count: number;
}

export const FREE_LIMIT_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB

// Helpers for storage tiering
export function determineStorageTier(lastAccessedStr: string): 'Hot' | 'Cold' | 'Frozen' {
  const lastAccessed = new Date(lastAccessedStr);
  const diffTime = Math.abs(new Date().getTime() - lastAccessed.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) return 'Hot';
  if (diffDays <= 180) return 'Cold';
  return 'Frozen';
}

// Generate client-side SHA-256 hash of a file
export async function calculateSHA256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Client-side image/video compression down to 60% quality
export async function compressMedia(file: File, quality: number = 0.6): Promise<File> {
  if (!file.type.startsWith('image/')) {
    // Return original for unsupported types or videos (mocking video compression since client-side video encoding is very heavy)
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize down if extremely large
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
    };
    reader.onerror = () => resolve(file);
  });
}

// Initial Demo Files
const initialDemoFiles = (userId: string): FileItem[] => [
  {
    id: 'demo-1',
    user_id: userId,
    name: 'Quarterly_Report_Q1_2026.pdf',
    size: 24500000, // 24.5MB
    type: 'application/pdf',
    hash: 'hash-pdf-1',
    storage_path: 'r2://reports/q1_2026.pdf',
    storage_tier: 'Hot',
    is_favorite: true,
    is_trashed: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_accessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail: null,
    access_count: 42,
  },
  {
    id: 'demo-2',
    user_id: userId,
    name: 'Product_Teaser_Video.mp4',
    size: 154000000, // 154MB
    type: 'video/mp4',
    hash: 'hash-video-1',
    storage_path: 'r2://videos/teaser.mp4',
    storage_tier: 'Hot',
    is_favorite: false,
    is_trashed: false,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    last_accessed: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    access_count: 85,
  },
  {
    id: 'demo-3',
    user_id: userId,
    name: 'Marketing_Campaign_Creative.png',
    size: 8400000, // 8.4MB
    type: 'image/png',
    hash: 'hash-image-1',
    storage_path: 'r2://images/marketing_campaign.png',
    storage_tier: 'Cold',
    is_favorite: true,
    is_trashed: false,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    last_accessed: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&q=80',
    access_count: 12,
  },
  {
    id: 'demo-4',
    user_id: userId,
    name: 'Archive_Design_System_2024.zip',
    size: 420000000, // 420MB
    type: 'application/zip',
    hash: 'hash-zip-1',
    storage_path: 'r2://archives/design_system_2024.zip',
    storage_tier: 'Frozen',
    is_favorite: false,
    is_trashed: false,
    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    last_accessed: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail: null,
    access_count: 2,
  },
  {
    id: 'demo-5',
    user_id: userId,
    name: 'Trash_Report_Old.docx',
    size: 1200000, // 1.2MB
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    hash: 'hash-docx-1',
    storage_path: 'r2://trash/old.docx',
    storage_tier: 'Frozen',
    is_favorite: false,
    is_trashed: true,
    created_at: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
    last_accessed: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail: null,
    access_count: 0,
  }
];

// LocalStorage Storage Class
class LocalStorageDB {
  private getProfileKey(userId: string) {
    return `daddykart_profile_${userId}`;
  }
  private getFilesKey(userId: string) {
    return `daddykart_files_${userId}`;
  }

  getProfile(userId: string): UserProfile {
    if (typeof window === 'undefined') {
      return { id: userId, email: 'demo@daddykart.com', avatar_url: '', name: 'Demo User', tier: 'Free', storage_used: 187400000 };
    }
    const key = this.getProfileKey(userId);
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    const initialProfile: UserProfile = {
      id: userId,
      email: 'demo@daddykart.com',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
      name: 'Demo User',
      tier: 'Free',
      storage_used: 606900000, // Precalculated sum of the default files: 24.5M + 154M + 8.4M + 420M = 606.9MB
    };
    localStorage.setItem(key, JSON.stringify(initialProfile));
    return initialProfile;
  }

  updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    const profile = this.getProfile(userId);
    const newProfile = { ...profile, ...updates };
    localStorage.setItem(this.getProfileKey(userId), JSON.stringify(newProfile));
    return newProfile;
  }

  getFiles(userId: string): FileItem[] {
    if (typeof window === 'undefined') return [];
    const key = this.getFilesKey(userId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed: FileItem[] = JSON.parse(stored);
      // Dynamically calculate tier based on last_accessed
      return parsed.map(file => ({
        ...file,
        storage_tier: determineStorageTier(file.last_accessed)
      }));
    }
    const initial = initialDemoFiles(userId);
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }

  saveFiles(userId: string, files: FileItem[]) {
    localStorage.setItem(this.getFilesKey(userId), JSON.stringify(files));
    // recalculate storage
    const totalSize = files.filter(f => !f.is_trashed).reduce((acc, cur) => acc + cur.size, 0);
    this.updateProfile(userId, { storage_used: totalSize });
  }

  uploadFileReference(userId: string, file: { name: string; size: number; type: string; hash: string; thumbnail: string | null }): FileItem {
    const files = this.getFiles(userId);
    
    // Check Deduplication
    const existing = files.find(f => f.hash === file.hash);
    const storagePath = existing ? existing.storage_path : `r2://uploads/${Date.now()}_${file.name}`;
    
    const newFile: FileItem = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      name: file.name,
      size: file.size,
      type: file.type,
      hash: file.hash,
      storage_path: storagePath,
      storage_tier: 'Hot',
      is_favorite: false,
      is_trashed: false,
      created_at: new Date().toISOString(),
      last_accessed: new Date().toISOString(),
      thumbnail: file.thumbnail,
      access_count: 1,
    };

    files.unshift(newFile);
    this.saveFiles(userId, files);
    return newFile;
  }
}

export const localDB = new LocalStorageDB();
