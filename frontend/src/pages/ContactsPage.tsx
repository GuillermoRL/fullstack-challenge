import { useCallback, useEffect, useState } from 'react'
import { contactService, type Contact } from '../services'
import { Pagination } from '../components/Pagination'
import { SearchInput } from '../components/SearchInput'
import { contactSchema } from '@/schemas/contact.schemas'
import { validateForm } from '@/utils/validation'
import { ApiError } from '../services'

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')

  const loadContacts = useCallback(async () => {
    try {
      const result = await contactService.getAll({
        page,
        limit: 10,
        search: search || undefined,
      })
      setContacts(result.data)
      setTotalPages(result.meta.totalPages)
      setTotal(result.meta.total)
    } catch (error) {
      console.error('Failed to load contacts:', error)
      setGeneralError('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1)
  }, [search])

  function openCreateForm() {
    setFormData({ name: '', email: '', phone: '' })
    setEditingContact(null)
    setErrors({})
    setGeneralError(null)
    setShowForm(true)
  }

  function openEditForm(contact: Contact) {
    setFormData({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
    })
    setEditingContact(contact)
    setErrors({})
    setGeneralError(null)
    setShowForm(true)
  }

  function handleBlur(field: keyof typeof formData) {
    const validation = validateForm(contactSchema, formData)
    if (!validation.success) {
      setErrors(prev => ({
        ...prev,
        [field]: validation.errors[field] || '',
      }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGeneralError(null)

    // Validate before submitting
    const validation = validateForm(contactSchema, formData)
    if (!validation.success) {
      setErrors(validation.errors)
      return
    }

    setErrors({})
    setSaving(true)

    try {
      if (editingContact) {
        await contactService.update(editingContact.id, formData)
      } else {
        await contactService.create(formData)
      }
      await loadContacts()
      setShowForm(false)
    } catch (error) {
      if (error instanceof ApiError) {
        // Check if it's a validation error from backend
        const responseData = await error as any
        if (responseData.details?.fieldErrors) {
          const fieldErrors: Record<string, string> = {}
          for (const [field, messages] of Object.entries(
            responseData.details.fieldErrors as Record<string, string[]>
          )) {
            fieldErrors[field] = messages[0]
          }
          setErrors(fieldErrors)
        } else {
          setGeneralError(error.message)
        }
      } else {
        setGeneralError('Failed to save contact')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      await contactService.delete(id)
      await loadContacts()
    } catch (error) {
      console.error('Failed to delete contact:', error)
      setGeneralError('Failed to delete contact')
    }
  }

  if (loading) {
    return <div className="text-slate-500">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-500 mt-1">Manage your contacts</p>
          <p className="text-slate-500 mt-1">
            {total} contact{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-700 transition-colors"
        >
          Add Contact
        </button>
      </div>

      <div className="flex gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or phone..."
        />
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {editingContact ? 'Edit Contact' : 'New Contact'}
          </h2>

          {generalError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={() => handleBlur('name')}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.name ? 'border-red-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onBlur={() => handleBlur('phone')}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.phone ? 'border-red-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading && (
          <div className="p-6 text-center text-slate-500">Loading...</div>
        )}
        {contacts.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No contacts yet. Add your first contact!
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-900 font-medium">{contact.name}</td>
                  <td className="px-6 py-4 text-slate-600">{contact.email || '-'}</td>
                  <td className="px-6 py-4 text-slate-600">{contact.phone || '-'}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditForm(contact)}
                      className="text-indigo-600 hover:text-indigo-500 font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="text-red-600 hover:text-red-500 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
