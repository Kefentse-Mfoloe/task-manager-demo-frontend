import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addUser, removeUser, setUsers } from '../store/usersSlice'
import { useEffect } from 'react'

function validateEmail(editedEmail) {
  return editedEmail && editedEmail.includes('@');
}

function validatePassword(editedPassword) {
  if (!editedPassword || editedPassword.length < 8) return false;
  const hasUpper = /[A-Z]/.test(editedPassword);
  const hasLower = /[a-z]/.test(editedPassword);
  const hasDigit = /[0-9]/.test(editedPassword);
  return hasUpper && hasLower && hasDigit;
}

function formatDate(value) {
  try {
    return value ? new Date(value).toLocaleString() : ''
  } catch (e) {
    return value
  }
}

export default function Users() {
  const users = useSelector((s) => s.users.list);
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errorObject = {}
    if (!firstName.trim()) errorObject.firstName = 'First name is required';
    if (!lastName.trim()) errorObject.lastName = 'Last name is required';
    if (!validateEmail(email)) errorObject.email = 'Valid email is required';
    if (!validatePassword(password))
      errorObject.password = 'Password must be 8+ chars with upper, lower and digit';
    return errorObject;
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const now = new Date().toISOString()
    const newUser = { firstName, lastName, email, password, isActive, createdDate: now, modifiedDate: now }

    try {
      const res = await fetch('https://localhost:7026/api/TaskManager/AddUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })

      if (!res.ok) {
        const processingResult = await res.json();
        setErrors({ submit: `Server error: ${processingResult.error || 'Unknown error'}` });
        return;
      }

      const processingResult = await res.json()
      // processingResult: { succeeded: bool, error: string, resultId: guid | null }
      if (processingResult.succeeded) {
        // update newUser with returned id
        newUser.id = processingResult.resultId;
        newUser.createdDate = newUser.createdDate || new Date().toISOString()
        newUser.modifiedDate = newUser.modifiedDate || new Date().toISOString() || newUser.createdDate
        //newUser.Id = processingResult.resultId || newUser.id
        dispatch(addUser(newUser));

        // clear form
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setIsActive(true);
        setErrors({});
      } else {
        setErrors({ submit: processingResult.error || 'Processing failed' });
      }
    } catch (err) {
      setErrors({ submit: err.message || 'Network error' });
    }
  }

  useEffect(() => {
    let mounted = true
    const fetchUsers = async () => {
      try {
        const res = await fetch('https://localhost:7026/api/TaskManager/GetUsers')
        if (!res.ok) return
        const data = await res.json()
        if (mounted && Array.isArray(data)) {
          // ensure timestamps exist on each user
          const mapped = data.map((u) => ({
            ...u,
            createdDate: u.createdDate || u.CreatedDate || new Date().toISOString(),
            modifiedDate: u.modifiedDate || u.ModifiedDate || u.createdDate || new Date().toISOString(),
          }))
          dispatch(setUsers(mapped))
        }
      } catch (err) {
        // ignore for now
      }
    }
    fetchUsers()
    return () => {
      mounted = false
    }
  }, [dispatch])

  const handleDeactivate = async (userId) => {
    try {
      const res = await fetch(`https://localhost:7026/api/TaskManager/DeactivateUser?userId=${userId}`, {
        method: 'POST',
      })
      if (!res.ok) {
        const text = await res.text()
        setErrors({ submit: `Server error: ${res.status} ${text}` })
        return
      }
      const processingResult = await res.json()
      if (processingResult.succeeded) {
        dispatch(removeUser(userId))
      } else {
        setErrors({ submit: processingResult.error || 'Deactivate failed' })
      }
    } catch (err) {
      setErrors({ submit: err.message || 'Network error' })
    }
  }

  return (
    <div>
      <h2>Users</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }} noValidate>
        <div>
          <label>
            First name:
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              aria-invalid={!!errors.firstName}
            />
          </label>
          {errors.firstName && <div style={{ color: 'red' }}>{errors.firstName}</div>}
        </div>

        <div>
          <label>
            Last name:
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              aria-invalid={!!errors.lastName}
            />
          </label>
          {errors.lastName && <div style={{ color: 'red' }}>{errors.lastName}</div>}
        </div>

        <div>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
            />
          </label>
          {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
        </div>

        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
            />
          </label>
          {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}
        </div>

        <div>
          <label>
            Is Active:
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
          </label>
        </div>
        {errors.submit && <div style={{ color: 'red' }}>{errors.submit}</div>}

        <div>
          <button type="submit">Add User</button>
        </div>
      </form>

      <h3>Available Users</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id} style={{ marginBottom: 8 }}>
            <div>
              <strong>{user.firstName} {user.lastName}</strong> ({user.email}) {user.isActive ? '• active' : '• inactive'}
            </div>
            <div style={{ fontSize: '0.9em', color: '#555' }}>
              Created: {formatDate(user.createdDate || user.CreatedDate)} — Modified: {formatDate(user.modifiedDate || user.ModifiedDate)}
            </div>
            <div>
              <button onClick={() => handleDeactivate(user.id)}>Deactivate</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
