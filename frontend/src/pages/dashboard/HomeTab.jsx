// src/components/dashboard/HomeTab.jsx

import React from "react";

export default function HomeTab({ user, documents, onNavigate, loadingDocuments }) {
  // Calculate stats
  const totalDocs = documents?.length || 0;
  const cvDocs = documents?.filter(d => d.type === 'cv') || [];
  const exports = documents?.filter(d => d.type === 'cover-letter' || d.type === 'proposal') || [];
  const drafts = documents?.filter(d => !d.finalized) || [];

  // Get recent documents (last 3)
  const recentDocs = documents?.slice(0, 3) || [];

  return (
    <div style={{ padding: "32px 40px", overflow: 'auto', flex: 1 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
          Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 28, fontSize: 15 }}>
          Manage and create your professional documents
        </p>

        {/* Stats Cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          {[
            ["Total Documents", totalDocs],
            ["Exported", exports.length],
            ["Drafts", drafts.length]
          ].map(([label, val]) => (
            <div key={label} style={{
              flex: "1 1 200px",
              minWidth: 180,
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: 12,
              padding: "20px 24px",
              boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)"
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)" }}>{val}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Recent Documents Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, marginTop: 32 }}>
          <div>
            <h2 style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 18, marginBottom: 2 }}>Recent Documents</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Your latest creations</p>
          </div>
          <button
            onClick={() => onNavigate("create")}
            style={{
              background: "var(--accent-color)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            + Create Document
          </button>
        </div>

        {/* Documents List */}
        {loadingDocuments && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            Loading documents...
          </div>
        )}

        {!loadingDocuments && recentDocs.length === 0 && (
          <div style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: 10,
            padding: "40px 20px",
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <p style={{ fontSize: 15, marginBottom: 12 }}>No documents yet</p>
            <button
              onClick={() => onNavigate("create")}
              style={{
                background: "var(--accent-color)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600
              }}
            >
              Create Your First Document
            </button>
          </div>
        )}

        {!loadingDocuments && recentDocs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentDocs.map((d, i) => (
              <div
                key={i}
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 10,
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 15 }}>{d.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                    Type: <strong>{d.type.toUpperCase().replace('-', ' ')}</strong> • Saved {d.savedAt}
                  </div>
                </div>
                <button
                  onClick={() => onNavigate("create")}
                  style={{
                    background: "var(--bg-color)",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-color)'}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}

        {/* See All Button */}
        {!loadingDocuments && recentDocs.length > 0 && totalDocs > 3 && (
          <button
            onClick={() => onNavigate("documents")}
            style={{
              marginTop: 16,
              background: "none",
              border: "1px solid var(--border-color)",
              borderRadius: 8,
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-primary)",
              width: '100%',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-color)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            View All {totalDocs} Documents →
          </button>
        )}
      </div>
    </div>
  );
}