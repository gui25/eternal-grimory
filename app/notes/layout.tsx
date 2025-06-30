import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Anotações',
  description: 'Registros e anotações importantes da campanha'
}

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 