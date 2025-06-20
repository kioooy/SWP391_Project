import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BloodDonationPeriodManagement = () => {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy token từ localStorage (nếu cần xác thực)
    const token = localStorage.getItem('token');
    axios.get('/api/BloodDonationPeriod', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      setPeriods(res.data);
      setLoading(false);
    })
    .catch(err => {
      alert('Không thể lấy dữ liệu đợt hiến máu!');
      setLoading(false);
    });
  }, []);

  const handleStatusChange = (periodId, newStatus) => {
    const token = localStorage.getItem('token');
    axios.patch(`/api/BloodDonationPeriod/${periodId}/status`, JSON.stringify(newStatus), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    .then(() => {
      setPeriods(periods.map(p =>
        p.periodId === periodId ? { ...p, status: newStatus } : p
      ));
      alert('Cập nhật trạng thái thành công!');
    })
    .catch(() => {
      alert('Cập nhật trạng thái thất bại!');
    });
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Danh sách các đợt hiến máu</h2>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên đợt</th>
            <th>Địa điểm</th>
            <th>Thời gian</th>
            <th>Trạng thái</th>
            <th>Số lượng mục tiêu</th>
            <th>Số lượng hiện tại</th>
          </tr>
        </thead>
        <tbody>
          {periods.map(period => (
            <tr key={period.periodId}>
              <td>{period.periodId}</td>
              <td>{period.periodName}</td>
              <td>{period.location}</td>
              <td>
                {new Date(period.periodDateFrom).toLocaleString()} -<br/>
                {new Date(period.periodDateTo).toLocaleString()}
              </td>
              <td>
                <select
                  value={period.status}
                  onChange={e => handleStatusChange(period.periodId, e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              <td>{period.targetQuantity}</td>
              <td>{period.currentQuantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BloodDonationPeriodManagement; 