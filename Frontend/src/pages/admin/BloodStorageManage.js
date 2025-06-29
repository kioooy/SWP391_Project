import React, { useEffect, useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";

const BloodStorageManage = () => {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5250/api";
  const token = localStorage.getItem("token");
  const [bloodUnits, setBloodUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBlood, setNewBlood] = useState({
    BloodTypeName: "",
    ComponentName: "",
    FullName: "",
    Volume: "",
    BloodStatus: "Available",
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editBlood, setEditBlood] = useState(null);

  useEffect(() => {
    const fetchBloodUnits = async () => {
      try {
        const res = await axios.get(`${API_URL}/BloodUnit`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBloodUnits(res.data);
        setFilteredUnits(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn vị máu:", error);
      }
    };

    fetchBloodUnits();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = bloodUnits.filter((unit) =>
      unit.FullName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUnits(filtered);
  };
  const handleCreate = async () => {
    const {
      BloodTypeId,
      ComponentId,
      MemberId,
      Volume,
      BloodStatus = "Available",
    } = newBlood;

    if (!BloodTypeId || !ComponentId || !MemberId || !Volume) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/BloodUnit`,
        {
          bloodTypeId: BloodTypeId,
          componentId: ComponentId,
          memberId: MemberId,
          volume: +Volume,
          bloodStatus: BloodStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const created = res.data;
      const now = new Date();
      const newUnit = {
        BloodUnitId: "BU" + (bloodUnits.length + 1).toString().padStart(3, "0"),
        BloodTypeName: BloodTypeId,
        ComponentName: ComponentId,
        FullName: MemberId,
        AddDate: now.toISOString().split("T")[0],
        ExpiryDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        Volume: +Volume,
        RemainingVolume: +Volume,
        BloodStatus: BloodStatus || "Available",
      };

      const updated = [newUnit, ...bloodUnits];
      setBloodUnits(updated);
      setFilteredUnits(updated);
      setIsCreateOpen(false);

      setNewBlood({
        BloodTypeId: "",
        ComponentId: "",
        MemberId: "",
        Volume: "",
        BloodStatus: "Available",
      });

      alert("✅ Thêm đơn vị máu thành công!");
    } catch (error) {
      console.error("Lỗi khi tạo đơn vị máu:", error);
      alert("❌ Tạo đơn vị máu thất bại!");
    }
  };

  const handleEdit = (unit) => {
    setEditBlood({ ...unit });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    const {
      BloodUnitId,
      BloodTypeId,
      ComponentId,
      MemberId,
      Volume,
      RemainingVolume,
      BloodStatus,
      AddDate,
    } = editBlood;

    if (!BloodUnitId || !BloodTypeId || !ComponentId || !MemberId || !Volume) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      await axios.patch(
        `${API_URL}/BloodUnit/${BloodUnitId}`,
        {
          bloodTypeId: BloodTypeId,
          componentId: ComponentId,
          memberId: MemberId,
          volume: +Volume,
          remainingVolume: +RemainingVolume,
          bloodStatus: BloodStatus,
          addDate: AddDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = bloodUnits.map((u) =>
        u.BloodUnitId === BloodUnitId
          ? {
              ...editBlood,
              UpdatedDate: new Date().toISOString().split("T")[0],
            }
          : u
      );

      setBloodUnits(updated);
      setFilteredUnits(updated);
      setIsEditOpen(false);
      setEditBlood(null);
      alert("✅ Cập nhật đơn vị máu thành công!");
    } catch (error) {
      console.error("❌ Lỗi cập nhật đơn vị máu:", error);
      alert("❌ Cập nhật đơn vị máu thất bại!");
    }
  };

  const handleToggleStatus = async (unit) => {
    let newStatus = unit.BloodStatus;
    let newRemaining = unit.RemainingVolume;

    if (unit.BloodStatus === "Available") {
      newStatus = "Used";
    } else if (unit.BloodStatus === "Used") {
      const confirm = window.confirm(
        "Bạn có chắc muốn loại bỏ đơn vị máu này không?"
      );
      if (!confirm) return;
      newStatus = "Removed";
      newRemaining = 0;
    } else {
      return;
    }

    try {
      await axios.patch(
        `${API_URL}/BloodUnit/${unit.BloodUnitId}/update-status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = bloodUnits.map((u) =>
        u.BloodUnitId === unit.BloodUnitId
          ? {
              ...u,
              BloodStatus: newStatus,
              RemainingVolume: newRemaining,
            }
          : u
      );
      setBloodUnits(updated);
      setFilteredUnits(updated);
      alert("✅ Cập nhật trạng thái đơn vị máu thành công!");
    } catch (error) {
      console.error("❌ Lỗi cập nhật trạng thái:", error);
      alert("❌ Không thể cập nhật trạng thái đơn vị máu!");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h5" gutterBottom>
        🩸 Quản lý kho máu
      </Typography>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <TextField
          label="Tìm kiếm theo tên người hiến, đơn vị máu"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: "70%" }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsCreateOpen(true)}
        >
          ➕ Thêm đơn vị máu
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead style={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              {[
                "ID",
                "Loại máu",
                "Thành phần",
                "Người hiến",
                "Ngày nhập",
                "Hạn sử dụng",
                "Thể tích",
                "Còn lại",
                "Trạng thái",
                "Hành động",
              ].map((h) => (
                <TableCell key={h}>
                  <strong>{h}</strong>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUnits.map((unit) => (
              <TableRow key={unit.BloodUnitId}>
                <TableCell>{unit.BloodUnitId}</TableCell>
                <TableCell>{unit.BloodTypeName}</TableCell>
                <TableCell>{unit.ComponentName}</TableCell>
                <TableCell>{unit.FullName}</TableCell>
                <TableCell>{unit.AddDate}</TableCell>
                <TableCell>{unit.ExpiryDate}</TableCell>
                <TableCell>{unit.Volume}</TableCell>
                <TableCell>{unit.RemainingVolume}</TableCell>
                <TableCell>{unit.BloodStatus}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleEdit(unit)}
                  >
                    Sửa
                  </Button>
                  {unit.BloodStatus !== "Removed" && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      style={{ marginLeft: 8 }}
                      onClick={() => handleToggleStatus(unit)}
                    >
                      {unit.BloodStatus === "Available"
                        ? "Đánh dấu đã dùng"
                        : "Loại bỏ"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredUnits.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  Không tìm thấy đơn vị máu nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal tạo */}
      <Dialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>➕ Thêm đơn vị máu</DialogTitle>
        <DialogContent style={{ display: "grid", gap: 12, marginTop: 8 }}>
          {[
            "Loại máu",
            "Thành phần",
            "Người hiến",
            "Thể tích (mL)",
            "Trạng thái",
          ].map((label, i) => (
            <TextField
              key={i}
              label={label}
              fullWidth
              type={label.includes("Thể tích") ? "number" : "text"}
              value={newBlood[Object.keys(newBlood)[i]]}
              onChange={(e) =>
                setNewBlood({
                  ...newBlood,
                  [Object.keys(newBlood)[i]]: e.target.value,
                })
              }
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreate}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal sửa */}
      <Dialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>✏️ Cập nhật đơn vị máu</DialogTitle>
        <DialogContent style={{ display: "grid", gap: 12, marginTop: 8 }}>
          {editBlood &&
            Object.keys(editBlood)
              .filter(
                (k) =>
                  k !== "BloodUnitId" && k !== "AddDate" && k !== "ExpiryDate"
              )
              .map((key, i) => (
                <TextField
                  key={i}
                  label={key}
                  fullWidth
                  type={key.includes("Volume") ? "number" : "text"}
                  value={editBlood[key] || ""}
                  onChange={(e) =>
                    setEditBlood({
                      ...editBlood,
                      [key]: key.includes("Volume")
                        ? +e.target.value
                        : e.target.value,
                    })
                  }
                />
              ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BloodStorageManage;
