import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Custom components for MDX content
export const components = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={cn("text-3xl font-bold mt-8 mb-4", className)} {...props} />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={cn("text-2xl font-bold mt-6 mb-3", className)} {...props} />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("text-xl font-bold mt-4 mb-2", className)} {...props} />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("my-4", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("list-disc pl-5 my-4", className)} {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn("mb-1", className)} {...props} />
  ),
  a: ({ href, className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (href?.startsWith("/")) {
      return (
        <Link href={href} className={cn("text-blue-600 hover:underline dark:text-blue-400", className)} {...props} />
      )
    }
    return (
      <a
        href={href}
        className={cn("text-blue-600 hover:underline dark:text-blue-400", className)}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    )
  },
  img: ({ src, alt, width, height, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <Image
      src={src || ""}
      alt={alt || ""}
      width={Number.parseInt(width as string) || 800}
      height={Number.parseInt(height as string) || 600}
      className={cn("rounded-md my-4", className)}
      {...props}
    />
  ),
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className={cn("font-bold", className)} {...props} />
  ),
}

