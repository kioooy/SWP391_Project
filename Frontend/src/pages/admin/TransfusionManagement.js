import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5250/api";
const token = localStorage.getItem("token");

const TransfusionManage = () => {
  const [transfusions, setTransfusions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchTransfusions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/TransfusionRequest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransfusions(res.data);
    } catch (err) {
      console.error("Failed to fetch transfusions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await axios.patch(
        `${API_URL}/TransfusionRequest/${id}/${action}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchTransfusions();
    } catch (err) {
      console.error(`Failed to ${action} transfusion:`, err);
    }
  };

  useEffect(() => {
    fetchTransfusions();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h5" gutterBottom>
        💉 Quản lý yêu cầu truyền máu
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bệnh nhân</TableCell>
                <TableCell>Nhóm máu</TableCell>
                <TableCell>Thành phần</TableCell>
                <TableCell>Khẩn cấp</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transfusions.map((t) => (
                <TableRow key={t.TransfusionId}>
                  <TableCell>{t.Member?.User?.FullName}</TableCell>
                  <TableCell>{t.BloodType?.BloodTypeName}</TableCell>
                  <TableCell>{t.Component?.ComponentName}</TableCell>
                  <TableCell>{t.IsEmergency ? "Có" : "Không"}</TableCell>
                  <TableCell>{t.Status}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => {
                        setSelected(t);
                        setDetailOpen(true);
                      }}
                    >
                      👁 Xem
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleAction(t.TransfusionId, "approve")}
                    >
                      ✔️ Duyệt
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleAction(t.TransfusionId, "complete")}
                    >
                      ✅ Hoàn thành
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleAction(t.TransfusionId, "cancel")}
                    >
                      ❌ Hủy
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết yêu cầu</DialogTitle>
        <DialogContent>
          {selected && (
            <div style={{ display: "grid", gap: 8 }}>
              <Typography>
                <b>Họ tên:</b> {selected.Member?.User?.FullName}
              </Typography>
              <Typography>
                <b>Trạng thái:</b> {selected.Status}
              </Typography>
              <Typography>
                <b>Khẩn cấp:</b> {selected.IsEmergency ? "Có" : "Không"}
              </Typography>
              <Typography>
                <b>Thể tích:</b> {selected.TransfusionVolume} ml
              </Typography>
              <Typography>
                <b>Ngày yêu cầu:</b> {selected.RequestDate}
              </Typography>
              <Typography>
                <b>Ghi chú:</b> {selected.Notes}
              </Typography>
              <Typography>
                <b>Tình trạng bệnh nhân:</b> {selected.PatientCondition}
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TransfusionManage;
