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
    setFilteredArticles(fakeData); // ✅ ban đầu hiển thị tất cả
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

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h5" style={{ marginBottom: 16 }}>
        Quản lý bài viết
      </Typography>

      <TextField
        label="Tìm kiếm theo tiêu đề"
        variant="outlined"
        size="small"
        fullWidth
        value={searchTerm}
        onChange={handleSearch}
        style={{ marginBottom: 16 }}
      />

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

      {selectedArticle && (
        <Card
          style={{
            marginTop: 24,
            backgroundColor: "#f9f9f9",
            border: "1px solid #ccc",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Chi tiết bài viết
            </Typography>
            <Typography>
              <strong>ID:</strong> {selectedArticle.ArticleId}
            </Typography>
            <Typography>
              <strong>Tiêu đề:</strong> {selectedArticle.Title}
            </Typography>
            <Typography>
              <strong>Nội dung:</strong> {selectedArticle.Content}
            </Typography>
            <Typography>
              <strong>Ngày đăng:</strong> {selectedArticle.PublishedDate}
            </Typography>
            <Typography>
              <strong>Ngày cập nhật:</strong> {selectedArticle.UpdatedDate}
            </Typography>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ArticleManage;
