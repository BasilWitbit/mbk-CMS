export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  category_id: string;
  status: string;
  content: any[];
  created_at: string;
  author_id: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number;
}

export interface PageSection {
  id: string;
  name: string;
  blocks: any[];
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  sections: PageSection[];
  status: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export interface UserRole {
  user_id: string;
  role: string;
}

export interface MediaFile {
  name: string;
  url: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string; // SVG string or icon name
  customIcon?: string; // uploaded icon URL
}

export interface ContactInfo {
  id: string;
  type: "address" | "email" | "phone";
  value: string;
  label: string;
}

export const staticCategories: Category[] = [
  { id: "cat-1", name: "Case Studies", slug: "case-studies", description: "Client success stories", created_at: "2026-03-01T00:00:00Z" },
  { id: "cat-2", name: "Insights", slug: "insights", description: "Industry insights and trends", created_at: "2026-03-02T00:00:00Z" },
  { id: "cat-3", name: "News", slug: "news", description: "Company news and updates", created_at: "2026-03-03T00:00:00Z" },
];

export const staticPosts: Post[] = [
  {
    id: "post-1",
    title: "How We Helped Acme Corp Grow 200%",
    slug: "acme-corp-growth",
    excerpt: "A deep dive into our partnership with Acme Corp and the strategies that drove results.",
    featured_image: "",
    category_id: "cat-1",
    status: "published",
    content: [{ id: "b1", type: "heading", data: { text: "The Challenge", level: "h2" } }, { id: "b2", type: "text", data: { text: "Acme Corp needed a complete digital transformation..." } }],
    created_at: "2026-03-10T00:00:00Z",
    author_id: "user-1",
  },
  {
    id: "post-2",
    title: "5 Digital Marketing Trends for 2026",
    slug: "marketing-trends-2026",
    excerpt: "Explore the top digital marketing trends shaping the industry this year.",
    featured_image: "",
    category_id: "cat-2",
    status: "published",
    content: [],
    created_at: "2026-03-15T00:00:00Z",
    author_id: "user-1",
  },
  {
    id: "post-3",
    title: "New Office Opening in Dubai",
    slug: "new-office-dubai",
    excerpt: "We're excited to announce our expansion into the Middle East.",
    featured_image: "",
    category_id: "cat-3",
    status: "draft",
    content: [],
    created_at: "2026-03-20T00:00:00Z",
    author_id: "user-2",
  },
];

export const staticPartners: Partner[] = [
  { id: "p-1", name: "Google", logo_url: null, website_url: "https://google.com", sort_order: 0 },
  { id: "p-2", name: "Microsoft", logo_url: null, website_url: "https://microsoft.com", sort_order: 1 },
  { id: "p-3", name: "Amazon", logo_url: null, website_url: "https://amazon.com", sort_order: 2 },
  { id: "p-4", name: "Meta", logo_url: null, website_url: "https://meta.com", sort_order: 3 },
];

export const staticPages: Page[] = [
  {
    id: "page-1",
    slug: "homepage",
    title: "Homepage",
    sections: [
      { id: "s1", name: "Hero Section", blocks: [{ id: "h1", type: "heading", data: { text: "Welcome to Our Website", level: "h1", label: "Main Heading" } }, { id: "h2", type: "text", data: { text: "We deliver innovative solutions for modern businesses.", label: "Intro Text" } }, { id: "h3", type: "button", data: { text: "Get Started", url: "/contact-us", variant: "primary", label: "CTA Button" } }] },
      { id: "s2", name: "About Section", blocks: [{ id: "h4", type: "heading", data: { text: "Who We Are", level: "h2", label: "About Heading" } }, { id: "h5", type: "text", data: { text: "We are a team of passionate professionals.", label: "About Description" } }] },
      { id: "s3", name: "Services Section", blocks: [{ id: "h6", type: "heading", data: { text: "Our Services", level: "h2", label: "Services Title" } }] },
      { id: "s4", name: "Testimonials Section", blocks: [] },
      { id: "s5", name: "CTA Section", blocks: [{ id: "h7", type: "button", data: { text: "Contact Us", url: "/contact-us", variant: "primary", label: "Footer CTA" } }] },
    ],
    status: "published",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "page-2",
    slug: "about-us",
    title: "About Us",
    sections: [
      { id: "a1", name: "Hero Section", blocks: [{ id: "ab1", type: "heading", data: { text: "About Our Company", level: "h1", label: "Page Title" } }] },
      { id: "a2", name: "Story Section", blocks: [{ id: "ab2", type: "text", data: { text: "Founded in 2020, we have been serving clients worldwide.", label: "Our Story" } }] },
      { id: "a3", name: "Team Section", blocks: [] },
    ],
    status: "published",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "page-3",
    slug: "our-partners",
    title: "Our Partners",
    sections: [
      { id: "o1", name: "Partners Header", blocks: [{ id: "ob1", type: "heading", data: { text: "Our Trusted Partners", level: "h1", label: "Partners Title" } }] },
      { id: "o2", name: "Partners Grid", blocks: [] },
    ],
    status: "published",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "page-4",
    slug: "contact-us",
    title: "Contact Us",
    sections: [
      { id: "c1", name: "Contact Header", blocks: [{ id: "cb1", type: "heading", data: { text: "Get in Touch", level: "h1", label: "Contact Title" } }] },
      { id: "c2", name: "Contact Form", blocks: [] },
    ],
    status: "published",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "page-5",
    slug: "privacy-policy",
    title: "Privacy Policy",
    sections: [
      { id: "pp1", name: "Policy Content", blocks: [{ id: "ppb1", type: "heading", data: { text: "Privacy Policy", level: "h1", label: "Title" } }, { id: "ppb2", type: "text", data: { text: "Your privacy is important to us. This policy outlines how we collect, use, and protect your information.", label: "Intro" } }] },
    ],
    status: "published",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "page-6",
    slug: "terms-conditions",
    title: "Terms & Conditions",
    sections: [
      { id: "tc1", name: "Terms Content", blocks: [{ id: "tcb1", type: "heading", data: { text: "Terms & Conditions", level: "h1", label: "Title" } }, { id: "tcb2", type: "text", data: { text: "By using our services, you agree to the following terms and conditions.", label: "Intro" } }] },
    ],
    status: "published",
    created_at: "2026-01-01T00:00:00Z",
  },
];

export const staticProfiles: Profile[] = [
  { id: "prof-1", user_id: "user-1", display_name: "John Admin", email: "admin@example.com", avatar_url: null, created_at: "2026-01-01T00:00:00Z" },
  { id: "prof-2", user_id: "user-2", display_name: "Jane Editor", email: "editor@example.com", avatar_url: null, created_at: "2026-02-01T00:00:00Z" },
  { id: "prof-3", user_id: "user-3", display_name: "Bob Author", email: "author@example.com", avatar_url: null, created_at: "2026-03-01T00:00:00Z" },
];

export const staticUserRoles: UserRole[] = [
  { user_id: "user-1", role: "admin" },
  { user_id: "user-2", role: "editor" },
  { user_id: "user-3", role: "author" },
];

export const staticMediaFiles: MediaFile[] = [
  { name: "hero-banner.jpg", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop" },
  { name: "team-photo.jpg", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop" },
  { name: "office.jpg", url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop" },
  { name: "product-shot.jpg", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop" },
  { name: "conference.jpg", url: "https://images.unsplash.com/photo-1540575467063-178a50c6bf4e?w=400&h=300&fit=crop" },
  { name: "workspace.jpg", url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop" },
];

export const staticSettings = {
  logo_url: "",
  favicon_url: "",
};

export const staticSocialLinks: SocialLink[] = [
  { id: "social-1", platform: "Facebook", url: "https://facebook.com", icon: "facebook" },
  { id: "social-2", platform: "Twitter / X", url: "https://x.com", icon: "twitter" },
  { id: "social-3", platform: "Instagram", url: "https://instagram.com", icon: "instagram" },
  { id: "social-4", platform: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" },
];

export const staticContactInfo: ContactInfo[] = [
  { id: "ci-1", type: "address", value: "123 Business Ave, Suite 100, New York, NY 10001", label: "Main Office" },
  { id: "ci-2", type: "email", value: "info@company.com", label: "General Inquiries" },
  { id: "ci-3", type: "phone", value: "+1 (555) 123-4567", label: "Main Line" },
];

export const availableSocialPlatforms = [
  "Facebook", "Twitter / X", "Instagram", "LinkedIn", "YouTube",
  "TikTok", "Pinterest", "Snapchat", "WhatsApp", "Telegram",
  "Discord", "Reddit", "GitHub", "Dribbble", "Behance", "Other",
];
