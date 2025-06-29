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
} from "@mui/material";

const ArticleManage = () => {
  const [articles, setArticles] = useState([]);

  // ✅ Fake data - bạn có thể thay bằng gọi API ở đây
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
    ];
    setArticles(fakeData);
  }, []);

  const handleEdit = (id) => {
    // TODO: Mở modal hoặc chuyển trang sửa bài viết
    alert(`Chỉnh sửa bài viết ID: ${id}`);
  };

  const handleDelete = (id) => {
    // TODO: Gọi API xóa bài viết (DELETE /api/articles/:id)
    const newArticles = articles.filter((a) => a.ArticleId !== id);
    setArticles(newArticles);
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h5" style={{ marginBottom: 16 }}>
        Quản lý bài viết
      </Typography>
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
            {articles.map((article) => (
              <TableRow key={article.ArticleId}>
                <TableCell>{article.Title}</TableCell>
                <TableCell>{article.Content}</TableCell>
                <TableCell>{article.PublishedDate}</TableCell>
                <TableCell>{article.UpdatedDate}</TableCell>
                <TableCell>
                  <div style={{ display: "flex", gap: 8 }}>
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
            {articles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Không có bài viết nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ArticleManage;
