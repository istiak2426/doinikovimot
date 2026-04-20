export default function ArticleLayout({ children }) {
  // No Header, no auth wrapper - completely public
  return <>{children}</>
}

// Force dynamic rendering, not static
export const dynamic = 'force-dynamic'
export const revalidate = 0