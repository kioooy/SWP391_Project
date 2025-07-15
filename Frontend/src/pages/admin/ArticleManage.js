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
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';

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
    ImageUrl: "",
  });
  const [newArticleImagePreview, setNewArticleImagePreview] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editArticle, setEditArticle] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
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
    const id = articleToDelete?.ArticleId || articleToDelete?.articleId;
    if (!id) {
      setSnackbar({ open: true, message: 'Không xác định được ID bài viết!', severity: 'error' });
      setConfirmDeleteOpen(false);
      setArticleToDelete(null);
      return;
    }
    try {
      await axios.patch(`${API_URL}/Article/${id}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Lấy lại danh sách mới từ backend
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
      if (selectedArticle?.ArticleId === id) setSelectedArticle(null);
      setConfirmDeleteOpen(false);
      setArticleToDelete(null);
      setSnackbar({ open: true, message: '🛑 Đã vô hiệu hóa blog!', severity: 'warning' });
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
      setEditArticleImagePreview(found.ImageUrl || found.imageUrl || "");
      setIsEditOpen(true);
    }
  };

  const handleUpdate = async () => {
    if (!editArticle.Title || !editArticle.Content || !editArticle.Status) {
      setSnackbar({ open: true, message: '⚠️ Vui lòng nhập đầy đủ thông tin!', severity: 'warning' });
      return;
    }

    const formData = new FormData();
    formData.append('Title', editArticle.Title);
    formData.append('Content', editArticle.Content);
    formData.append('Status', editArticle.Status);
    formData.append('ImageUrl', editArticle.ImageUrl || 'no-image');

    try {
      await axios.patch(
        `${API_URL}/Article/${editArticle.ArticleId}`,
        formData,
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
    if (!Title || !Content || !Status || !user?.UserId) {
      setSnackbar({ open: true, message: '⚠️ Vui lòng nhập đầy đủ thông tin và đảm bảo bạn là admin!', severity: 'warning' });
      return;
    }

    const formData = new FormData();
    formData.append('UserId', String(user.UserId)); // Đảm bảo là chuỗi số
    formData.append('Title', Title);
    formData.append('Content', Content);
    formData.append('Status', Status);
    formData.append('ImageUrl', newArticle.ImageUrl || 'no-image');

    try {
      await axios.post(`${API_URL}/Article`, formData, {
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
      setNewArticle({ Title: "", Content: "", Status: "", ImageUrl: "" });
      setNewArticleImagePreview("");
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
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg> Tạo bài viết
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
                <strong>Thao tác</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedArticles.map((article) => {
              const isActive = article.IsActive !== undefined ? article.IsActive : article.isActive;
              return (
                <TableRow
                  key={article.ArticleId || article.articleId}
                  style={
                    isActive === false
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
                    {isActive === true ? (
                      <span style={{ color: '#388e3c', fontWeight: 600 }}>Kích hoạt</span>
                    ) : (
                      <span style={{ color: '#888', fontWeight: 600 }}>Vô hiệu hóa</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDateTime(article.PublishedDate || article.publishedDate)}</TableCell>
                  <TableCell>{formatDateTime(article.UpdatedDate || article.updatedDate)}</TableCell>
                  <TableCell>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEdit(article.ArticleId || article.articleId)}
                        sx={{ mr: 1 }}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="small"
                        color="info"
                        variant="contained"
                        onClick={() => handleViewDetail(article.ArticleId || article.articleId)}
                        sx={{ mr: 1 }}
                      >
                        Xem
                      </Button>
                      {isActive === true ? (
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ backgroundColor: 'error.main', color: '#fff', '&:hover': { backgroundColor: 'error.dark' } }}
                          onClick={() => {
                            setArticleToDelete(article);
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
                              await axios.patch(`${API_URL}/Article/${article.ArticleId || article.articleId}/activate`, {}, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
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
                              setSnackbar({ open: true, message: '✅ Đã hoàn tác, kích hoạt lại bài viết!', severity: 'success' });
                            } catch (error) {
                              setSnackbar({ open: true, message: '❌ Lỗi khi hoàn tác bài viết!', severity: 'error' });
                            }
                          }}
                        >
                          Hoàn tác
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
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
        <Dialog open={openDetailDialog} onClose={() => { setOpenDetailDialog(false); setSelectedArticle(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>📝 Chi tiết bài viết</DialogTitle>
          <DialogContent style={{ paddingTop: 12 }}>
            {selectedArticle && (
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
                  <strong>🖼️ Ảnh:</strong> <br/>
                  { (selectedArticle.ImageUrl || selectedArticle.imageUrl) ? (
                    <img src={selectedArticle.ImageUrl || selectedArticle.imageUrl} alt="Ảnh bài viết" style={{ width: "100%", borderRadius: 4, marginTop: 4 }} />
                  ) : (
                    <span style={{ color: '#888', fontStyle: 'italic' }}>Chưa có ảnh</span>
                  )}
                </div>
                <div>
                  <strong>📊 Trạng thái:</strong> {selectedArticle.Status || selectedArticle.status}
                </div>
                <div>
                  <strong>🔒 Kích hoạt:</strong> {(selectedArticle.IsActive === true || selectedArticle.isActive === true) ? 'Có' : (selectedArticle.IsActive === false || selectedArticle.isActive === false) ? 'Không' : 'Không xác định'}
                </div>
                <div>
                  <strong>📅 Ngày đăng:</strong> {formatDateTime(selectedArticle.PublishedDate || selectedArticle.publishedDate)}
                </div>
                <div>
                  <strong>🔄 Cập nhật:</strong> {formatDateTime(selectedArticle.UpdatedDate || selectedArticle.updatedDate)}
                </div>
              </div>
            )}
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
            <strong>{articleToDelete?.Title || articleToDelete?.title}</strong> không?
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
              <MenuItem value="Draft">Bản nháp</MenuItem>
              <MenuItem value="Published">Đã xuất bản</MenuItem>
            </Select>
          </FormControl>
          {/* Thêm input chọn ảnh */}
         <Button
            component="label"
            variant="outlined"
            startIcon={<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5.9l3.09 6.26L22 13.27l-5 4.87L18.18 23 12 19.77 5.82 23 7 18.14l-5-4.87 6.91-1.01z" /></svg>}
            sx={{ mt: 1, mb: 2 }}
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
                  setNewArticleImagePreview(ev.target.result);
                  setNewArticle({ ...newArticle, ImageUrl: ev.target.result });
                };
                reader.readAsDataURL(file);
              }}
            />
          </Button>
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
          {/* Thêm input chọn ảnh */}
         <Button
            component="label"
            variant="outlined"
            startIcon={<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5.9l3.09 6.26L22 13.27l-5 4.87L18.18 23 12 19.77 5.82 23 7 18.14l-5-4.87 6.91-1.01z" /></svg>}
            sx={{ mt: 1, mb: 2 }}
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
                  setEditArticleImagePreview(ev.target.result);
                  setEditArticle({ ...editArticle, ImageUrl: ev.target.result });
                };
                reader.readAsDataURL(file);
              }}
            />
          </Button>
          {(editArticleImagePreview || editArticle?.ImageUrl) && (
            <img src={editArticleImagePreview || editArticle?.ImageUrl} alt="Preview" style={{ maxWidth: 200, marginTop: 8, borderRadius: 4 }} />
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
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.message.includes('vô hiệu hóa') ? 'warning' : snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ArticleManage;
