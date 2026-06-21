export type Role = "member" | "editor" | "admin";
export type PostStatus = "draft" | "published";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: Role;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: Role;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          role?: Role;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;           // Tiptap HTML output
          category: string;
          author_id: string;
          status: PostStatus;
          published_at: string | null;
          read_time: string | null;
          cover_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          slug: string;
          excerpt?: string | null;
          content: string;
          category: string;
          author_id: string;
          status?: PostStatus;
          published_at?: string | null;
          read_time?: string | null;
          cover_image?: string | null;
        };
        Update: {
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string;
          category?: string;
          status?: PostStatus;
          published_at?: string | null;
          read_time?: string | null;
          cover_image?: string | null;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          author_id: string;
          content: string;
        };
        Update: {
          content?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          notify_blog: boolean;
          notify_projects: boolean;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          email: string;
          notify_blog?: boolean;
          notify_projects?: boolean;
        };
        Update: {
          notify_blog?: boolean;
          notify_projects?: boolean;
        };
      };
    };
  };
}
