// client/src/components/document/DocumentPreview.jsx
import { forwardRef } from 'react';

const DocumentPreview = forwardRef(({ children, editMode, onToggleEditMode, paperSize = 'A4' }, ref) => {
  const getDims = () => {
    switch (paperSize) {
      case 'Letter': return { width: '8.5in', height: '11in' };
      case 'Legal': return { width: '8.5in', height: '14in' };
      default: return { width: '210mm', height: '297mm' }; // A4
    }
  };
  const dims = getDims();

  return (
  <div style={{ flex: 1, background: '#f8fafc', overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <style>{`
      @media print {
        @page { size: ${paperSize} portrait; margin: 0; }
        body { margin: 0; }
      }
    `}</style>
    {/* Edit mode toggle */}
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, width: '100%', maxWidth: dims.width }}>
      <button
        onClick={onToggleEditMode}
        style={{
          background: editMode ? '#f59e0b' : '#fff',
          color:      editMode ? '#fff'    : '#1e3a5f',
          border:     editMode ? 'none'    : '1.5px solid #1e3a5f',
          borderRadius: 8, padding: '7px 18px', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 1px 4px #0001', transition: 'all 0.15s',
        }}
      >
        {editMode ? '✅ Done Editing' : '✏ Edit Document'}
      </button>
    </div>

    {/* Preview card */}
    <div
      ref={ref}
      style={{
        background: '#fff', position: 'relative',
        width: dims.width, height: dims.height,
        boxShadow: editMode ? '0 0 0 2px #f59e0b, 0 4px 24px #0000000d' : '0 4px 24px #0000000d',
        transition: 'all 0.3s ease',
        margin: '0 auto',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}
    >
      {editMode && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#fef3c7', borderBottom: '1px solid #f59e0b', padding: '5px 14px', fontSize: 11, color: '#92400e', fontWeight: 600, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          ✏ Click any text in the document to edit it directly
        </div>
      )}
      <div style={{ outline: 'none', marginTop: editMode ? 30 : 0, cursor: editMode ? 'text' : 'default', transition: 'margin-top 0.2s', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  </div>
  );
});

DocumentPreview.displayName = 'DocumentPreview';
export default DocumentPreview;
