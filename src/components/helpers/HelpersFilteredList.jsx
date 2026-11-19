'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

export default function HelpersFilteredList({ helpers, stats }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('reputation-desc');

  // Helper management state
  const [isHelper, setIsHelper] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState('');
  const [subjectsSuccess, setSubjectsSuccess] = useState('');

  // Fetch current user on mount
  useEffect(() => {
    async function fetchCurrentUser() {
      setUserLoading(true);
      setUserError('');
      try {
        const response = await fetch('/api/user');
        if (!response.ok) {
          setUserError('Unable to load user preferences');
          return;
        }
        const data = await response.json();
        setCurrentUser(data.user);
        setIsHelper(data.user?.role === 'HELPER');
        setIsAvailable(data.user?.isAvailable);
        if (data.user?.subjects) {
          setSubjects(data.user.subjects.split(',').map(s => s.trim()));
        }
      } catch (error) {
        setUserError('Unable to load user preferences');
        console.error('Failed to fetch current user:', error);
      } finally {
        setUserLoading(false);
      }
    }
    fetchCurrentUser();
  }, []);

  const allSubjects = useMemo(() => {
    const subjects = new Set();
    helpers.forEach((h) => {
      if (h.subjects) {
        h.subjects.split(',').forEach((s) => subjects.add(s.trim()));
      }
    });
    return ['All', ...Array.from(subjects).sort()];
  }, [helpers]);

  const recommendedHelpers = useMemo(() => {
    let result = [...helpers];

    if (subjectFilter !== 'All') {
      result = result.filter((h) => {
        if (!h.subjects) return false;
        const subjects = h.subjects.split(',').map((s) => s.trim().toLowerCase());
        return subjects.includes(subjectFilter.toLowerCase());
      });
    }

    result = result.filter((h) => h.isAvailable);
    result.sort((a, b) => b.reputation - a.reputation);

    return result.slice(0, 3);
  }, [helpers, subjectFilter]);

  const filteredAndSortedHelpers = useMemo(() => {
    let result = [...helpers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((h) => h.name.toLowerCase().includes(query));
    }

    if (subjectFilter !== 'All') {
      result = result.filter((h) => {
        if (!h.subjects) return false;
        const subjects = h.subjects.split(',').map((s) => s.trim().toLowerCase());
        return subjects.includes(subjectFilter.toLowerCase());
      });
    }

    if (availabilityFilter !== 'All') {
      result = result.filter((h) => {
        if (availabilityFilter === 'Available') return h.isAvailable;
        if (availabilityFilter === 'Unavailable') return !h.isAvailable;
        return true;
      });
    }

    if (sortBy === 'reputation-desc') {
      result.sort((a, b) => b.reputation - a.reputation);
    } else if (sortBy === 'reputation-asc') {
      result.sort((a, b) => a.reputation - b.reputation);
    }

    return result;
  }, [helpers, searchQuery, subjectFilter, availabilityFilter, sortBy]);

  const hasActiveFilters = searchQuery || subjectFilter !== 'All' || availabilityFilter !== 'All' || sortBy !== 'reputation-desc';

  const resetFilters = () => {
    setSearchQuery('');
    setSubjectFilter('All');
    setAvailabilityFilter('All');
    setSortBy('reputation-desc');
  };

  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Toggle availability
  const handleToggleAvailability = async () => {
    setAvailabilityLoading(true);
    setAvailabilityError('');
    try {
      const response = await fetch('/api/helpers/availability', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setIsAvailable(data.isAvailable);
      } else {
        setAvailabilityError(data.error || 'Failed to update availability');
      }
    } catch (error) {
      setAvailabilityError('Failed to update availability. Please try again.');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Add subject
  const handleAddSubject = () => {
    const trimmed = newSubject.trim();
    if (trimmed) {
      const normalized = trimmed.toLowerCase();
      const alreadyExists = subjects.some(s => s.toLowerCase() === normalized);
      if (!alreadyExists) {
        setSubjects([...subjects, trimmed]);
        setNewSubject('');
      }
    }
  };

  // Remove subject
  const handleRemoveSubject = (subjectToRemove) => {
    setSubjects(subjects.filter(s => s !== subjectToRemove));
  };

  // Save subjects
  const handleSaveSubjects = async () => {
    if (subjects.length === 0) {
      setSubjectsError('At least one subject is required');
      return;
    }
    setSubjectsLoading(true);
    setSubjectsError('');
    setSubjectsSuccess('');
    try {
      const response = await fetch('/api/helpers/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects }),
      });
      const data = await response.json();
      if (data.success) {
        setSubjectsSuccess('Subjects updated successfully');
        setTimeout(() => setSubjectsSuccess(''), 3000);
      } else {
        setSubjectsError(data.error || 'Failed to update subjects');
      }
    } catch (error) {
      setSubjectsError('Failed to update subjects. Please try again.');
    } finally {
      setSubjectsLoading(false);
    }
  };

  const renderHelperCard = (h, isRecommended = false) => {
    const subjectsList = h.subjects ? h.subjects.split(',').map((s) => s.trim()) : [];
    return (
      <div
        key={h.id}
        className="glass-panel"
        style={{
          padding: '1.25rem',
          border: isRecommended ? '1px solid var(--accent-blue-secondary)' : '1px solid var(--border-color)',
          background: 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-cyan) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {getInitials(h.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-main)' }}>{h.name}</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {h.reputation} rep {h.isAvailable ? '• Available' : '• Busy'}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginBottom: '0.75rem' }}>
          {h._count.answers} answered
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
          {subjectsList.length > 0 ? (
            subjectsList.map((s) => (
              <span
                key={s}
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.7rem',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {s}
              </span>
            ))
          ) : (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>No subjects listed</span>
          )}
        </div>

        {h.isAvailable ? (
          <Link
            href="/doubts/new"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-primary)',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent-primary)'}
          >
            Request Help
          </Link>
        ) : (
          <button
            type="button"
            disabled
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              background: '#f1f5f9',
              color: 'var(--text-subtle)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'not-allowed',
              border: '1px solid var(--border-color)',
            }}
          >
            Currently Busy
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>
          Help Someone Learn
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Share what you know and help classmates understand difficult concepts.
        </p>
      </div>

      {/* User fetch loading state */}
      {userLoading && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: 'var(--bg-secondary)', color: 'var(--text-muted)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
          Loading user preferences...
        </div>
      )}

      {/* User fetch error - non-intrusive */}
      {userError && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: 'var(--accent-rose)', color: '#fff', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
          {userError}
        </div>
      )}

      {/* Helper Management Section - Only for HELPER users */}
      {isHelper && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'var(--bg-card)', border: '1px solid var(--accent-primary)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Manage Your Helper Profile
          </h2>

          {/* Availability Toggle */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>
                Availability Status
              </label>
              <button
                type="button"
                onClick={handleToggleAvailability}
                disabled={availabilityLoading}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isAvailable ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: availabilityLoading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                {availabilityLoading ? 'Updating...' : isAvailable ? 'Available' : 'Busy'}
              </button>
            </div>
            {availabilityError && (
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-rose)', marginTop: '0.5rem' }}>
                {availabilityError}
              </p>
            )}
          </div>

          {/* Subjects Management */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Your Subjects
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Add a subject (e.g., Calculus)"
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: '#ffffff',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleAddSubject}
                disabled={!newSubject.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: newSubject.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background 0.15s ease',
                }}
              >
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {subjects.map((s) => (
                <span
                  key={s}
                  style={{
                    background: 'var(--bg-secondary)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(s)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-subtle)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {subjectsError && (
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-rose)', marginBottom: '0.5rem' }}>
                {subjectsError}
              </p>
            )}
            {subjectsSuccess && (
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginBottom: '1rem' }}>
                {subjectsSuccess}
              </p>
            )}
            <button
              type="button"
              onClick={handleSaveSubjects}
              disabled={subjectsLoading}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-primary)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: subjectsLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              {subjectsLoading ? 'Saving...' : 'Save Subjects'}
            </button>
          </div>
        </div>
      )}

      {/* Statistics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Active Helpers
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{stats.activeHelpers}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Avg. Answers
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{stats.avgAnswers}</div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendedHelpers.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>
            {subjectFilter !== 'All' ? `Recommended Helpers for ${subjectFilter}` : 'Recommended Helpers'}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {recommendedHelpers.map((h) => renderHelperCard(h, true))}
          </div>
        </div>
      )}

      {subjectFilter !== 'All' && recommendedHelpers.length === 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', textAlign: 'center', background: 'var(--bg-card)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No available helpers specializing in {subjectFilter} at the moment.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'var(--bg-card)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Search by name
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., Priya"
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: '#ffffff',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Subject
            </label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: '#ffffff',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            >
              {allSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Availability
            </label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: '#ffffff',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            >
              <option value="All">All</option>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: '#ffffff',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            >
              <option value="reputation-desc">Reputation (Highest First)</option>
              <option value="reputation-asc">Reputation (Lowest First)</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: '#f1f5f9',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              border: '1px solid var(--border-color)',
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Helper Directory */}
      {filteredAndSortedHelpers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-card)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>
            No helpers match your current filters.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-primary)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent-primary)'}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredAndSortedHelpers.map((h) => renderHelperCard(h))}
        </div>
      )}
    </div>
  );
}
