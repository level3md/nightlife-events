// Login has moved to /login — redirect there
import { redirect } from 'next/navigation'

export default function OldLoginPage() {
  redirect('/login')
}
