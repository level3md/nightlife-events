// This layout intercepts /admin/auth/* routes and renders them
// WITHOUT the sidebar/admin shell — login page needs a clean slate.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
