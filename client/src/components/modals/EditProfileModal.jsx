import { useState } from 'react';
import { supabase } from '../../config/supabase';

const EDITABLE_FIELDS = ['full_name', 'weekly_spending', 'college', 'native_place', 'hall'];

export default function EditProfileModal({ isOpen, onClose, user }) {
    const [selectedFields, setSelectedFields] = useState([]);
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const toggleField = (field) => {
        setSelectedFields(prev =>
            prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedFields.length === 0) { alert('Please select at least one field.'); return; }
        if (!details.trim()) { alert('Please provide details.'); return; }

        setSubmitting(true);
        try {
            const { error } = await supabase.from('user_applications').update({
                edit_req_status: false,
                edit_req_field: selectedFields.join(', '),
                edit_req_value: details.trim()
            }).eq('user_id', user.id);
            if (error) throw error;
            alert('Edit Request Submitted! The team will review it shortly.');
            onClose();
        } catch (err) {
            console.error('Edit error:', err);
            alert('Failed to submit: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-secondary)' }}>Edit Profile</h2>
                    <span className="close-modal" onClick={onClose}>&times;</span>
                </div>
                <form onSubmit={handleSubmit} id="editForm">
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-stone)', marginBottom: '1rem' }}>Select the fields you'd like to update:</p>
                    <div className="minimal-checkbox-group" id="fieldCheckboxGroup">
                        {EDITABLE_FIELDS.map(field => (
                            <label className="minimal-checkbox" key={field}>
                                <input
                                    type="checkbox"
                                    value={field}
                                    checked={selectedFields.includes(field)}
                                    onChange={() => toggleField(field)}
                                />
                                <span style={{ textTransform: 'capitalize' }}>{field.replace(/_/g, ' ')}</span>
                            </label>
                        ))}
                    </div>
                    <div className="form-group">
                        <label>Details</label>
                        <textarea
                            className="clean-textarea"
                            rows="3"
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            placeholder="Describe the changes you'd like..."
                            id="editSubjectiveInput"
                        ></textarea>
                    </div>
                    <div className="modal-btns">
                        <button type="button" className="modal-btn btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="modal-btn btn-confirm" disabled={submitting}>
                            {submitting ? <><i className="fas fa-spinner fa-spin"></i> Submitting...</> : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
