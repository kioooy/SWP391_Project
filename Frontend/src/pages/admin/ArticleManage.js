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
} from "@mui/material";

const ArticleManage = () => {
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

  useEffect(() => {
    const fakeData = [
      {
        ArticleId: "1",
        UserId: "101",
        Title: "Giới thiệu về TypeScript",
        Content: "TypeScript là một phần mở rộng của JavaScript.",
        Status: "Published",
        IsActive: true,
        PublishedDate: "2024-01-01",
        UpdatedDate: "2024-02-01",
      },
      {
        ArticleId: "2",
        UserId: "102",
        Title: "React Hooks là gì?",
        Content:
          "Hooks cho phép dùng state và lifecycle trong function component.",
        Status: "Draft",
        IsActive: true,
        PublishedDate: "2024-03-15",
        UpdatedDate: "2024-04-10",
      },
    ];
    setArticles(fakeData);
    setFilteredArticles(fakeData);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = articles.filter((a) =>
      a.Title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredArticles(filtered);
  };

  const handleViewDetail = (id) => {
    const found = articles.find((a) => a.ArticleId === id);
    setSelectedArticle(found);
  };

  const handleDelete = (id) => {
    const updated = articles.filter((a) => a.ArticleId !== id);
    setArticles(updated);
    setFilteredArticles(updated);
    if (selectedArticle?.ArticleId === id) setSelectedArticle(null);
  };

  const handleEdit = (id) => {
    const found = articles.find((a) => a.ArticleId === id);
    setEditArticle({ ...found });
    setIsEditOpen(true);
  };
  const handleUpdate = () => {
    if (!editArticle.Title || !editArticle.Content || !editArticle.Status) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const now = new Date().toISOString().split("T")[0];
    const updated = articles.map((a) =>
      a.ArticleId === editArticle.ArticleId
        ? { ...editArticle, UpdatedDate: now }
        : a
    );
    setArticles(updated);
    setFilteredArticles(updated);
    setIsEditOpen(false);
    setEditArticle(null);
    alert("✅ Cập nhật bài viết thành công!");
  };

  const handleCreate = () => {
    const { Title, Content, Status } = newArticle;
    if (!Title || !Content || !Status) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const newId = (
      Math.max(...articles.map((a) => +a.ArticleId || 0), 0) + 1
    ).toString();
    const now = new Date().toISOString().split("T")[0];

    const item = {
      ArticleId: newId,
      UserId: "999", // mặc định giả lập
      Title,
      Content,
      Status,
      IsActive: true,
      PublishedDate: now,
      UpdatedDate: now,
    };

    const updated = [item, ...articles];
    setArticles(updated);
    setFilteredArticles(updated);
    setIsCreateOpen(false);
    setNewArticle({ Title: "", Content: "", Status: "" });
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h5" style={{ marginBottom: 16 }}>
        Quản lý bài viết
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
                <strong>Nội dung</strong>
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
            {filteredArticles.map((article) => (
              <TableRow key={article.ArticleId}>
                <TableCell>{article.Title}</TableCell>
                <TableCell>{article.Content}</TableCell>
                <TableCell>{article.PublishedDate}</TableCell>
                <TableCell>{article.UpdatedDate}</TableCell>
                <TableCell>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewDetail(article.ArticleId)}
                    >
                      Xem chi tiết
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => handleEdit(article.ArticleId)}
                    >
                      Sửa
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(article.ArticleId)}
                    >
                      Xóa
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredArticles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Không tìm thấy bài viết nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedArticle && (
        <Card
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: "#f0f4f8",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom style={{ marginBottom: 16 }}>
              📝 Chi tiết bài viết
            </Typography>
            <div style={{ display: "grid", rowGap: 12 }}>
              <div style={{ display: "flex" }}>
                <strong style={{ width: 150 }}>🆔 ID:</strong>
                <span>{selectedArticle.ArticleId}</span>
              </div>
              <div style={{ display: "flex" }}>
                <strong style={{ width: 150 }}>👤 User ID:</strong>
                <span>{selectedArticle.UserId}</span>
              </div>
              <div style={{ display: "flex" }}>
                <strong style={{ width: 150 }}>📌 Tiêu đề:</strong>
                <span>{selectedArticle.Title}</span>
              </div>
              <div style={{ display: "flex" }}>
                <strong style={{ width: 150 }}>📝 Nội dung:</strong>
                <span>{selectedArticle.Content}</span>
              </div>
              <div style={{ display: "flex" }}>
                <strong style={{ width: 150 }}>📊 Trạng thái:</strong>
                <span>{selectedArticle.Status}</span>
              </div>
              <div style={{ display: "flex" }}>
                <strong style={{ width: 150 }}>📅 Ngày đăng:</strong>
                <span>{selectedArticle.PublishedDate}</span>
              </div>
              <div style={{ display: "flex" }}>
                <strong style={{ width: 150 }}>🔄 Cập nhật:</strong>
                <span>{selectedArticle.UpdatedDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal tạo bài viết */}
      <Dialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Tạo bài viết mới</DialogTitle>
        <DialogContent dividers>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <TextField
              label="Tiêu đề"
              fullWidth
              value={newArticle.Title}
              onChange={(e) =>
                setNewArticle({ ...newArticle, Title: e.target.value })
              }
            />
            <TextField
              label="Nội dung"
              fullWidth
              multiline
              rows={3}
              value={newArticle.Content}
              onChange={(e) =>
                setNewArticle({ ...newArticle, Content: e.target.value })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={newArticle.Status}
                label="Trạng thái"
                onChange={(e) =>
                  setNewArticle({ ...newArticle, Status: e.target.value })
                }
              >
                <MenuItem value="Published">Published</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreate}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal chỉnh sửa bài viết */}
      <Dialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Cập nhật bài viết</DialogTitle>
        <DialogContent dividers>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <TextField
              label="Tiêu đề"
              fullWidth
              value={editArticle?.Title || ""}
              onChange={(e) =>
                setEditArticle({ ...editArticle, Title: e.target.value })
              }
            />
            <TextField
              label="Nội dung"
              fullWidth
              multiline
              rows={3}
              value={editArticle?.Content || ""}
              onChange={(e) =>
                setEditArticle({ ...editArticle, Content: e.target.value })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={editArticle?.Status || ""}
                label="Trạng thái"
                onChange={(e) =>
                  setEditArticle({ ...editArticle, Status: e.target.value })
                }
              >
                <MenuItem value="Published">Published</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ArticleManage;
