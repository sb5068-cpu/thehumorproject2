'use client'
import { useState } from 'react'

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
  mono?: boolean
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  emptyMessage?: string
}

export default function DataTable({ columns, data, onEdit, onDelete, emptyMessage = 'No data found' }: DataTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: '10px 16px',
                textAlign: 'left',
                fontSize: 11,
                fontFamily: 'IBM Plex Mono, monospace',
                color: 'var(--text3)',
                letterSpacing: '0.08em',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                position: 'sticky',
                top: 0,
                background: 'var(--bg2)',
                zIndex: 1,
              }}>
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th style={{
                padding: '10px 16px',
                textAlign: 'right',
                fontSize: 11,
                fontFamily: 'IBM Plex Mono, monospace',
                color: 'var(--text3)',
                letterSpacing: '0.08em',
                position: 'sticky',
                top: 0,
                background: 'var(--bg2)',
                zIndex: 1,
              }}>ACTIONS</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{
                padding: '40px 16px',
                textAlign: 'center',
                color: 'var(--text3)',
                fontSize: 13,
              }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id ?? i}
                style={{
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.1s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = 'var(--bg3)')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                {columns.map(col => (
                  <td key={col.key} style={{
                    padding: '10px 16px',
                    fontSize: 13,
                    color: 'var(--text)',
                    fontFamily: col.mono ? 'IBM Plex Mono, monospace' : 'inherit',
                    maxWidth: 300,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? <span style={{ color: 'var(--text3)' }}>—</span>)}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td style={{ padding: '10px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        style={{
                          padding: '4px 12px',
                          background: 'transparent',
                          border: '1px solid var(--border2)',
                          borderRadius: 5,
                          color: 'var(--text2)',
                          fontSize: 12,
                          marginRight: 6,
                        }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)' }}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        style={{
                          padding: '4px 12px',
                          background: 'transparent',
                          border: '1px solid var(--border2)',
                          borderRadius: 5,
                          color: 'var(--text2)',
                          fontSize: 12,
                        }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)' }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
