import React, { useEffect, useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import axios from "axios";

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const BlogManage = () => {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5250/api";
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBlog, setNewBlog] = useState({
    Title: "",
    Content: "",
    ImageUrl: "",
    Status: "Draft",
    IsActive: true,
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editBlog, setEditBlog] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [newBlogImagePreview, setNewBlogImagePreview] = useState("");
  const [editBlogImagePreview, setEditBlogImagePreview] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${API_URL}/Blog/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Sắp xếp: blog active lên trước, inactive xuống cuối
        const sorted = [...res.data].sort((a, b) => {
          const aActive = a.IsActive !== undefined ? a.IsActive : a.isActive;
          const bActive = b.IsActive !== undefined ? b.IsActive : b.isActive;
          return (bActive === true ? 1 : 0) - (aActive === true ? 1 : 0);
        });
        setBlogs(sorted);
        setFilteredBlogs(sorted);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách blogs:", error);
      }
    };

    fetchBlogs();
  }, []);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = blogs.filter((b) =>
      (b.Title || b.title || '').toLowerCase().includes(value.toLowerCase())
    );
    // Sắp xếp lại: active trước, inactive sau
    const sorted = [...filtered].sort((a, b) => {
      const aActive = a.IsActive !== undefined ? a.IsActive : a.isActive;
      const bActive = b.IsActive !== undefined ? b.IsActive : b.isActive;
      return (bActive === true ? 1 : 0) - (aActive === true ? 1 : 0);
    });
    setFilteredBlogs(sorted);
  };

  const handleCreate = async () => {
    const { Title, Content, ImageUrl, Status } = newBlog;
    if (!Title || !Content) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('userId', user?.UserId || user?.userId);
      formData.append('title', Title);
      formData.append('content', Content);
      formData.append('status', Status);
      formData.append('imageUrl', ImageUrl || ''); // Ảnh không bắt buộc
      await axios.post(
        `${API_URL}/Blog`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Lấy lại danh sách mới
      const res = await axios.get(`${API_URL}/Blog/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = [...res.data].sort((a, b) => {
        const aActive = a.IsActive !== undefined ? a.IsActive : a.isActive;
        const bActive = b.IsActive !== undefined ? b.IsActive : b.isActive;
        return (bActive === true ? 1 : 0) - (aActive === true ? 1 : 0);
      });
      setBlogs(sorted);
      setFilteredBlogs(sorted);
      setNewBlog({
        Title: "",
        Content: "",
        ImageUrl: "",
        Status: "Draft",
        IsActive: true,
      });
      setIsCreateOpen(false);
      setSnackbarMessage("Bài viết đã được tạo thành công!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Lỗi tạo blog:", error);
      alert("Tạo bài viết thất bại.");
    }
  };

  const handleEdit = (b) => {
    setEditBlog({
      postId: b.postId,
      title: b.title,
      content: b.content,
      status: b.status,
      imageUrl: b.imageUrl,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    const { postId, title, content, imageUrl, status } = editBlog;
    if (!title || !content) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('status', status);
      formData.append('imageUrl', imageUrl || ''); // Ảnh không bắt buộc
      await axios.patch(
        `${API_URL}/Blog/${postId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Reload lại danh sách
      const res = await axios.get(`${API_URL}/Blog/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(res.data);
      setFilteredBlogs(res.data);
      setIsEditOpen(false);
      setEditBlog(null);
      setSnackbarMessage("Bài viết đã được cập nhật thành công!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Lỗi khi cập nhật blog:", error);
      alert("Cập nhật blog thất bại.");
    }
  };

  const handleViewDetail = (b) => {
    setSelectedBlog(b);
    setIsDetailOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleChangeActive = async (id, value) => {
    const blog = blogs.find(b => b.PostId === id || b.postId === id);
    if (!blog) {
      setSnackbarOpen(true);
      setSnackbarMessage('❌ Không tìm thấy blog để cập nhật trạng thái!');
      return;
    }
    try {
      if (value === "inactive") {
        await axios.patch(
          `${API_URL}/Blog/${id}/deactivate`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.patch(
          `${API_URL}/Blog/${id}/activate`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // Reload lại danh sách
      const res = await axios.get(`${API_URL}/Blog/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sắp xếp lại: active trước, inactive sau
      const sorted = [...res.data].sort((a, b) => {
        const aActive = a.IsActive !== undefined ? a.IsActive : a.isActive;
        const bActive = b.IsActive !== undefined ? b.IsActive : b.isActive;
        return (bActive === true ? 1 : 0) - (aActive === true ? 1 : 0);
      });
      setBlogs(sorted);
      setFilteredBlogs(sorted);
      setPage(0);
      setSnackbarOpen(true);
      setSnackbarMessage(value === 'inactive' ? '🛑 Đã vô hiệu hóa blog!' : '✅ Đã kích hoạt blog!');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setSnackbarOpen(true);
        setSnackbarMessage('❌ Blog không tồn tại hoặc đã bị xóa!');
      } else {
        setSnackbarOpen(true);
        setSnackbarMessage('❌ Lỗi khi cập nhật trạng thái kích hoạt!');
      }
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#E53935', mb: 4 }}>
        Quản Lý Bài Viết
      </Typography>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <TextField
          label="Tìm kiếm theo tiêu đề"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: "70%" }}
        />
        <Button variant="contained" onClick={() => setIsCreateOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
          <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
          </svg> Thêm Bài Viết
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead style={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>Tiêu đề</strong></TableCell>
              <TableCell><strong>Trạng thái</strong></TableCell>
              <TableCell><strong>Kích hoạt</strong></TableCell>
              <TableCell><strong>Ngày đăng</strong></TableCell>
              <TableCell><strong>Ngày cập nhật</strong></TableCell>
              <TableCell><strong>Thao tác</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBlogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" style={{ color: '#888', fontStyle: 'italic' }}>
                  Hiện chưa có bài viết nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredBlogs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((b, idx) => (
                  <TableRow
                    key={b.PostId || b.postId || idx}
                    style={
                      b.isActive === false || b.IsActive === false
                        ? { backgroundColor: '#f5f5f5', color: '#aaa' }
                        : {}
                    }
                  >
                    <TableCell>{b.Title || b.title}</TableCell>
                    <TableCell>
                      {b.status === 'Published'
                        ? 'Đã xuất bản'
                        : b.status === 'Draft'
                          ? 'Bản nháp'
                          : 'Không xác định'}
                    </TableCell>
                    <TableCell>
                      {b.isActive === true || b.IsActive === true ? (
                        <span style={{ color: '#388e3c', fontWeight: 600 }}>Kích hoạt</span>
                      ) : (
                        <span style={{ color: '#888', fontWeight: 600 }}>Vô hiệu hóa</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDateTime(b.PublishedDate || b.publishedDate)}</TableCell>
                    <TableCell>{formatDateTime(b.UpdatedDate || b.updatedDate)}</TableCell>
                    <TableCell>
                      <div style={{ display: "flex", gap: 6, flexWrap: "nowrap", alignItems: "center" }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleEdit(b)}
                          sx={{ mr: 1 }}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="small"
                          color="info"
                          variant="contained"
                          onClick={() => handleViewDetail(b)}
                          sx={{ mr: 1 }}
                        >
                          Xem
                        </Button>
                        {(b.isActive === true || b.IsActive === true) ? (
                          <Button
                            size="small"
                            variant="contained"
                            sx={{ backgroundColor: 'error.main', color: '#fff', '&:hover': { backgroundColor: 'error.dark' } }}
                            onClick={() => {
                              setBlogToDelete(b);
                              setConfirmDeleteOpen(true);
                            }}
                          >
                            Xóa
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={async () => {
                              try {
                                await axios.patch(`${API_URL}/Blog/${b.PostId || b.postId}/activate`, {}, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                const res = await axios.get(`${API_URL}/Blog/admin`, {
                                  headers: { Authorization: `Bearer ${token}` },
                                });
                                const sorted = [...res.data].sort((a, b) => {
                                  const aActive = a.IsActive !== undefined ? a.IsActive : a.isActive;
                                  const bActive = b.IsActive !== undefined ? b.IsActive : b.isActive;
                                  return (bActive === true ? 1 : 0) - (aActive === true ? 1 : 0);
                                });
                                setBlogs(sorted);
                                setFilteredBlogs(sorted);
                                setSnackbarMessage('✅ Đã hoàn tác, kích hoạt lại blog!');
                                setSnackbarOpen(true);
                              } catch (error) {
                                setSnackbarMessage('❌ Lỗi khi hoàn tác blog!');
                                setSnackbarOpen(true);
                              }
                            }}
                          >
                            Hoàn tác
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredBlogs.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số blog/trang"
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Modal tạo */}
      <Dialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm blog</DialogTitle>
        <DialogContent style={{ display: "grid", gap: 12 }}>
          <TextField
            label="Tiêu đề"
            fullWidth
            value={newBlog.Title}
            onChange={(e) => setNewBlog({ ...newBlog, Title: e.target.value })}
          />
          <TextField
            label="Nội dung"
            fullWidth
            multiline
            rows={4}
            value={newBlog.Content}
            onChange={(e) =>
              setNewBlog({ ...newBlog, Content: e.target.value })
            }
          />
          {/* <TextField
            label="URL ảnh"
            fullWidth
            value={newBlog.ImageUrl}
            onChange={e => {
              setNewBlog({ ...newBlog, ImageUrl: e.target.value });
              setNewBlogImagePreview("");
            }}
          /> */}
          <FormControl fullWidth margin="normal">
            <InputLabel shrink>Trạng thái</InputLabel>
            <Select
              label="Trạng thái"
              value={newBlog.Status}
              onChange={(e) => setNewBlog({ ...newBlog, Status: e.target.value })}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="Published">Đã xuất bản</MenuItem>
              <MenuItem value="Draft">Bản nháp</MenuItem>
            </Select>
          </FormControl>
         <Button
            component="label"
            variant="outlined"
            startIcon={<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5.9l3.09 6.26L22 13.27l-5 4.87L18.18 23 12 19.77 5.82 23 7 18.14l-5-4.87 6.91-1.01z" /></svg>}
            sx={{ mt: 1, mb: 2, width: 'fit-content' }}
          >
            Chọn ảnh
            <input
              hidden
              accept="image/jpeg,image/png"
              type="file"
              onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                if (!['image/jpeg', 'image/png'].includes(file.type)) {
                  alert('Chỉ chấp nhận ảnh JPG hoặc PNG!');
                  return;
                }
                if (file.size > 1024 * 1024) {
                  alert('Ảnh phải nhỏ hơn 1MB!');
                  return;
                }
                const reader = new FileReader();
                reader.onload = ev => {
                  setNewBlogImagePreview(ev.target.result);
                  setNewBlog({ ...newBlog, ImageUrl: ev.target.result });
                };
                reader.readAsDataURL(file);
              }}
            />
          </Button>
          {newBlogImagePreview && (
            <img src={newBlogImagePreview} alt="Preview" style={{ maxWidth: 200, marginTop: 8, borderRadius: 4 }} />
          )}

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreate}>
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal sửa */}
      <Dialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cập nhật blog</DialogTitle>
        <DialogContent style={{ display: "grid", gap: 12 }}>
          <TextField
            label="Tiêu đề"
            fullWidth
            value={editBlog?.title || ''}
            onChange={(e) => setEditBlog({ ...editBlog, title: e.target.value })}
          />
          <TextField
            label="Nội dung"
            fullWidth
            multiline
            rows={4}
            value={editBlog?.content || ''}
            onChange={(e) => setEditBlog({ ...editBlog, content: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel shrink>Trạng thái</InputLabel>
            <Select
              label="Trạng thái"
              value={editBlog?.status || 'Draft'}
              onChange={(e) => setEditBlog({ ...editBlog, status: e.target.value })}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="Published">Đã xuất bản</MenuItem>
              <MenuItem value="Draft">Bản nháp</MenuItem>
            </Select>
          </FormControl>
          {/* <TextField
            label="URL ảnh"
            fullWidth
            value={editBlog?.imageUrl || ''}
            onChange={e => {
              setEditBlog({ ...editBlog, imageUrl: e.target.value });
              setEditBlogImagePreview("");
            }}
          /> */}
         <Button
            component="label"
            variant="outlined"
            startIcon={<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5.9l3.09 6.26L22 13.27l-5 4.87L18.18 23 12 19.77 5.82 23 7 18.14l-5-4.87 6.91-1.01z" /></svg>}
            sx={{ mt: 1, mb: 2, width: 'fit-content' }}
          >
            Chọn ảnh
            <input
              hidden
              accept="image/jpeg,image/png"
              type="file"
              onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                if (!['image/jpeg', 'image/png'].includes(file.type)) {
                  alert('Chỉ chấp nhận ảnh JPG hoặc PNG!');
                  return;
                }
                if (file.size > 1024 * 1024) {
                  alert('Ảnh phải nhỏ hơn 1MB!');
                  return;
                }
                const reader = new FileReader();
                reader.onload = ev => {
                  setEditBlogImagePreview(ev.target.result);
                  setEditBlog({ ...editBlog, ImageUrl: ev.target.result });
                };
                reader.readAsDataURL(file);
              }}
            />
          </Button>

          {editBlogImagePreview && (
            <img src={editBlogImagePreview} alt="Preview" style={{ maxWidth: 200, marginTop: 8, borderRadius: 4 }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal chi tiết */}
      <Dialog
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>📝 Chi tiết bài viết</DialogTitle>
        <DialogContent style={{ paddingTop: 12 }}>
          {selectedBlog && (
            <div style={{ display: "grid", rowGap: 12 }}>
              <div>
                <strong>🆔 ID:</strong> {selectedBlog.PostId || selectedBlog.postId}
              </div>
              <div>
                <strong>👤 User ID:</strong> {selectedBlog.UserId || selectedBlog.userId}
              </div>
              <div>
                <strong>📌 Tiêu đề:</strong> {selectedBlog.Title || selectedBlog.title}
              </div>
              <div>
                <strong>📝 Nội dung:</strong> {selectedBlog.Content || selectedBlog.content}
              </div>
              <div>
                <strong>🖼️ Ảnh:</strong> <br />
                <img src={selectedBlog.ImageUrl || selectedBlog.imageUrl} alt="Ảnh blog" style={{ width: "100%", borderRadius: 4, marginTop: 4 }} />
              </div>
              <div>
                <strong>📊 Trạng thái:</strong> {
                  (selectedBlog.Status || selectedBlog.status) === 'Published' ? 'Đã xuất bản' :
                  (selectedBlog.Status || selectedBlog.status) === 'Draft' ? 'Bản nháp' :
                  (selectedBlog.Status || selectedBlog.status) || 'Không xác định'
                }
              </div>
              <div>
                <strong>🔒 Kích hoạt:</strong> {(selectedBlog.IsActive === true || selectedBlog.isActive === true) ? 'Có' : (selectedBlog.IsActive === false || selectedBlog.isActive === false) ? 'Không' : 'Không xác định'}
              </div>
              <div>
                <strong>📅 Ngày đăng:</strong> {formatDateTime(selectedBlog.PublishedDate || selectedBlog.publishedDate)}
              </div>
              <div>
                <strong>🔄 Cập nhật:</strong> {formatDateTime(selectedBlog.UpdatedDate || selectedBlog.updatedDate)}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDetailOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Xác nhận xóa blog</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa blog <strong>{blogToDelete?.Title || blogToDelete?.title}</strong> không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={async () => {
            if (!blogToDelete) return;
            try {
              await axios.patch(`${API_URL}/Blog/${blogToDelete.PostId || blogToDelete.postId}/deactivate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const res = await axios.get(`${API_URL}/Blog/admin`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const sorted = [...res.data].sort((a, b) => {
                const aActive = a.IsActive !== undefined ? a.IsActive : a.isActive;
                const bActive = b.IsActive !== undefined ? b.IsActive : b.isActive;
                return (bActive === true ? 1 : 0) - (aActive === true ? 1 : 0);
              });
              setBlogs(sorted);
              setFilteredBlogs(sorted);
              setSnackbarMessage('🛑 Đã vô hiệu hóa blog!');
              setSnackbarOpen(true);
            } catch (error) {
              setSnackbarMessage('❌ Lỗi khi vô hiệu hóa blog!');
              setSnackbarOpen(true);
            }
            setConfirmDeleteOpen(false);
            setBlogToDelete(null);
          }}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage.includes('vô hiệu hóa') ? 'warning' : 'success'}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default BlogManage;
