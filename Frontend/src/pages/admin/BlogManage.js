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
} from "@mui/material";
import axios from "axios";

const BlogManage = () => {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5250/api";
  const token = localStorage.getItem("token");
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

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${API_URL}/Blog/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data.map((blog) => ({
          ...blog,
          Status: "Published",
          IsActive: true,
        }));

        setBlogs(data);
        setFilteredBlogs(data);
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
      b.Title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredBlogs(filtered);
  };

  const handleCreate = async () => {
    const { Title, Content, ImageUrl, Status, IsActive } = newBlog;

    if (!Title || !Content || !ImageUrl) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/blogs`,
        {
          // userId: currentUserId,
          title: Title,
          content: Content,
          imageUrl: ImageUrl,
          status: Status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const created = res.data;

      const newPost = {
        PostId: created.postId,
        Title: created.title,
        Content: created.content,
        ImageUrl: created.imageUrl,
        Status: created.status,
        IsActive: true,
        PublishedDate: created.publishedDate,
        UpdatedDate: created.updatedDate ?? created.publishedDate,
      };

      const updated = [newPost, ...blogs];
      setBlogs(updated);
      setFilteredBlogs(updated);
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
    setEditBlog({ ...b });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    const { PostId, Title, Content, ImageUrl, Status } = editBlog;

    if (!Title || !Content || !ImageUrl) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/blogs/${PostId}`,
        {
          title: Title,
          content: Content,
          imageUrl: ImageUrl,
          status: Status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = blogs.map((b) =>
        b.PostId === PostId
          ? {
              ...b,
              Title,
              Content,
              ImageUrl,
              Status,
              UpdatedDate: new Date().toISOString().split("T")[0],
            }
          : b
      );

      setBlogs(updated);
      setFilteredBlogs(updated);
      setIsEditOpen(false);
      setEditBlog(null);
      setSnackbarMessage("Bài viết đã được cập nhật thành công!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Lỗi khi cập nhật blog:", error);
      alert("Cập nhật blog thất bại.");
    }
  };

  const handleToggleStatus = async (id) => {
    const targetBlog = blogs.find((b) => b.PostId === id);
    if (!targetBlog) return;

    const newStatus = targetBlog.Status === "Published" ? "Draft" : "Published";

    try {
      await axios.patch(
        `${API_URL}/blogs/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = blogs.map((b) =>
        b.PostId === id
          ? {
              ...b,
              Status: newStatus,
              UpdatedDate: new Date().toISOString().split("T")[0],
            }
          : b
      );

      setBlogs(updated);
      setFilteredBlogs(updated);
    } catch (error) {
      console.error("Lỗi khi đổi trạng thái blog:", error);
      alert("Đổi trạng thái thất bại.");
    }
  };

  const handleToggleActive = async (id) => {
    const blog = blogs.find((b) => b.PostId === id);
    if (!blog || !blog.IsActive) return;

    try {
      await axios.patch(
        `${API_URL}/blogs/${id}/deactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = blogs.map((b) =>
        b.PostId === id
          ? {
              ...b,
              IsActive: false,
              UpdatedDate: new Date().toISOString().split("T")[0],
            }
          : b
      );

      setBlogs(updated);
      setFilteredBlogs(updated);
    } catch (error) {
      console.error("Lỗi khi deactivate blog:", error);
      alert("Không thể vô hiệu hóa bài viết.");
    }
  };

  const handleViewDetail = (b) => {
    setSelectedBlog(b);
    setIsDetailOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h5" gutterBottom>
        📝 Quản lý blog
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
          ➕ Thêm blog
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Kích hoạt</TableCell>
              <TableCell>Ngày đăng</TableCell>
              <TableCell>Ngày cập nhật</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBlogs
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((b) => (
                <TableRow key={b.PostId}>
                  <TableCell>
                    <img
                      src={b.ImageUrl}
                      alt={b.Title}
                      style={{
                        width: 80,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  </TableCell>
                  <TableCell>{b.Title}</TableCell>
                  <TableCell>{b.Status}</TableCell>
                  <TableCell>{b.IsActive ? "Có" : "Không"}</TableCell>
                  <TableCell>{b.PublishedDate}</TableCell>
                  <TableCell>{b.UpdatedDate}</TableCell>
                  <TableCell>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleViewDetail(b)}
                    >
                      👁 Xem
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEdit(b)}
                      style={{ margin: "0 4px" }}
                    >
                      ✏️ Sửa
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleToggleStatus(b.PostId)}
                    >
                      Đổi trạng thái
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleToggleActive(b.PostId)}
                      color="error"
                      style={{ marginLeft: 4 }}
                    >
                      {b.IsActive ? "Vô hiệu hóa" : "Kích hoạt"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
          <TextField
            label="URL ảnh"
            fullWidth
            value={newBlog.ImageUrl}
            onChange={(e) =>
              setNewBlog({ ...newBlog, ImageUrl: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreate}>
            Lưu
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
            value={editBlog?.Title || ""}
            onChange={(e) =>
              setEditBlog({ ...editBlog, Title: e.target.value })
            }
          />
          <TextField
            label="Nội dung"
            fullWidth
            multiline
            rows={4}
            value={editBlog?.Content || ""}
            onChange={(e) =>
              setEditBlog({ ...editBlog, Content: e.target.value })
            }
          />
          <TextField
            label="URL ảnh"
            fullWidth
            value={editBlog?.ImageUrl || ""}
            onChange={(e) =>
              setEditBlog({ ...editBlog, ImageUrl: e.target.value })
            }
          />
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
        <DialogTitle>👁 Chi tiết bài viết</DialogTitle>
        <DialogContent style={{ paddingTop: 12 }}>
          {selectedBlog && (
            <div style={{ display: "grid", gap: 12 }}>
              <Typography variant="h6">{selectedBlog.Title}</Typography>
              <img
                src={selectedBlog.ImageUrl}
                alt="Ảnh blog"
                style={{ width: "100%", borderRadius: 4 }}
              />
              <Typography variant="body1" style={{ whiteSpace: "pre-line" }}>
                {selectedBlog.Content}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                📅 Xuất bản: {selectedBlog.PublishedDate}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                📝 Cập nhật: {selectedBlog.UpdatedDate}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ⚙️ Trạng thái: {selectedBlog.Status}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ✅ Kích hoạt: {selectedBlog.IsActive ? "Có" : "Không"}
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDetailOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default BlogManage;
