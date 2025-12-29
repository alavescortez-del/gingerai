'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { MessageCircle, Search, Heart, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import { Contact, Model, Message } from '@/types/database'

interface ContactWithDetails extends Contact {
  model: Model
  last_message?: Message
}

export default function ContactsPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || 'fr'
  const t = useTranslations('contacts')
  const [contacts, setContacts] = useState<ContactWithDetails[]>([])
  const [filteredContacts, setFilteredContacts] = useState<ContactWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    checkAuth()
    fetchContacts()
  }, [])
  
  // If not authenticated, redirect to register
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/register?redirect=/contacts')
    }
  }, [isAuthenticated, router])
  
  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
  }

  useEffect(() => {
    if (searchQuery) {
      setFilteredContacts(
        contacts.filter(c => 
          c.model?.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    } else {
      setFilteredContacts(contacts)
    }
  }, [contacts, searchQuery])

  const fetchContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch contacts with model info
      const { data: contactsData, error } = await supabase
        .from('contacts')
        .select('*, model:models(*)')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (error) throw error

      if (contactsData && contactsData.length > 0) {
        // Redirect to the first contact by default
        router.push(`/${locale}/dm/${contactsData[0].model_id}`)
        return
      }
        const contactsWithMessages = await Promise.all(
          (contactsData as ContactWithDetails[]).map(async (contact) => {
            const { data: messages } = await supabase
              .from('messages')
              .select('*')
              .eq('contact_id', contact.id)
              .order('created_at', { ascending: false })
              .limit(1)

            return {
              ...contact,
              last_message: messages?.[0] || undefined
            } as ContactWithDetails
          })
        )

        setContacts(contactsWithMessages)
        setFilteredContacts(contactsWithMessages)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-ginger-primary/30 border-t-ginger-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl lg:text-4xl font-bold text-ginger-text mb-2">
          {t('title')}
        </h1>
        <p className="text-ginger-muted">
          {t('subtitle')}
        </p>
      </motion.div>

      {/* Search */}
      {contacts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ginger-muted" />
            <Input
              placeholder={t('searchPlaceholder') || 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
        </motion.div>
      )}

      {/* Contacts list */}
      {filteredContacts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <MessageCircle className="w-16 h-16 text-ginger-primary/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-ginger-text mb-2">
            {t('empty')}
          </h3>
          <p className="text-ginger-muted mb-6">
            {t('emptySubtitle')}
          </p>
          {contacts.length === 0 && (
            <Link href={`/${locale}/scenarios`} className="btn-ginger inline-flex items-center gap-2">
              <Heart className="w-5 h-5" />
              {t('startChat')}
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <Link href={`/${locale}/dm/${contact.model_id}`}>
                <Card className="group flex items-center gap-4 p-4 hover:border-ginger-primary/30">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar
                      src={contact.model?.avatar_url}
                      alt={contact.model?.name || 'Contact'}
                      size="lg"
                      online={Math.random() > 0.3} // Simulated online status
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-ginger-text group-hover:text-ginger-primary transition-colors">
                        {contact.model?.name}
                      </h3>
                      {contact.last_message && (
                        <span className="text-xs text-ginger-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(contact.last_message.created_at).toLocaleDateString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-ginger-muted truncate">
                      {contact.last_message 
                        ? contact.last_message.content
                        : 'Commence une conversation...'
                      }
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <MessageCircle className="w-5 h-5 text-ginger-muted group-hover:text-ginger-primary transition-colors" />
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

