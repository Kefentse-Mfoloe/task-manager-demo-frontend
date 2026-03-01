import React from 'react'

export default function Home() {
  return (
    <div>
      <h1>Task Manager (Demo)</h1>

      <p>Welcome to the Task Manager demo application. Use the navigation to manage Users and Tasks.</p>

      <section>
        <h2>Users</h2>
        <p>Manage application users:</p>
        <ul>
          <li>Add new users with first/last name, email and password.</li>
          <li>Deactivate users (soft-remove) which preserves history and dates.</li>
          <li>See created and modified dates for each user.</li>
        </ul>
      </section>

      <section>
        <h2>Tasks</h2>
        <p>Create and manage tasks assigned to users:</p>
        <ul>
          <li>Create tasks with title, description, priority and assignee.</li>
          <li>Filter tasks by priority and view search results returned from the API.</li>
          <li>Open a task to view its full details and status history (newest first).</li>
          <li>Update a task's priority and status with comments; updates are posted to the API and reflected in the UI.</li>
        </ul>
      </section>
    </div>
  )
}
