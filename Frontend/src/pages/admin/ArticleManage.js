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
    PublishedDate: "",
  });

  useEffect(() => {
    const fakeData = [
      {
        ArticleId: "1",
        Title: "Giới thiệu về TypeScript",
        Content: "TypeScript là một phần mở rộng của JavaScript.",
        PublishedDate: "2024-01-01",
        UpdatedDate: "2024-02-01",
      },
      {
        ArticleId: "2",
        Title: "React Hooks là gì?",
        Content:
          "Hooks cho phép dùng state và lifecycle trong function component.",
        PublishedDate: "2024-03-15",
        UpdatedDate: "2024-04-10",
      },
    ];
    setArticles(fakeData);
    setFilteredArticles(fakeData);
  }, []);

  const handleEdit = (id) => {
    alert(`Chỉnh sửa bài viết ID: ${id}`);
  };

  const handleDelete = (id) => {
    const newArticles = articles.filter((a) => a.ArticleId !== id);
    setArticles(newArticles);
    setFilteredArticles(newArticles);
    if (selectedArticle?.ArticleId === id) setSelectedArticle(null);
  };

  const handleViewDetail = (id) => {
    const article = articles.find((a) => a.ArticleId === id);
    setSelectedArticle(article);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = articles.filter((a) =>
      a.Title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredArticles(filtered);
  };

  const handleCreate = () => {
    if (!newArticle.Title || !newArticle.Content || !newArticle.PublishedDate) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const newId = (
      Math.max(...articles.map((a) => +a.ArticleId), 0) + 1
    ).toString();
    const item = {
      ...newArticle,
      ArticleId: newId,
      UpdatedDate: newArticle.PublishedDate,
    };

    const updated = [item, ...articles];
    setArticles(updated);
    setFilteredArticles(updated);
    setIsCreateOpen(false);
    setNewArticle({ Title: "", Content: "", PublishedDate: "" });
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
          style={{ flexGrow: 1, marginRight: 8 }}
        />
        <Button
          variant="contained"
          color="success"
          onClick={() => setIsCreateOpen(true)}
        >
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
                <strong>Cập nhật</strong>
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
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewDetail(article.ArticleId)}
                    >
                      Xem
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleEdit(article.ArticleId)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
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
            <Typography variant="h6" gutterBottom>
              📝 Chi tiết bài viết
            </Typography>
            <div style={{ display: "grid", rowGap: 12 }}>
              <div style={{ display: "flex" }}>
                <strong style={{ width: 150 }}>🆔 ID:</strong>
                <span>{selectedArticle.ArticleId}</span>
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
                <strong style={{ width: 150 }}>📅 Ngày đăng:</strong>
                <span>{selectedArticle.PublishedDate}</span>
              </div>
              <div style={{ display: "flex" }}>
                <strong style={{ width: 150 }}>🔄 Ngày cập nhật:</strong>
                <span>{selectedArticle.UpdatedDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal tạo mới */}
      <Dialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Tạo bài viết mới</DialogTitle>
        <DialogContent dividers>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
            <TextField
              label="Ngày đăng"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newArticle.PublishedDate}
              onChange={(e) =>
                setNewArticle({ ...newArticle, PublishedDate: e.target.value })
              }
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateOpen(false)}>Hủy</Button>
          <Button variant="contained" color="success" onClick={handleCreate}>
            Tạo
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ArticleManage;
