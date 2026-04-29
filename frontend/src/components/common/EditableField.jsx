// client/src/components/common/EditableField.jsx

const EditableField = ({ value, onChange, editMode, multiline, style, inputStyle }) => {
  const base = {
    background:   editMode ? '#fffbeb' : 'transparent',
    border:       editMode ? '1.5px dashed #f59e0b' : '1.5px solid transparent',
    borderRadius: 4,
    padding:      editMode ? '2px 6px' : '2px 0',
    outline:      'none',
    width:        '100%',
    fontFamily:   'inherit',
    resize:       'none',
    transition:   'all 0.15s',
    ...style,
    ...(inputStyle || {}),
  };

  if (!editMode) return <span style={style}>{value}</span>;

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        style={{ ...base, display: 'block', lineHeight: 1.5 }}
      />
    );
  }

  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...base, display: 'inline-block' }}
    />
  );
};

export default EditableField;
