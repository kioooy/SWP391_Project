import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Snackbar, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormControlLabel, Checkbox, Popper, List, ListItem, ListItemButton
} from "@mui/material";
import axios from "axios";
import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';

const SUGGESTIONS = [
  {
    type: "donor",
    text: "[Huy Động] Tất cả người hiến máu cho chung nhóm máu {bloodType}: ..."
  },
  {
    type: "admin",
    text: "[Hệ Thống] Có yêu cầu huy động người hiến máu nhóm {bloodType}: ..."
  }
];

const DonorMobilizationComponent = ({ embedded = false, onNotified, bloodType: bloodTypeProp }) => {
  const user = useSelector(selectUser); // Lấy user từ redux
  const [bloodType, setBloodType] = useState(bloodTypeProp || "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [notifiedDonors, setNotifiedDonors] = useState([]);
  const [lastSentMessage, setLastSentMessage] = useState("");
  const [notifyAdmin, setNotifyAdmin] = useState(false);
  const [notifyDonors, setNotifyDonors] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (bloodTypeProp) setBloodType(bloodTypeProp);
  }, [bloodTypeProp]);

  useEffect(() => {
    // Nếu message đang rỗng, tự động điền gợi ý phù hợp
    if (!message && bloodType && (notifyDonors || notifyAdmin)) {
      let suggestion = null;
      if (notifyDonors) suggestion = SUGGESTIONS[0];
      else if (notifyAdmin) suggestion = SUGGESTIONS[1];
      if (suggestion) {
        const suggestText = suggestion.text.replace("{bloodType}", bloodType);
        setMessage(suggestText);
      }
    }
    // Nếu bỏ tick hết, xóa message
    if (!notifyDonors && !notifyAdmin) {
      setMessage("");
    }
  }, [notifyDonors, notifyAdmin, bloodType]);

  // Lọc gợi ý theo nhóm tick
  const getFilteredSuggestions = () => {
    let arr = [];
    if (notifyDonors) arr.push(SUGGESTIONS[0]);
    if (notifyAdmin) arr.push(SUGGESTIONS[1]);
    return arr;
  };

  // Khi staff gõ vào ô nhập, show gợi ý nếu có tick chọn nhóm nhận
  const handleMessageInput = (e) => {
    setMessage(e.target.value);
    if ((notifyDonors || notifyAdmin) && bloodType) {
      setShowSuggest(true);
      setAnchorEl(e.currentTarget);
    } else {
      setShowSuggest(false);
    }
  };

  // Khi chọn gợi ý, chèn vào ô nhập
  const handleSuggestionClick = (suggestion) => {
    const text = suggestion.text.replace("{bloodType}", bloodType);
    setMessage(text);
    setShowSuggest(false);
  };

  const handleNotify = async () => {
    if (!message.trim()) {
      setSnackbar({ open: true, message: "Vui lòng nhập nội dung thông báo!", severity: "error" });
      return;
    }
    if (!notifyAdmin && !notifyDonors) {
      setSnackbar({ open: true, message: "Vui lòng chọn ít nhất một nhóm nhận thông báo!", severity: "error" });
      return;
    }
    setSending(true);
    let successMsg = [];
    let errorMsg = [];
    let donorsList = [];
    try {
      const token = localStorage.getItem("token");
      // Gửi cho người hiến máu phù hợp
      if (notifyDonors) {
        try {
          const res = await axios.post("/api/BloodSearch/notify-all-donors", { message }, { headers: { Authorization: `Bearer ${token}` } });
          successMsg.push("Đã gửi cho người hiến máu phù hợp");
          donorsList = res.data.notifiedDonors || [];
        } catch (err) {
          errorMsg.push("Gửi cho người hiến máu phù hợp thất bại!");
        }
      }
      // Gửi cho admin
      if (notifyAdmin) {
        try {
          const payload = {
            userId: user?.userId, // userId của người đang thao tác
            message,
            notifyAdmin: true
          };
          const res = await axios.post("/api/Notification/CreateUrgentDonationRequest", payload, { headers: { Authorization: `Bearer ${token}` } });
          successMsg.push("Đã gửi cho admin");
        } catch (err) {
          errorMsg.push("Gửi cho admin thất bại!");
        }
      }
      setSnackbar({ open: true, message: [...successMsg, ...errorMsg].join(". "), severity: errorMsg.length ? "error" : "success" });
      setLastSentMessage(message);
      setMessage("");
      setNotifiedDonors(donorsList);
      setNotifyAdmin(false);
      setNotifyDonors(false);
      setBloodType("");
      if (onNotified) onNotified(donorsList);
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: embedded ? 'transparent' : '#fff', minHeight: embedded ? undefined : '100vh', p: embedded ? 0 : 2 }}>
      {!embedded && (
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: '#E53935' }}>Gửi thông báo</Typography>
      )}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Chọn nhóm nhận thông báo:</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
          <FormControlLabel
            control={<Checkbox checked={notifyDonors} onChange={e => {
              setNotifyDonors(e.target.checked);
              if (e.target.checked) setNotifyAdmin(false);
            }} color="primary" />}
            label="Gửi thông báo cho người hiến máu phù hợp"
          />
          <FormControlLabel
            control={<Checkbox checked={notifyAdmin} onChange={e => {
              setNotifyAdmin(e.target.checked);
              if (e.target.checked) setNotifyDonors(false);
            }} color="primary" />}
            label="Gửi thông báo cho admin"
          />
        </Box>
        <TextField
          label="Nội dung thông báo"
          value={message}
          onChange={handleMessageInput}
          onFocus={handleMessageInput}
          fullWidth
          multiline
          minRows={2}
          sx={{ mb: 2 }}
          inputProps={{ autoComplete: "off" }}
        />
        <Popper open={showSuggest && getFilteredSuggestions().length > 0} anchorEl={anchorEl} placement="bottom-start" style={{ zIndex: 1301 }}>
          <Paper elevation={3} sx={{ minWidth: 350 }}>
            <List dense>
              {getFilteredSuggestions().map((s, idx) => (
                <ListItem key={idx} disablePadding>
                  <ListItemButton onClick={() => handleSuggestionClick(s)}>
                    <Typography variant="body2">
                      {s.text.replace("{bloodType}", bloodType || "...")}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Popper>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleNotify}
          disabled={sending}
          startIcon={sending ? <CircularProgress size={20} /> : null}
          fullWidth
        >
          {sending ? "Đang gửi..." : "Gửi thông báo"}
        </Button>
        {lastSentMessage && (
          <Typography variant="body2" sx={{ mt: 2, color: 'primary.main', fontStyle: 'italic' }}>
            <strong>Nội dung vừa gửi:</strong> {lastSentMessage}
          </Typography>
        )}
        {(notifyAdmin || notifyDonors) && (
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Sẽ gửi cho: {notifyDonors && notifyAdmin ? "Người hiến máu phù hợp và admin" : notifyDonors ? "Người hiến máu phù hợp" : "Admin"}
          </Typography>
        )}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Hiển thị danh sách người nhận thông báo nếu có */}
      {notifiedDonors.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Danh sách người nhận thông báo</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Nhóm máu</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Cân nặng</TableCell>
                  <TableCell>Chiều cao</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifiedDonors.map((donor, idx) => (
                  <TableRow key={donor.userId || idx}>
                    <TableCell>{donor.fullName}</TableCell>
                    <TableCell>{donor.bloodTypeName}</TableCell>
                    <TableCell>{donor.phoneNumber || 'Ẩn'}</TableCell>
                    <TableCell>{donor.email || 'Ẩn'}</TableCell>
                    <TableCell>{donor.weight ? `${donor.weight} kg` : 'N/A'}</TableCell>
                    <TableCell>{donor.height ? `${donor.height} cm` : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default DonorMobilizationComponent; 