import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, TextField, Select, MenuItem, TablePagination, FormControl, InputLabel
} from '@mui/material';
import axios from 'axios';
import { Phone, Email, Cake, Wc, LocationOn, Bloodtype, MonitorWeight, Height, Badge, CalendarToday, VolunteerActivism, Favorite, HelpOutline } from '@mui/icons-material';
import sha256 from 'crypto-js/sha256';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// Hàm chuyển ngày sinh sang object {year, month, day, dayOfWeek}
function parseDateToObj(dateStr) {
  if (!dateStr) return { year: 0, month: 0, day: 0, dayOfWeek: 0 };
  const date = new Date(dateStr);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    dayOfWeek: date.getDay()
  };
}

const UserManage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    citizenNumber: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    sex: '',
    address: '',
    roleId: 3,
    password: '',
    isActive: true,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [roles, setRoles] = useState([
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Staff' },
    { id: 3, name: 'Member' },
  ]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  // Thêm state cho dialog xác nhận xóa
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  // Lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/User/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi tải danh sách người dùng!', severity: 'error' });
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Tìm kiếm
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = users.filter((u) =>
      (u.fullName || '').toLowerCase().includes(value.toLowerCase()) ||
      (u.citizenNumber || '').toLowerCase().includes(value.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // Mở dialog sửa, lấy đầy đủ thông tin user từ API
  const handleOpenDialog = async (user) => {
    setEditMode(true);
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/User/${user.userId || user.UserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let detail = res.data;
      console.log('Chi tiết user khi sửa:', detail); // Thêm log để kiểm tra dữ liệu thực tế
      // Map bloodTypeName sang bloodTypeId
      const bloodTypeId = bloodTypes.find(bt => bt.name === detail.bloodTypeName)?.id || 0;
      // Map roleName sang roleId
      const roleId = roles.find(r => r.name === detail.name)?.id || 0;
      setEditUser({
        userId: detail.userId || '',
        fullName: detail.fullName || '',
        citizenNumber: detail.citizenNumber || '',
        email: detail.email || '',
        phoneNumber: detail.phoneNumber || '',
        dateOfBirth: detail.dateOfBirth ? detail.dateOfBirth.split('T')[0] : '',
        sex: typeof detail.sex === 'boolean' ? detail.sex : true,
        address: detail.address || '',
        roleId,
        passwordHash: detail.passwordHash || '',
        bloodTypeId,
        weight: detail.weight || 0,
        height: detail.height || 0,
        isDonor: detail.isDonor ?? true,
        isRecipient: detail.isRecipient ?? false,
        accountType: (detail.isDonor) && (detail.isRecipient) ? 'both' : (detail.isDonor) ? 'donor' : 'recipient',
        newPassword: ''
      });
      setOpenDialog(true);
    } catch (err) {
      setSnackbar({ open: true, message: 'Không lấy được thông tin chi tiết người dùng!', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      fullName: '',
      citizenNumber: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      sex: '',
      address: '',
      roleId: 3,
      password: '',
      isActive: true,
    });
    setEditUser(null);
  };

  // Thêm mới người dùng
  const handleCreate = async () => {
    try {
      const req = { ...formData, sex: formData.sex === 'male', roleId: Number(formData.roleId) };
      await axios.post(`${API_URL}/User/create`, req, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Đã thêm người dùng thành công!', severity: 'success' });
      fetchUsers();
      handleCloseDialog();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Lỗi khi thêm người dùng!', severity: 'error' });
    }
  };

  // Sửa thông tin người dùng (Admin)
  const handleEditUser = async () => {
    if (!editUser) return;
    // Kiểm tra các trường bắt buộc
    if (!editUser.fullName || !editUser.citizenNumber || !editUser.email || !editUser.phoneNumber) {
      setSnackbar({ open: true, message: 'Vui lòng nhập đầy đủ Họ tên, Số CCCD, Email, SĐT!', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      // Chuyển dateOfBirth về string yyyy-MM-dd
      let dateStr = editUser.dateOfBirth;
      if (typeof dateStr === 'object' && dateStr.year) {
        dateStr = `${dateStr.year}-${String(dateStr.month).padStart(2, '0')}-${String(dateStr.day).padStart(2, '0')}`;
      }
      // Nếu là sửa user, chỉ gửi passwordHash nếu có newPassword, còn lại không gửi trường này
      const body = {
        fullName: editUser.fullName,
        citizenNumber: editUser.citizenNumber,
        email: editUser.email,
        phoneNumber: editUser.phoneNumber,
        dateOfBirth: dateStr,
        sex: editUser.sex,
        address: editUser.address,
        roleId: editUser.roleId,
        bloodTypeId: editUser.bloodTypeId,
        weight: editUser.weight,
        height: editUser.height,
        isDonor: editUser.accountType === 'donor' || editUser.accountType === 'both',
        isRecipient: editUser.accountType === 'recipient' || editUser.accountType === 'both'
      };
      if (editUser.newPassword) {
        body.passwordHash = sha256(editUser.newPassword).toString();
      }
      console.log('PATCH body:', body);
      const res = await axios.patch(`${API_URL}/User/${editUser.userId}`, body, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let updatedUser = res.data;
      if (Array.isArray(res.data)) {
        updatedUser = res.data.find(u => u.userId === editUser.userId) || res.data[0];
      }
      setUsers(users.map(u => u.userId === updatedUser.userId ? updatedUser : u));
      setFilteredUsers(filteredUsers.map(u => u.userId === updatedUser.userId ? updatedUser : u));
      setSnackbar({ open: true, message: 'Cập nhật thành công!', severity: 'success' });
      fetchUsers(); // Thêm dòng này để refresh lại danh sách
      setOpenDialog(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Cập nhật thất bại!', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Xóa mềm người dùng (Admin)
  const handleSoftDeleteUser = async (userId) => {
    setLoading(true);
    try {
      await axios.patch(`${API_URL}/User/soft-delete`, { UserId: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Đã xóa người dùng!', severity: 'success' });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Xóa thất bại!', severity: 'error' });
    } finally {
      setLoading(false);
      setConfirmDeleteOpen(false);
      setUserIdToDelete(null);
    }
  };

  // Xem chi tiết người dùng (gọi API lấy chi tiết)
  const handleViewDetail = async (user) => {
    try {
      const res = await axios.get(`${API_URL}/User/${user.userId || user.UserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Xử lý response trả về dạng object hoặc object lồng
      let detail = res.data;
      if (detail && typeof detail === 'object') {
        if (detail.user) detail = detail.user;
        else if (Array.isArray(detail) && detail.length > 0) detail = detail[0];
      }
      setDetailUser(detail);
      setDetailDialogOpen(true);
    } catch (err) {
      setDetailUser({ fullName: user.fullName, citizenNumber: user.citizenNumber, email: user.email });
      setDetailDialogOpen(true);
    }
  };

  // Phân trang
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Map tên nhóm máu sang id (giả sử bạn có danh sách bloodTypes)
  const bloodTypes = [
    { id: 1, name: 'A+' },
    { id: 2, name: 'A-' },
    { id: 3, name: 'B+' },
    { id: 4, name: 'B-' },
    { id: 5, name: 'AB+' },
    { id: 6, name: 'AB-' },
    { id: 7, name: 'O+' },
    { id: 8, name: 'O-' },
  ];
  const getBloodTypeIdByName = (name) => {
    const found = bloodTypes.find(bt => bt.name === name);
    return found ? found.id : null;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#E53935' }}>
        Quản Lý Người Dùng
      </Typography>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <TextField
          label="Tìm kiếm theo tên, email, số CCCD"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: '70%' }}
        />
        {/* Đã xóa nút Thêm người dùng */}
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead style={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><b>Họ tên</b></TableCell>
              <TableCell><b>Số CCCD</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Loại tài khoản</b></TableCell>
              <TableCell><b>Trạng thái</b></TableCell>
              <TableCell><b>Hành động</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers
              .filter(u => u.role === "Member" || u.roleId === 3)
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((u, idx) => (
                <TableRow
                  key={u.userId}
                  style={u.isActive === false ? { opacity: 0.5, background: '#f5f5f5' } : {}}
                >
                  <TableCell>{u.fullName}</TableCell>
                  <TableCell>{u.citizenNumber}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {(u.isDonor && u.isRecipient && "Hiến & Truyền máu") ||
                     (u.isDonor && "Hiến máu") ||
                     (u.isRecipient && "Truyền máu") ||
                     "Không xác định"}
                  </TableCell>
                  <TableCell>{u.isActive === false ? 'Vô hiệu' : 'Hoạt động'}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => handleOpenDialog(u)} sx={{ mr: 1 }}>Sửa</Button>
                    <Button size="small" color="info" variant="contained" onClick={() => handleViewDetail(u)} sx={{ mr: 1 }}>Xem</Button>
                    <Button size="small" 
                       sx={{ backgroundColor: 'error.main', color: '#fff', '&:hover': { backgroundColor: 'error.dark' } }}
                       onClick={() => {
                         setUserIdToDelete(u.userId);
                         setConfirmDeleteOpen(true);
                       }}>
                       Xóa
                     </Button>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredUsers.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số người dùng/trang"
        rowsPerPageOptions={[5, 10, 25]}
      />
      {/* Dialog thêm/sửa */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Sửa người dùng' : 'Thêm người dùng'}</DialogTitle>
        <DialogContent style={{ display: 'grid', gap: 12 }}>
          <TextField label="Họ tên" fullWidth value={editUser?.fullName} onChange={e => setEditUser({ ...editUser, fullName: e.target.value })} InputLabelProps={{ shrink: true }} margin="normal" sx={{ mt: 4 }} />
          <TextField label="Số CCCD" fullWidth value={editUser?.citizenNumber} onChange={e => setEditUser({ ...editUser, citizenNumber: e.target.value })} InputLabelProps={{ shrink: true }} margin="normal" />
          {/* Ẩn trường nhập email */}
          <TextField
            label="SĐT"
            fullWidth
            value={editUser?.phoneNumber}
            onChange={e => {
              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
              setEditUser({ ...editUser, phoneNumber: value });
            }}
            type="tel"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 10 }}
            error={editUser?.phoneNumber && editUser.phoneNumber.length !== 10}
            helperText={
              editUser?.phoneNumber && editUser.phoneNumber.length !== 10
                ? "Số điện thoại phải đủ 10 số"
                : ""
            }
          />
          <TextField label="Ngày sinh" type="date" fullWidth InputLabelProps={{ shrink: true }} value={editUser?.dateOfBirth} onChange={e => setEditUser({ ...editUser, dateOfBirth: e.target.value })} />
          <FormControl fullWidth>
            <InputLabel>Giới tính</InputLabel>
            <Select
              value={typeof editUser?.sex === 'boolean' ? (editUser.sex ? 'male' : 'female') : ''}
              onChange={e => setEditUser({ ...editUser, sex: e.target.value === 'male' })}
              label="Giới tính"
            >
              <MenuItem value="male">Nam</MenuItem>
              <MenuItem value="female">Nữ</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Địa chỉ"
            fullWidth
            value={editUser?.address}
            onChange={e => setEditUser({ ...editUser, address: e.target.value })}
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
          <FormControl fullWidth>
            <InputLabel>Nhóm máu</InputLabel>
            <Select
              value={editUser?.bloodTypeId || ''}
              onChange={e => setEditUser({ ...editUser, bloodTypeId: Number(e.target.value) })}
              label="Nhóm máu"
            >
              {bloodTypes.map(bt => <MenuItem key={bt.id} value={bt.id}>{bt.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Loại tài khoản</InputLabel>
            <Select
              value={editUser?.accountType || ''}
              onChange={e => {
                const type = e.target.value;
                setEditUser({ ...editUser, accountType: type });
              }}
              label="Loại tài khoản"
            >
              <MenuItem value="donor">Hiến máu</MenuItem>
              <MenuItem value="recipient">Truyền máu</MenuItem>
              {/* <MenuItem value="both">Cả hai</MenuItem> */}
            </Select>
          </FormControl>
          <TextField label="Cân nặng (kg)" fullWidth value={editUser?.weight} onChange={e => setEditUser({ ...editUser, weight: e.target.value })} InputLabelProps={{ shrink: true }} type="number" />
          <TextField label="Chiều cao (cm)" fullWidth value={editUser?.height} onChange={e => setEditUser({ ...editUser, height: e.target.value })} InputLabelProps={{ shrink: true }} type="number" />
          <FormControl fullWidth>
            <InputLabel>Vai trò</InputLabel>
            <Select
              value={editUser?.roleId || ''}
              onChange={e => setEditUser({ ...editUser, roleId: Number(e.target.value) })}
              label="Vai trò"
            >
              {roles.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
            </Select>
          </FormControl>
          {/* Chỉ hiện trường nhập mật khẩu khi thêm mới user */}
          {!editMode && (
            <TextField label="Mật khẩu mới" type="password" fullWidth value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} InputLabelProps={{ shrink: true }} margin="normal" />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Huỷ</Button>
          <Button onClick={editMode ? handleEditUser : handleCreate} variant="contained" color="primary" disabled={loading}>{editMode ? 'Cập nhật' : 'Thêm'}</Button>
        </DialogActions>
      </Dialog>
      {/* Dialog xem chi tiết */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết người dùng</DialogTitle>
        <DialogContent dividers>
          {detailUser && (
            <div style={{ display: 'grid', gap: 10 }}>
              <div><Badge sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /><b>Họ tên:</b> {detailUser.fullName || 'Chưa cập nhật'}</div>
              <div><Badge sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /><b>Số CCCD:</b> {detailUser.citizenNumber || 'Chưa cập nhật'}</div>
              <div><Email sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /><b>Email:</b> {detailUser.email || 'Chưa cập nhật'}</div>
              <div><Phone sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /><b>SĐT:</b> {detailUser.phoneNumber || 'Chưa cập nhật'}</div>
              <div><Cake sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /><b>Ngày sinh:</b> {detailUser.dateOfBirth ? new Date(detailUser.dateOfBirth).toLocaleDateString() : 'Chưa cập nhật'}</div>
              <div><Wc sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /><b>Giới tính:</b> {detailUser.sex === true ? 'Nam' : detailUser.sex === false ? 'Nữ' : 'Chưa cập nhật'}</div>
              <div><LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /><b>Địa chỉ:</b> {detailUser.address || 'Chưa cập nhật'}</div>
              <div><Bloodtype sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /><b>Nhóm máu:</b> {detailUser.bloodTypeName || 'Chưa cập nhật'}</div>
              <div>
                <VolunteerActivism sx={{ color: 'gray', verticalAlign: 'middle', mr: 1 }} />
                <b>Loại tài khoản:</b>
                {detailUser.isDonor && detailUser.isRecipient && ' Người hiến & nhận máu'}
                {detailUser.isDonor && !detailUser.isRecipient && ' Người hiến máu'}
                {!detailUser.isDonor && detailUser.isRecipient && ' Người nhận máu'}
                {!detailUser.isDonor && !detailUser.isRecipient && ' Không xác định'}
              </div>
              <div><MonitorWeight sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /><b>Cân nặng:</b> {detailUser.weight ? `${detailUser.weight} kg` : 'Chưa cập nhật'}</div>
              <div><Height sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /><b>Chiều cao:</b> {detailUser.height ? `${detailUser.height} cm` : 'Chưa cập nhật'}</div>
              <div><CalendarToday sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /><b>Ngày tạo:</b> {detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleString() : 'Chưa cập nhật'}</div>
              <div><CalendarToday sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /><b>Ngày cập nhật:</b> {detailUser.updatedAt ? new Date(detailUser.updatedAt).toLocaleString() : 'Chưa cập nhật'}</div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
      {/* Dialog xác nhận xóa */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn xóa người dùng này?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Hủy</Button>
          <Button color="error" onClick={() => handleSoftDeleteUser(userIdToDelete)} autoFocus>Xóa</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManage; 