import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const labelMap: Record<string, string> = {
  cms: "Dashboard",
  posts: "Posts",
  new: "New Post",
  categories: "Categories",
  pages: "Pages",
  partners: "Partners",
  users: "Users",
  settings: "Settings",
  media: "Media",
  "site-identity": "Site Identity",
  "social-media": "Social Media",
  "contact-info": "Contact Info",
};

const pageSlugMap: Record<string, string> = {
  homepage: "Homepage",
  "about-us": "About Us",
  "our-partners": "Our Partners",
  "contact-us": "Contact Us",
  "privacy-policy": "Privacy Policy",
  "terms-conditions": "Terms & Conditions",
};

export function CMSBreadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  if (pathSegments.length <= 1) return null;

  const crumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;

    // Determine label
    let label = labelMap[segment] || pageSlugMap[segment] || segment;

    // If it's a post ID (under /cms/posts/:id), label it
    if (index === 2 && pathSegments[1] === "posts" && !labelMap[segment]) {
      label = segment === "new" ? "New Post" : "Edit Post";
    }

    // If it's a page slug (under /cms/pages/:slug)
    if (index === 2 && pathSegments[1] === "pages") {
      label = pageSlugMap[segment] || segment;
    }

    return { label, path, isLast };
  });

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {crumbs.map((crumb, i) => (
          <BreadcrumbItem key={crumb.path}>
            {i > 0 && <BreadcrumbSeparator />}
            {crumb.isLast ? (
              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link to={crumb.path}>{crumb.label}</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
