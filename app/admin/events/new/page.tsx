import EventForm from '@/components/admin/EventForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Event — Admin' }

export default function NewEventPage() {
  return <EventForm />
}
