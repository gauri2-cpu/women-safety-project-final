import React, { useState, useEffect } from 'react';
import { getContacts, addContact, updateContact, deleteContact } from '../services/api';
import { saveContacts as saveContactsLocal } from '../services/storage';
import '../styles/Contacts.css';

function TrustedContacts({ onContactsChange }) {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await getContacts();
      if (response.success) {
        setContacts(response.contacts);
        saveContactsLocal(response.contacts);
        onContactsChange(response.contacts);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let response;
      if (editingContact) {
        response = await updateContact(editingContact.id, formData);
      } else {
        response = await addContact(formData);
      }

      if (response.success) {
        setSuccess(editingContact ? 'Contact updated!' : 'Contact added!');
        fetchContacts();
        setFormData({ name: '', phone: '' });
        setShowForm(false);
        setEditingContact(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to save contact');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({ name: contact.name, phone: contact.phone });
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      const response = await deleteContact(contactId);
      if (response.success) {
        setSuccess('Contact deleted!');
        fetchContacts();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete contact');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContact(null);
    setFormData({ name: '', phone: '' });
    setError('');
  };

  return (
    <div className="contacts-container">
      <div className="contacts-header">
        <h2>Trusted Contacts</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn-add-contact"
        >
          + Add Contact
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="contact-form-overlay">
          <div className="contact-form-modal">
            <h3>{editingContact ? 'Edit Contact' : 'Add New Contact'}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Contact Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number (e.g., +91 9876543210)"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-cancel"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="contacts-list">
        {contacts.length === 0 ? (
          <div className="no-contacts">
            <p>No trusted contacts added yet</p>
            <p className="hint">Add contacts to receive SOS alerts</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className="contact-card">
              <div className="contact-info">
                <h3>{contact.name}</h3>
                <p>{contact.phone}</p>
              </div>
              <div className="contact-actions">
                <button
                  onClick={() => handleEdit(contact)}
                  className="btn-edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TrustedContacts;
