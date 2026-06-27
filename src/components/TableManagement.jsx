import React, { useState, useEffect } from 'react'
import axios from 'axios'
import AdminLayout from './AdminLayout'
import './TableManagement.css'

const TableManagement = () => {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  
  const [setupData, setSetupData] = useState({
    totalTables: ''
  })

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tables/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setTables(res.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load tables')
      setLoading(false)
    }
  }

  const handleSetupChange = (e) => {
    setSetupData({ totalTables: e.target.value })
  }

  const handleSetupSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post('http://localhost:5000/api/tables/setup', setupData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setSetupData({ totalTables: '' })
      setShowForm(false)
      fetchTables()
    } catch (err) {
      setError(err.response?.data?.message || 'Error setting up tables')
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return

    try {
      await axios.delete(`http://localhost:5000/api/tables/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      fetchTables()
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting table')
    }
  }

  const handleFreeTable = async (id) => {
    if (!window.confirm('Are you sure you want to forcibly free this table?')) return

    try {
      await axios.post(`http://localhost:5000/api/tables/${id}/free`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      fetchTables()
    } catch (err) {
      alert(err.response?.data?.message || 'Error freeing table')
    }
  }

  return (
    <AdminLayout title="Table Management">
      <div className="admin-dashboard-content">
        <div className="table-header-actions">
          <h2>Restaurant Tables</h2>
          <button 
            className="add-table-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '⚙️ Setup Total Tables'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showForm && (
          <div className="table-form-container">
            <h3>Setup Total Restaurant Tables</h3>
            <p style={{ color: "var(--text-gray)", marginBottom: "1rem" }}>
              Enter the total number of tables in your restaurant. The system will automatically generate them (Table 1, Table 2, etc.) and remove any extra tables (unless they are currently occupied).
            </p>
            <form onSubmit={handleSetupSubmit} className="table-form">
              <div className="form-group">
                <label>Total Number of Tables</label>
                <input
                  type="number"
                  name="totalTables"
                  min="1"
                  max="100"
                  value={setupData.totalTables}
                  onChange={handleSetupChange}
                  placeholder="e.g. 15"
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Tables'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div>Loading tables...</div>
        ) : (
          <div className="tables-grid">
            {tables.length === 0 ? (
              <div className="no-tables">No tables set up yet.</div>
            ) : (
              tables.map(table => (
                <div key={table._id} className={`table-card ${table.status}`}>
                  <div className="table-card-header">
                    <h3>{table.name}</h3>
                    <span className="table-number-badge">#{table.tableNumber}</span>
                  </div>
                  
                  <div className="table-status">
                    <span className={`status-badge ${table.status}`}>
                      {table.status === 'available' ? 'Available' : 'Occupied'}
                    </span>
                    {table.status === 'occupied' && table.currentUserId && (
                      <p className="occupied-by">By: {table.currentUserId.name}</p>
                    )}
                  </div>

                  <div className="table-actions">
                    <button onClick={() => handleDelete(table._id)} className="delete-btn">Delete</button>
                    {table.status === 'occupied' && (
                      <button onClick={() => handleFreeTable(table._id)} className="free-btn">Force Free</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default TableManagement
