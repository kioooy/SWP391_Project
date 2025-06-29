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
} from "@mui/material";

const ArticleManage = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newArticle, setNewArticle] = useState({
    Title: "",
    Content: "",
    PublishedDate: "",
  });

  useEffect(() => {
    // TODO: Gọi API lấy danh sách bài viết tại đây (GET /api/articles)
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
      {
        ArticleId: "3",
        Title: "State và Props trong React",
        Content: "Giải thích sự khác nhau giữa state và props.",
        PublishedDate: "2024-05-01",
        UpdatedDate: "2024-05-02",
      },
    ];
    setArticles(fakeData);
    setFilteredArticles(fakeData);
  }, []);

  const handleEdit = (id) => {
    // TODO: Mở modal hoặc chuyển trang sửa bài viết
    alert(`Chỉnh sửa bài viết ID: ${id}`);
  };

  const handleDelete = (id) => {
    // TODO: Gọi API xóa bài viết (DELETE /api/articles/:id)
    const newArticles = articles.filter((a) => a.ArticleId !== id);
    setArticles(newArticles);
    const newFiltered = filteredArticles.filter((a) => a.ArticleId !== id);
    setFilteredArticles(newFiltered);
    if (selectedArticle?.ArticleId === id) {
      setSelectedArticle(null);
    }
  };

  const handleViewDetail = (id) => {
    // TODO: Gọi API lấy chi tiết bài viết tại đây (GET /api/articles/:id)
    const article = articles.find((a) => a.ArticleId === id);
    setSelectedArticle(article);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = articles.filter((article) =>
      article.Title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredArticles(filtered);
  };

  const handleCreate = () => {
    if (!newArticle.Title || !newArticle.Content || !newArticle.PublishedDate) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const newId = (
      Math.max(...articles.map((a) => +a.ArticleId), 0) + 1
    ).toString();
    const newItem = {
      ...newArticle,
      ArticleId: newId,
      UpdatedDate: newArticle.PublishedDate,
    };

    const updatedList = [newItem, ...articles];
    setArticles(updatedList);
    setFilteredArticles(updatedList);
    setNewArticle({ Title: "", Content: "", PublishedDate: "" });

    // TODO: Gọi API POST /api/articles tại đây nếu có
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h5" style={{ marginBottom: 16 }}>
        Quản lý bài viết
      </Typography>

      {/* Form tạo mới bài viết */}
      <Card
        style={{
          marginBottom: 24,
          padding: 16,
          backgroundColor: "#ffffff",
          borderRadius: 12,
          boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h6" gutterBottom>
          ➕ Tạo bài viết mới
        </Typography>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextField
            label="Tiêu đề"
            fullWidth
            size="small"
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
            size="small"
            value={newArticle.Content}
            onChange={(e) =>
              setNewArticle({ ...newArticle, Content: e.target.value })
            }
          />
          <TextField
            label="Ngày đăng"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={newArticle.PublishedDate}
            onChange={(e) =>
              setNewArticle({
                ...newArticle,
                PublishedDate: e.target.value,
              })
            }
          />
          <Button variant="contained" color="success" onClick={handleCreate}>
            Tạo bài viết
          </Button>
        </div>
      </Card>

      {/* Thanh tìm kiếm */}
      <TextField
        label="Tìm kiếm theo tiêu đề"
        variant="outlined"
        size="small"
        fullWidth
        value={searchTerm}
        onChange={handleSearch}
        style={{ marginBottom: 16 }}
      />

      {/* Bảng danh sách bài viết */}
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
                      Xem chi tiết
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

      {/* Chi tiết bài viết */}
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
    </div>
  );
};

export default ArticleManage;
