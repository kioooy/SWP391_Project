import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, TextField, Select, MenuItem, TablePagination, FormControl, InputLabel
} from '@mui/material';
import axios from 'axios';
import { Phone, Email, Cake, Wc, LocationOn, Bloodtype, MonitorWeight, Height, Badge, CalendarToday, VolunteerActivism, Favorite, HelpOutline } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

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
      setEditUser({
        userId: detail.userId,
        fullName: detail.fullName || '',
        citizenNumber: detail.citizenNumber || '',
        email: detail.email || '',
        phoneNumber: detail.phoneNumber || '',
        dateOfBirth: detail.dateOfBirth ? detail.dateOfBirth.slice(0, 10) : '',
        // Chuyển sex từ boolean sang string
        sex: detail.sex === true ? 'male' : detail.sex === false ? 'female' : '',
        address: detail.address || '',
        bloodTypeName: detail.bloodTypeName || '',
        weight: detail.weight || '',
        height: detail.height || '',
        isDonor: detail.isDonor,
        isRecipient: detail.isRecipient,
        createdAt: detail.createdAt || '',
        updatedAt: detail.updatedAt || '',
        // Mapping roleId từ name
        roleId: roles.find(r => r.name === detail.name)?.id || '',
        accountType: detail.isDonor ? 'donor' : (detail.isRecipient ? 'recipient' : '')
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
    setLoading(true);
    try {
      const body = {
        FullName: editUser.fullName,
        PhoneNumber: editUser.phoneNumber,
        DateOfBirth: editUser.dateOfBirth,
        Sex: editUser.sex === 'male' ? true : false,
        Address: editUser.address,
        BloodTypeId: editUser.bloodTypeId || null,
        IsDonor: editUser.isDonor,
        IsRecipient: editUser.isRecipient
      };
      await axios.patch(`${API_URL}/User/${editUser.userId}/profile`, body, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Cập nhật thành công!', severity: 'success' });
      setOpenDialog(false);
      fetchUsers(); // cập nhật lại danh sách
    } catch (err) {
      setSnackbar({ open: true, message: 'Cập nhật thất bại!', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Xóa mềm người dùng (Admin)
  const handleSoftDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
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
                <TableRow key={u.userId || idx}>
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
                       onClick={() => handleSoftDeleteUser(u.userId)}>
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
          {!editMode && (
            <TextField 
              label="Số CCCD" 
              fullWidth 
              value={editUser?.citizenNumber} 
              onChange={e => setEditUser({ ...editUser, citizenNumber: e.target.value })}
              helperText=""
              sx={{ mb: 1 }}
            />
          )}
          {!editMode && (
            <TextField 
              label="Email" 
              fullWidth 
              value={editUser?.email} 
              onChange={e => setEditUser({ ...editUser, email: e.target.value })}
              helperText=""
              sx={{ mb: 1 }}
            />
          )}
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
            <Select value={editUser?.sex} label="Giới tính" onChange={e => setEditUser({ ...editUser, sex: e.target.value })}>
              <MenuItem value="male">Nam</MenuItem>
              <MenuItem value="female">Nữ</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Địa chỉ" fullWidth value={editUser?.address} onChange={e => setEditUser({ ...editUser, address: e.target.value })} />
          <FormControl fullWidth>
            <InputLabel>Nhóm máu</InputLabel>
            <Select
              value={editUser?.bloodTypeName || ''}
              label="Nhóm máu"
              onChange={e => setEditUser({ ...editUser, bloodTypeName: e.target.value })}
            >
              <MenuItem value="A+">A+</MenuItem>
              <MenuItem value="A-">A-</MenuItem>
              <MenuItem value="B+">B+</MenuItem>
              <MenuItem value="B-">B-</MenuItem>
              <MenuItem value="AB+">AB+</MenuItem>
              <MenuItem value="AB-">AB-</MenuItem>
              <MenuItem value="O+">O+</MenuItem>
              <MenuItem value="O-">O-</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Loại tài khoản</InputLabel>
            <Select
              value={editUser?.accountType || ''}
              label="Loại tài khoản"
              onChange={e => {
                const value = e.target.value;
                setEditUser({
                  ...editUser,
                  isDonor: value === 'donor',
                  isRecipient: value === 'recipient',
                  accountType: value
                });
              }}
            >
              <MenuItem value="donor">Hiến máu</MenuItem>
              <MenuItem value="recipient">Truyền máu</MenuItem>
            </Select>
          </FormControl>
          {!editMode && <TextField label="Mật khẩu" type="password" fullWidth value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />}
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
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManage; 