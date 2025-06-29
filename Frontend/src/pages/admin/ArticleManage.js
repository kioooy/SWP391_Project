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
} from "@mui/material";

const ArticleManage = () => {
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
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editArticle, setEditArticle] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  useEffect(() => {
    const fakeData = [
      {
        ArticleId: "1",
        UserId: "201",
        Title: "Lợi ích của việc hiến máu tình nguyện",
        Content:
          "Hiến máu không chỉ cứu người mà còn giúp cải thiện sức khỏe người hiến, kích thích tái tạo máu mới.",
        Status: "Published",
        IsActive: true,
        PublishedDate: "2025-01-10",
        UpdatedDate: "2025-01-12",
      },
      {
        ArticleId: "2",
        UserId: "202",
        Title: "Những điều cần biết trước khi hiến máu",
        Content:
          "Trước khi hiến máu, cần ăn nhẹ, ngủ đủ giấc, không uống bia rượu và mang theo giấy tờ tùy thân.",
        Status: "Draft",
        IsActive: true,
        PublishedDate: "2025-02-01",
        UpdatedDate: "2025-02-05",
      },
      {
        ArticleId: "3",
        UserId: "203",
        Title: "Ai không đủ điều kiện hiến máu?",
        Content:
          "Người mắc các bệnh truyền nhiễm, thiếu máu nặng, huyết áp quá cao/thấp, phụ nữ mang thai không được hiến máu.",
        Status: "Published",
        IsActive: false,
        PublishedDate: "2025-03-01",
        UpdatedDate: "2025-03-10",
      },
      {
        ArticleId: "4",
        UserId: "204",
        Title: "Quy trình hiến máu diễn ra như thế nào?",
        Content:
          "Quy trình hiến máu bao gồm đăng ký, kiểm tra sức khỏe, lấy máu và nghỉ ngơi sau khi hiến.",
        Status: "Draft",
        IsActive: true,
        PublishedDate: "2025-04-05",
        UpdatedDate: "2025-04-06",
      },
    ];

    setArticles(fakeData);
    setFilteredArticles(fakeData);
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

  const handleToggleActive = (id) => {
    const updated = articles.map((a) => {
      if (a.ArticleId === id) {
        return {
          ...a,
          IsActive: !a.IsActive,
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
                <strong>Hành động</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedArticles.map((article) => (
              <TableRow key={article.ArticleId}>
                <TableCell>{article.Title}</TableCell>
                <TableCell>{article.Status}</TableCell>
                <TableCell>{article.IsActive ? "✅" : "⛔"}</TableCell>
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
                      color={article.IsActive ? "warning" : "success"}
                      onClick={() => handleToggleActive(article.ArticleId)}
                    >
                      {article.IsActive ? "Vô hiệu hóa" : "Kích hoạt"}
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
        <Card
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: "#f0f4f8",
            borderRadius: 12,
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📝 Chi tiết bài viết
            </Typography>
            <div style={{ display: "grid", rowGap: 12 }}>
              <div>
                <strong>🆔 ID:</strong> {selectedArticle.ArticleId}
              </div>
              <div>
                <strong>👤 User ID:</strong> {selectedArticle.UserId}
              </div>
              <div>
                <strong>📌 Tiêu đề:</strong> {selectedArticle.Title}
              </div>
              <div>
                <strong>📝 Nội dung:</strong> {selectedArticle.Content}
              </div>
              <div>
                <strong>📊 Trạng thái:</strong> {selectedArticle.Status}
              </div>
              <div>
                <strong>🔒 Kích hoạt:</strong>{" "}
                {selectedArticle.IsActive ? "Có" : "Không"}
              </div>
              <div>
                <strong>📅 Ngày đăng:</strong> {selectedArticle.PublishedDate}
              </div>
              <div>
                <strong>🔄 Cập nhật:</strong> {selectedArticle.UpdatedDate}
              </div>
            </div>
          </CardContent>
        </Card>
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
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Published">Published</MenuItem>
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

      {/* Modal chỉnh sửa */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)}>
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
              value={editArticle?.Status || ""}
              onChange={(e) =>
                setEditArticle({ ...editArticle, Status: e.target.value })
              }
              label="Trạng thái"
            >
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Published">Published</MenuItem>
            </Select>
          </FormControl>
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
