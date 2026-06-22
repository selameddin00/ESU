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
          author_id: string | null;
          content: string;
          created_at: string;
          author_name: string | null;
          author_email: string | null;
          is_approved: boolean;
        };
        Insert: {
          post_id: string;
          content: string;
          author_id?: string | null;
          author_name?: string | null;
          author_email?: string | null;
          is_approved?: boolean;
        };
        Update: {
          content?: string;
          is_approved?: boolean;
        };
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          role_title: string;
          bio: string | null;
          skills: string[];
          github_url: string | null;
          linkedin_url: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          role_title: string;
          bio?: string | null;
          skills?: string[];
          github_url?: string | null;
          linkedin_url?: string | null;
          order_index?: number;
        };
        Update: {
          name?: string;
          role_title?: string;
          bio?: string | null;
          skills?: string[];
          github_url?: string | null;
          linkedin_url?: string | null;
          order_index?: number;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          tagline: string | null;
          description: string | null;
          tech: string[];
          status: string;
          github_url: string | null;
          live_url: string | null;
          icon: string;
          accent_color: string;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          tagline?: string | null;
          description?: string | null;
          tech?: string[];
          status?: string;
          github_url?: string | null;
          live_url?: string | null;
          icon?: string;
          accent_color?: string;
          order_index?: number;
        };
        Update: {
          name?: string;
          tagline?: string | null;
          description?: string | null;
          tech?: string[];
          status?: string;
          github_url?: string | null;
          live_url?: string | null;
          icon?: string;
          accent_color?: string;
          order_index?: number;
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
