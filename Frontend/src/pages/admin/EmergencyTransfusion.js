import React, { useState } from "react";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const statusOptions = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];

const statusLabelMap = {
  PENDING: "Đang chờ",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const mockData = [
  {
    id: 1,
    patientName: "Nguyễn Văn A",
    bloodType: "O+",
    status: "PENDING",
    createdAt: "2025-07-02T10:30:00",
  },
  {
    id: 2,
    patientName: "Trần Thị B",
    bloodType: "A-",
    status: "PROCESSING",
    createdAt: "2025-07-01T14:00:00",
  },
];

const EmergencyTransfusionPage = () => {
  const [data, setData] = useState(mockData);
  const isAdmin = true;

  const handleUpdateStatus = (id, newStatus) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa đơn này?")) {
      setData((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <Container maxWidth="lg" style={{ padding: "32px 0" }}>
      <Typography variant="h4" gutterBottom>
        Quản Lý Truyền Máu Khẩn Cấp
      </Typography>
      <Paper elevation={3} style={{ padding: "16px" }}>
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
                <TableRow key={item.id}>
                  <TableCell>{item.patientName}</TableCell>
                  <TableCell>{item.bloodType}</TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.status}
                      size="small"
                      onChange={(e) =>
                        handleUpdateStatus(item.id, e.target.value)
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
                        onClick={() => handleDelete(item.id)}
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
      </Paper>
    </Container>
  );
};

export default EmergencyTransfusionPage;
