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
} from "@mui/material";

const BlogManage = () => {
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

  useEffect(() => {
    const fakeData = [
      {
        PostId: "1",
        Title: "Giới thiệu hệ thống hiến máu",
        Content: "Đây là nội dung bài viết đầu tiên.",
        PublishedDate: "2024-01-01",
        UpdatedDate: "2024-01-02",
        ImageUrl: "https://via.placeholder.com/400x200",
        Status: "Published",
        IsActive: true,
      },
      {
        PostId: "2",
        Title: "Hướng dẫn đăng ký hiến máu",
        Content: "Chi tiết quy trình đăng ký và quy định.",
        PublishedDate: "2024-02-01",
        UpdatedDate: "2024-02-10",
        ImageUrl: "https://via.placeholder.com/400x200",
        Status: "Draft",
        IsActive: true,
      },
    ];
    setBlogs(fakeData);
    setFilteredBlogs(fakeData);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = blogs.filter((b) =>
      b.Title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredBlogs(filtered);
  };

  const handleCreate = () => {
    const { Title, Content, ImageUrl, Status, IsActive } = newBlog;
    if (!Title || !Content || !ImageUrl) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    const now = new Date().toISOString().split("T")[0];
    const newPost = {
      PostId: (blogs.length + 1).toString(),
      Title,
      Content,
      ImageUrl,
      Status,
      IsActive,
      PublishedDate: now,
      UpdatedDate: now,
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
  };

  const handleEdit = (b) => {
    setEditBlog({ ...b });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    const updated = blogs.map((b) =>
      b.PostId === editBlog.PostId
        ? { ...editBlog, UpdatedDate: new Date().toISOString().split("T")[0] }
        : b
    );
    setBlogs(updated);
    setFilteredBlogs(updated);
    setIsEditOpen(false);
    setEditBlog(null);
  };

  const handleToggleStatus = (id) => {
    const updated = blogs.map((b) =>
      b.PostId === id
        ? { ...b, Status: b.Status === "Published" ? "Draft" : "Published" }
        : b
    );
    setBlogs(updated);
    setFilteredBlogs(updated);
  };

  const handleToggleActive = (id) => {
    const updated = blogs.map((b) =>
      b.PostId === id ? { ...b, IsActive: !b.IsActive } : b
    );
    setBlogs(updated);
    setFilteredBlogs(updated);
  };

  const handleViewDetail = (b) => {
    setSelectedBlog(b);
    setIsDetailOpen(true);
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
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Kích hoạt</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBlogs.map((b) => (
              <TableRow key={b.PostId}>
                <TableCell>{b.Title}</TableCell>
                <TableCell>{b.Status}</TableCell>
                <TableCell>{b.IsActive ? "Có" : "Không"}</TableCell>
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
    </div>
  );
};

export default BlogManage;
