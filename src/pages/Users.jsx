import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addUser, removeUser } from '../store/usersSlice'

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

    const newUser = { firstName, lastName, email, password, isActive };

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

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.firstName} {user.lastName} ({user.email}) {user.isActive ? '• active' : '• inactive'}{' '}
            <button onClick={() => dispatch(removeUser(user.id))}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
