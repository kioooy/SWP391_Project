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
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

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

  const handleDelete = () => {
    const id = articleToDelete.ArticleId;
    const updated = articles.filter((a) => a.ArticleId !== id);
    setArticles(updated);
    setFilteredArticles(updated);
    if (selectedArticle?.ArticleId === id) setSelectedArticle(null);
    setConfirmDeleteOpen(false);
    setArticleToDelete(null);
    alert("🗑️ Đã xóa bài viết thành công!");
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
      UserId: "999",
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
    alert("✅ Tạo bài viết thành công!");
    setNewArticle({ Title: "", Content: "", Status: "" });
  };

  const handleToggleStatus = (id) => {
    const updated = articles.map((a) => {
      if (a.ArticleId === id) {
        const newStatus = a.Status === "Published" ? "Draft" : "Published";
        return {
          ...a,
          Status: newStatus,
          UpdatedDate: new Date().toISOString().split("T")[0],
        };
      }
      return a;
    });
    setArticles(updated);
    setFilteredArticles(updated);
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
                      Xem
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
                      color="secondary"
                      onClick={() => handleToggleStatus(article.ArticleId)}
                    >
                      {article.Status === "Published"
                        ? "Chuyển thành Draft"
                        : "Xuất bản"}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setArticleToDelete(article);
                        setConfirmDeleteOpen(true);
                      }}
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

      {/* Confirm Delete Modal */}
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

      {/* Modal tạo và cập nhật giữ nguyên - không cần sửa lại */}
      {/* ... phần Modal tạo và cập nhật của bạn giữ nguyên như bạn đã viết ở trên ... */}
    </div>
  );
};

export default ArticleManage;
