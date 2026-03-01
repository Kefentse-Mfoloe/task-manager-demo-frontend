import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addUser, removeUser, setUsers } from '../store/usersSlice'
import { useEffect } from 'react'
import { getJson, postJson } from '../utils/api'
import { API_BASE } from '../store/store'
import LabelField from '../components/LabelField'
import UserList from '../components/UserList'
import { validate } from '../utils/validatUser'

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

  // validation moved to src/utils/userValidate.js

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const validationErrors = validate({ firstName, lastName, email, password });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const now = new Date().toISOString()
    const newUser = { firstName, lastName, email, password, isActive, createdDate: now, modifiedDate: now }

    try {
      const responseObj = await postJson(`${API_BASE}AddUser`, newUser)
      if (!responseObj.ok) {
        setErrors({ submit: responseObj.data?.error || responseObj.text || 'Unknown error' })
        return
      }

      const processingResult = responseObj.data
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
        const responseObj = await getJson(`${API_BASE}GetUsers`)
        if (!responseObj.ok) return
        const data = responseObj.data
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
      const responseObj = await postJson(`${API_BASE}DeactivateUser?userId=${userId}`)
      if (!responseObj.ok) {
        setErrors({ submit: responseObj.data?.error || responseObj.text || 'Unknown error' })
        return
      }
      const processingResult = responseObj.data
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
        <LabelField label="First name:" error={errors.firstName}>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            aria-invalid={!!errors.firstName}
          />
        </LabelField>

        <LabelField label="Last name:" error={errors.lastName}>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            aria-invalid={!!errors.lastName}
          />
        </LabelField>

        <LabelField label="Email:" error={errors.email}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
          />
        </LabelField>

        <LabelField label="Password:" error={errors.password}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
          />
        </LabelField>

        <LabelField label="Is Active:">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        </LabelField>
        {errors.submit && <div style={{ color: 'red' }}>{errors.submit}</div>}

        <div>
          <button type="submit">Add User</button>
        </div>
      </form>

      <h3>Available Users</h3>
      <UserList users={users} onDeactivate={handleDeactivate} formatDate={formatDate} />
    </div>
  )
}
