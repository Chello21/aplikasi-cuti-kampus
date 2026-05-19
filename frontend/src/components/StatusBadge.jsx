const StatusBadge = ({ status, type = 'sekjur' }) => {
  const getClass = (s) => {
    const map = {
      'Menunggu':  'status-menunggu',
      'Diterima':  'status-diterima',
      'Ditolak':   'status-ditolak',
      'Dipanggil': 'status-dipanggil',
    };
    return map[s] || 'status-menunggu';
  };

  const getIcon = (s) => {
    const map = {
      'Menunggu':  '⏳',
      'Diterima':  '✅',
      'Ditolak':   '❌',
      'Dipanggil': '📞',
    };
    return map[s] || '⏳';
  };

  return (
    <span className={`status-badge ${getClass(status)}`}>
      {getIcon(status)} {status || 'Menunggu'}
    </span>
  );
};

export default StatusBadge;
