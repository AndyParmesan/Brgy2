import React, { useState, useEffect, useRef } from 'react';

const GlobalSearch = ({ authToken }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const searchRef = useRef(null);

  // Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        performSearch(searchQuery.trim());
      } else {
        setResults([]);
        setIsOpen(false);
        setErrorMsg('');
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, authToken]);

  const performSearch = async (term) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResults(data.results || []);
        setIsOpen(true);
      } else {
        console.error("Backend Error:", data.message);
        setErrorMsg('Server error. Check Node.js terminal.');
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Network failed:", error);
      setErrorMsg('Could not connect to server.');
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (type, status) => {
    if (type === 'Resident') return '#3b82f6';
    if (type === 'Blotter') return '#ef4444';
    switch (status?.toLowerCase()) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    // We added your original CSS classes back here!
    <div className="search-box top-search" ref={searchRef} style={{ position: 'relative' }}>
      <input
        type="search"
        placeholder="Search residents, docs, blotters..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => { if (searchQuery.length > 1) setIsOpen(true) }}
      />
      
      {/* Dropdown Results */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0,
          background: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb', zIndex: 50, maxHeight: '400px', overflowY: 'auto'
        }}>
          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Searching...</div>
          ) : errorMsg ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#ef4444' }}>{errorMsg}</div>
          ) : results.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>No results found</div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {results.map((item, index) => (
                <li key={`${item.type}-${item.id}-${index}`} style={{
                  padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '0.875rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.subtitle}</div>
                  </div>
                  <span style={{
                    background: getBadgeColor(item.type, item.status), color: 'white',
                    padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 'bold'
                  }}>
                    {item.type}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;