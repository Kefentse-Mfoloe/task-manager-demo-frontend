import React from 'react'

export default function GenericSelect({ label, value, onChange, name, ariaInvalid, children, selectProps = {} }) {
  return (
    <label>
      {label}
      <select value={value} onChange={onChange} name={name} aria-invalid={ariaInvalid} {...selectProps}>
        {children}
      </select>
    </label>
  )
}
