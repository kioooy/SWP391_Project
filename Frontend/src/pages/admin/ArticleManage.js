import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  Typography,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const ArticleManage = () => {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5250/api";
  const token = localStorage.getItem("token");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({
    Title: "",
    Content: "",
    Status: "",
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editArticle, setEditArticle] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newArticleImagePreview, setNewArticleImagePreview] = useState("");
  const [editArticleImagePreview, setEditArticleImagePreview] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get(`${API_URL}/Article/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = res.data;
        // Sắp xếp: active trước, inactive sau
        const sorted = [...data].sort((a, b) => {
          const aActive = a.IsActive !== undefined ? a.IsActive : a.isActive;
          const bActive = b.IsActive !== undefined ? b.IsActive : b.isActive;
          return (bActive === true ? 1 : 0) - (aActive === true ? 1 : 0);
        });
        setArticles(sorted);
        setFilteredArticles(sorted);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bài viết:", error);
      }
    };

    fetchArticles();
  }, []);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedArticles = filteredArticles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = articles.filter((a) =>
      (a.Title || a.title || '').toLowerCase().includes(value.toLowerCase())
    );
    // Sắp xếp lại: active trước, inactive sau
    const sorted = [...filtered].sort((a, b) => {
      const aActive = a.IsActive !== undefined ? a.IsActive : a.isActive;
      const bActive = b.IsActive !== undefined ? b.IsActive : b.isActive;
      return (bActive === true ? 1 : 0) - (aActive === true ? 1 : 0);
    });
    setFilteredArticles(sorted);
  };

  const handleViewDetail = (id) => {
    const found = articles.find((a) => a.ArticleId === id || a.articleId === id);
    setSelectedArticle(found);
    setOpenDetailDialog(true);
  };

  const handleDelete = async () => {
    const id = articleToDelete.ArticleId;
    try {
      await axios.patch(`${API_URL}/Article/${id}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Lấy lại danh sách mới từ backend
      const res = await axios.get(`${API_URL}/Article/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles(res.data);
      setFilteredArticles(res.data);
      if (selectedArticle?.ArticleId === id) setSelectedArticle(null);
      setConfirmDeleteOpen(false);
      setArticleToDelete(null);
      setSnackbar({ open: true, message: '🗑️ Đã xóa bài viết thành công!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: '❌ Lỗi khi xóa bài viết!', severity: 'error' });
    }
  };

  const handleEdit = (id) => {
    const found = articles.find((a) => a.ArticleId === id || a.articleId === id);
    if (found) {
      let statusRaw = found.Status || found.status;
      let status = statusRaw === 'Published' ? 'Published' : statusRaw === 'Draft' ? 'Draft' : 'Draft';
      setEditArticle({
        ArticleId: found.ArticleId || found.articleId,
        Title: found.Title || found.title || '',
        Content: found.Content || found.content || '',
        Status: status,
        IsActive: found.IsActive !== undefined ? found.IsActive : found.isActive,
        PublishedDate: found.PublishedDate || found.publishedDate,
        UpdatedDate: found.UpdatedDate || found.updatedDate,
        UserId: found.UserId || found.userId,
        ImageUrl: found.ImageUrl || found.imageUrl,
      });
      setIsEditOpen(true);
    }
  };

  const handleUpdate = async () => {
    if (!editArticle.Title || !editArticle.Content || !editArticle.Status) {
      setSnackbar({ open: true, message: '⚠️ Vui lòng nhập đầy đủ thông tin!', severity: 'warning' });
      return;
    }

    const payload = {
      Title: editArticle.Title,
      Content: editArticle.Content,
      Status: editArticle.Status,
    };

    try {
      await axios.put(
        `${API_URL}/Article/${editArticle.ArticleId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Lấy lại danh sách mới từ backend
      const res = await axios.get(`${API_URL}/Article/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles(res.data);
      setFilteredArticles(res.data);
      setIsEditOpen(false);
      setEditArticle(null);
      setSnackbar({ open: true, message: '✅ Cập nhật bài viết thành công!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: '❌ Lỗi khi cập nhật bài viết! ' + (error.response?.data || ''), severity: 'error' });
    }
  };

  const handleCreate = async () => {
    const { Title, Content, Status } = newArticle;
    if (!Title || !Content || !Status) {
      setSnackbar({ open: true, message: '⚠️ Vui lòng nhập đầy đủ thông tin!', severity: 'warning' });
      return;
    }

    const item = {
      UserId: user?.UserId,
      Title,
      Content,
      Status,
    };

    try {
      await axios.post(`${API_URL}/Article`, item, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Sau khi tạo xong, lấy lại danh sách từ backend
      const res = await axios.get(`${API_URL}/Article/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles(res.data);
      setFilteredArticles(res.data);
      setIsCreateOpen(false);
      setSnackbar({ open: true, message: '✅ Tạo bài viết thành công!', severity: 'success' });
      setNewArticle({ Title: "", Content: "", Status: "" });
    } catch (error) {
      setSnackbar({ open: true, message: '❌ Lỗi khi tạo bài viết! ' + (error.response?.data || ''), severity: 'error' });
    }
  };

  const handleToggleStatus = async (id) => {
    const article = articles.find(a => a.ArticleId === id || a.articleId === id);
    if (!article) return;
    const currentStatus = article.Status || article.status;
    const newStatus = currentStatus === "Published" ? "Draft" : "Published";
    try {
      await axios.patch(
        `${API_URL}/Article/${id}/status`,
        { Status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Reload lại danh sách từ backend
      const res = await axios.get(`${API_URL}/Article/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sắp xếp lại: active trước, inactive sau
      const sorted = [...res.data].sort((a, b) => {
        const aActive = a.IsActive !== undefined ? a.IsActive : a.isActive;
        const bActive = b.IsActive !== undefined ? b.IsActive : b.isActive;
        return (bActive === true ? 1 : 0) - (aActive === true ? 1 : 0);
      });
      setArticles(sorted);
      setFilteredArticles(sorted);
      setSnackbar({ open: true, message: `✅ Cập nhật trạng thái bài viết thành công!`, severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: '❌ Lỗi khi cập nhật trạng thái bài viết!', severity: 'error' });
    }
  };

  const handleChangeActive = async (id, value) => {
    try {
      if (value === "inactive") {
        await axios.patch(
          `${API_URL}/Article/${id}/deactivate`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.patch(
          `${API_URL}/Article/${id}/activate`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // Reload lại danh sách
      const res = await axios.get(`${API_URL}/Article/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sắp xếp lại: active trước, inactive sau
      const sorted = [...res.data].sort((a, b) => {
        const aActive = a.IsActive !== undefined ? a.IsActive : a.isActive;
        const bActive = b.IsActive !== undefined ? b.IsActive : b.isActive;
        return (bActive === true ? 1 : 0) - (aActive === true ? 1 : 0);
      });
      setArticles(sorted);
      setFilteredArticles(sorted);
      setPage(0);
      setSnackbar({ 
        open: true, 
        message: value === 'inactive' ? '🛑 Đã vô hiệu hóa bài viết!' : '✅ Đã kích hoạt bài viết!', 
        severity: value === 'inactive' ? 'warning' : 'success' 
      });
    } catch (error) {
      setSnackbar({ open: true, message: '❌ Lỗi khi cập nhật trạng thái kích hoạt!', severity: 'error' });
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#E53935', mb: 4 }}>
        Quản Lý Tài Liệu
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
          ➕ Tạo bài viết
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead style={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>
                <strong>Tiêu đề</strong>
              </TableCell>
              <TableCell>
                <strong>Trạng thái</strong>
              </TableCell>
              <TableCell>
                <strong>Kích hoạt</strong>
              </TableCell>
              <TableCell>
                <strong>Ngày đăng</strong>
              </TableCell>
              <TableCell>
                <strong>Ngày cập nhật</strong>
              </TableCell>
              <TableCell>
                <strong>Hành động</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedArticles.map((article) => (
              <TableRow
                key={article.ArticleId || article.articleId}
                style={
                  article.isActive === false || article.IsActive === false
                    ? { backgroundColor: '#f5f5f5', color: '#aaa' }
                    : {}
                }
              >
                <TableCell>{article.Title || article.title}</TableCell>
                <TableCell>
                  {(article.Status || article.status)
                    ? ((article.Status || article.status) === 'Published' ? 'Đã xuất bản'
                      : (article.Status || article.status) === 'Draft' ? 'Bản nháp'
                      : (article.Status || article.status))
                    : 'Không xác định'}
                </TableCell>
                <TableCell>
                  <Select
                    value={(article.IsActive !== undefined ? article.IsActive : article.isActive) ? 'active' : 'inactive'}
                    onChange={e => handleChangeActive(article.ArticleId || article.articleId, e.target.value)}
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="active">Kích hoạt</MenuItem>
                    <MenuItem value="inactive">Vô hiệu hóa</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>{formatDateTime(article.PublishedDate || article.publishedDate)}</TableCell>
                <TableCell>{formatDateTime(article.UpdatedDate || article.updatedDate)}</TableCell>
                <TableCell>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewDetail(article.ArticleId || article.articleId)}
                    >
                      Xem
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => handleEdit(article.ArticleId || article.articleId)}
                    >
                      Sửa
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredArticles.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Không tìm thấy bài viết nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredArticles.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {selectedArticle && (
        <Dialog open={openDetailDialog} onClose={() => { setOpenDetailDialog(false); setSelectedArticle(null); }} maxWidth="md" fullWidth>
          <DialogTitle>📝 Chi tiết bài viết</DialogTitle>
          <DialogContent>
            <div style={{ display: "grid", rowGap: 12 }}>
              <div>
                <strong>🆔 ID:</strong> {selectedArticle.ArticleId || selectedArticle.articleId}
              </div>
              <div>
                <strong>👤 User ID:</strong> {selectedArticle.UserId || selectedArticle.userId}
              </div>
              <div>
                <strong>📌 Tiêu đề:</strong> {selectedArticle.Title || selectedArticle.title}
              </div>
              <div>
                <strong>📝 Nội dung:</strong> {selectedArticle.Content || selectedArticle.content}
              </div>
              <div>
                <strong>📊 Trạng thái:</strong> 
                {(selectedArticle.Status || selectedArticle.status) === 'Published'
                  ? 'Đã xuất bản'
                  : (selectedArticle.Status || selectedArticle.status) === 'Draft'
                    ? 'Bản nháp'
                    : (selectedArticle.Status || selectedArticle.status) || 'Không xác định'}
              </div>
              <div>
                <strong>🔒 Kích hoạt:</strong> 
                {(selectedArticle.IsActive === true || selectedArticle.isActive === true)
                  ? 'Có'
                  : (selectedArticle.IsActive === false || selectedArticle.isActive === false)
                    ? 'Không'
                    : 'Không xác định'}
              </div>
              <div>
                <strong>📅 Ngày đăng:</strong> {formatDateTime(selectedArticle.PublishedDate || selectedArticle.publishedDate)}
              </div>
              <div>
                <strong>🔄 Cập nhật:</strong> {formatDateTime(selectedArticle.UpdatedDate || selectedArticle.updatedDate)}
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetailDialog(false)}>Đóng</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Xác nhận xóa */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Xác nhận xóa bài viết</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa bài viết{" "}
            <strong>{articleToDelete?.Title}</strong> không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal tạo */}
      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <DialogTitle>Tạo bài viết mới</DialogTitle>
        <DialogContent>
          <TextField
            label="Tiêu đề"
            fullWidth
            margin="normal"
            value={newArticle.Title}
            onChange={(e) =>
              setNewArticle({ ...newArticle, Title: e.target.value })
            }
          />
          <TextField
            label="Nội dung"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={newArticle.Content}
            onChange={(e) =>
              setNewArticle({ ...newArticle, Content: e.target.value })
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={newArticle.Status}
              onChange={(e) =>
                setNewArticle({ ...newArticle, Status: e.target.value })
              }
              label="Trạng thái"
            >
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Published">Published</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="URL ảnh"
            fullWidth
            value={newArticle.ImageUrl || ''}
            onChange={e => {
              setNewArticle({ ...newArticle, ImageUrl: e.target.value });
              setNewArticleImagePreview("");
            }}
          />
          <input
            accept="image/jpeg,image/png"
            type="file"
            style={{ marginTop: 8 }}
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
                setNewArticleImagePreview(ev.target.result);
                setNewArticle({ ...newArticle, ImageUrl: ev.target.result });
              };
              reader.readAsDataURL(file);
            }}
          />
          {newArticleImagePreview && (
            <img src={newArticleImagePreview} alt="Preview" style={{ maxWidth: 200, marginTop: 8, borderRadius: 4 }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreate}>
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal chỉnh sửa */}
      <Dialog open={isEditOpen} onClose={() => { setIsEditOpen(false); setEditArticle(null); }}>
        <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
        <DialogContent>
          <TextField
            label="Tiêu đề"
            fullWidth
            margin="normal"
            value={editArticle?.Title || ""}
            onChange={(e) =>
              setEditArticle({ ...editArticle, Title: e.target.value })
            }
          />
          <TextField
            label="Nội dung"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={editArticle?.Content || ""}
            onChange={(e) =>
              setEditArticle({ ...editArticle, Content: e.target.value })
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={editArticle?.Status || 'Draft'}
              onChange={(e) => setEditArticle({ ...editArticle, Status: e.target.value })}
              label="Trạng thái"
            >
              <MenuItem value="Draft">Bản nháp</MenuItem>
              <MenuItem value="Published">Đã xuất bản</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="URL ảnh"
            fullWidth
            value={editArticle?.ImageUrl || ''}
            onChange={e => {
              setEditArticle({ ...editArticle, ImageUrl: e.target.value });
              setEditArticleImagePreview("");
            }}
          />
          <input
            accept="image/jpeg,image/png"
            type="file"
            style={{ marginTop: 8 }}
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
                setEditArticleImagePreview(ev.target.result);
                setEditArticle({ ...editArticle, ImageUrl: ev.target.result });
              };
              reader.readAsDataURL(file);
            }}
          />
          {editArticleImagePreview && (
            <img src={editArticleImagePreview} alt="Preview" style={{ maxWidth: 200, marginTop: 8, borderRadius: 4 }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ArticleManage;
