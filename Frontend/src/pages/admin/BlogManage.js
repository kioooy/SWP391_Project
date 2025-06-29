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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editBlog, setEditBlog] = useState(null);

  useEffect(() => {
    const fakeData = [
      {
        PostId: "P001",
        Title: "Lợi ích của việc hiến máu",
        Content: "Hiến máu giúp cứu sống nhiều người...",
        PublishedDate: "2024-06-01",
        UpdatedDate: "2024-06-01",
        ImageUrl: "https://via.placeholder.com/100",
        Status: "Published",
      },
      {
        PostId: "P002",
        Title: "Các nhóm máu phổ biến",
        Content: "Các nhóm máu bao gồm A, B, AB, O...",
        PublishedDate: "2024-06-05",
        UpdatedDate: "2024-06-06",
        ImageUrl: "https://via.placeholder.com/100",
        Status: "Draft",
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
    const { Title, Content, ImageUrl, Status } = newBlog;
    if (!Title || !Content || !ImageUrl) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const now = new Date().toISOString().split("T")[0];
    const newPost = {
      PostId: "P" + (blogs.length + 1).toString().padStart(3, "0"),
      Title,
      Content,
      PublishedDate: now,
      UpdatedDate: now,
      ImageUrl,
      Status: Status || "Draft",
    };

    const updated = [newPost, ...blogs];
    setBlogs(updated);
    setFilteredBlogs(updated);
    setIsCreateOpen(false);
    setNewBlog({ Title: "", Content: "", ImageUrl: "", Status: "Draft" });
    alert("✅ Đã thêm bài viết!");
  };

  const handleEdit = (blog) => {
    setEditBlog({ ...blog });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editBlog.Title || !editBlog.Content || !editBlog.ImageUrl) {
      alert("Vui lòng nhập đủ thông tin");
      return;
    }

    const now = new Date().toISOString().split("T")[0];
    const updated = blogs.map((b) =>
      b.PostId === editBlog.PostId ? { ...editBlog, UpdatedDate: now } : b
    );
    setBlogs(updated);
    setFilteredBlogs(updated);
    setIsEditOpen(false);
    alert("✅ Cập nhật thành công!");
  };

  const handleChangeStatus = (postId, newStatus) => {
    const updated = blogs.map((b) =>
      b.PostId === postId ? { ...b, Status: newStatus } : b
    );
    setBlogs(updated);
    setFilteredBlogs(updated);
    alert("✅ Đã cập nhật trạng thái!");
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h5" gutterBottom>
        📚 Quản lý Blog
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
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsCreateOpen(true)}
        >
          ➕ Thêm bài viết
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead style={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>Tiêu đề</strong>
              </TableCell>
              <TableCell>
                <strong>Nội dung</strong>
              </TableCell>
              <TableCell>
                <strong>Ngày đăng</strong>
              </TableCell>
              <TableCell>
                <strong>Ngày cập nhật</strong>
              </TableCell>
              <TableCell>
                <strong>Ảnh</strong>
              </TableCell>
              <TableCell>
                <strong>Trạng thái</strong>
              </TableCell>
              <TableCell>
                <strong>Hành động</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBlogs.map((b) => (
              <TableRow key={b.PostId}>
                <TableCell>{b.PostId}</TableCell>
                <TableCell>{b.Title}</TableCell>
                <TableCell>{b.Content}</TableCell>
                <TableCell>{b.PublishedDate}</TableCell>
                <TableCell>{b.UpdatedDate}</TableCell>
                <TableCell>
                  <img src={b.ImageUrl} alt="thumb" width={60} />
                </TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={b.Status}
                    onChange={(e) =>
                      handleChangeStatus(b.PostId, e.target.value)
                    }
                  >
                    <MenuItem value="Published">Published</MenuItem>
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Archived">Archived</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleEdit(b)}
                  >
                    ✏️ Sửa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredBlogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Không tìm thấy bài viết nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Tạo */}
      <Dialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>➕ Thêm bài viết</DialogTitle>
        <DialogContent style={{ display: "grid", gap: 12, marginTop: 8 }}>
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
            label="Ảnh (URL)"
            fullWidth
            value={newBlog.ImageUrl}
            onChange={(e) =>
              setNewBlog({ ...newBlog, ImageUrl: e.target.value })
            }
          />
          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={newBlog.Status}
              onChange={(e) =>
                setNewBlog({ ...newBlog, Status: e.target.value })
              }
              label="Trạng thái"
            >
              <MenuItem value="Published">Published</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreate}>
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Sửa */}
      <Dialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>✏️ Cập nhật bài viết</DialogTitle>
        <DialogContent style={{ display: "grid", gap: 12, marginTop: 8 }}>
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
            label="Ảnh (URL)"
            fullWidth
            value={editBlog?.ImageUrl || ""}
            onChange={(e) =>
              setEditBlog({ ...editBlog, ImageUrl: e.target.value })
            }
          />
          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={editBlog?.Status || ""}
              onChange={(e) =>
                setEditBlog({ ...editBlog, Status: e.target.value })
              }
              label="Trạng thái"
            >
              <MenuItem value="Published">Published</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BlogManage;
