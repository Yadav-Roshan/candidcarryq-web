import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Simple version of breadcrumb that doesn't require separate separator components
export function Breadcrumb({ 
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  // Convert children to array for manipulation
  const childElements = React.Children.toArray(children);
  
  // Create new array with separators between items
  const childrenWithSeparators = childElements.flatMap((child, index) => {
    if (index === 0) return [child];
    return [
      <li key={`separator-${index}`} aria-hidden="true" className="mx-2 inline-flex items-center">
        <ChevronRight className="h-4 w-4" />
      </li>,
      child
    ];
  });

  return (
    <nav aria-label="Breadcrumb" className={cn("flex", className)} {...props}>
      <ol className="flex flex-wrap items-center text-sm text-muted-foreground">
        {childrenWithSeparators}
      </ol>
    </nav>
  );
}

export interface BreadcrumbItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  isCurrentPage?: boolean;
}

export function BreadcrumbItem({ className, children, isCurrentPage, ...props }: BreadcrumbItemProps) {
  return (
    <li 
      className={cn("inline-flex items-center", className)}
      aria-current={isCurrentPage ? "page" : undefined}
      {...props}
    >
      {children}
    </li>
  );
}

export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  isCurrentPage?: boolean;
}

export function BreadcrumbLink({ 
  className, 
  href,
  children,
  isCurrentPage,
  ...props 
}: BreadcrumbLinkProps) {
  if (isCurrentPage) {
    return (
      <span 
        className={cn("font-medium text-foreground", className)}
        aria-current="page"
        {...props}
      >
        {children}
      </span>
    );
  }
  
  return (
    <Link 
      href={href}
      className={cn("text-muted-foreground hover:text-foreground hover:underline", className)}
      {...props}
    >
      {children}
    </Link>
  );
}
