import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5250/api";
const token = localStorage.getItem("token");

const statusOptions = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];

const statusLabelMap = {
  PENDING: "Đang chờ",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const EmergencyTransfusionPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const isAdmin = true;

  const fetchUrgentRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/UrgentBloodRequest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách yêu cầu máu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrgentRequests();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `${API_URL}/UrgentBloodRequest/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData((prev) =>
        prev.map((item) =>
          item.urgentRequestId === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa yêu cầu này?")) return;
    try {
      await axios.delete(`${API_URL}/UrgentBloodRequest/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData((prev) => prev.filter((item) => item.urgentRequestId !== id));
    } catch (err) {
      console.error("Lỗi xóa yêu cầu:", err);
    }
  };

  return (
    <Container maxWidth="lg" style={{ padding: "32px 0" }}>
      <Typography variant="h4" gutterBottom>
        Quản Lý Yêu Cầu Máu Khẩn Cấp
      </Typography>
      <Paper elevation={3} style={{ padding: "16px" }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Bệnh nhân</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Nhóm máu</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Ngày yêu cầu</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Trạng thái</strong>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <strong>Hành động</strong>
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.urgentRequestId}>
                    <TableCell>{item.patientName}</TableCell>
                    <TableCell>{item.bloodType?.bloodTypeName}</TableCell>
                    <TableCell>
                      {new Date(item.requestDate).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.status}
                        size="small"
                        onChange={(e) =>
                          handleUpdateStatus(
                            item.urgentRequestId,
                            e.target.value
                          )
                        }
                      >
                        {statusOptions.map((status) => (
                          <MenuItem key={status} value={status}>
                            {statusLabelMap[status]}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <IconButton
                          onClick={() => handleDelete(item.urgentRequestId)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default EmergencyTransfusionPage;
