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

const BloodStorageManage = () => {
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
    const fakeData = [
      {
        BloodUnitId: "BU001",
        BloodTypeName: "O+",
        ComponentName: "Hồng cầu",
        FullName: "Nguyễn Văn A",
        AddDate: "2024-06-01",
        ExpiryDate: "2024-07-01",
        Volume: 450,
        RemainingVolume: 450,
        BloodStatus: "Available",
      },
      {
        BloodUnitId: "BU002",
        BloodTypeName: "A-",
        ComponentName: "Huyết tương",
        FullName: "Trần Thị B",
        AddDate: "2024-06-05",
        ExpiryDate: "2024-07-05",
        Volume: 250,
        RemainingVolume: 200,
        BloodStatus: "Used",
      },
    ];
    setBloodUnits(fakeData);
    setFilteredUnits(fakeData);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = bloodUnits.filter((unit) =>
      unit.FullName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUnits(filtered);
  };

  const handleCreate = () => {
    const { BloodTypeName, ComponentName, FullName, Volume, BloodStatus } =
      newBlood;

    if (!BloodTypeName || !ComponentName || !FullName || !Volume) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const now = new Date();
    const newUnit = {
      BloodUnitId: "BU" + (bloodUnits.length + 1).toString().padStart(3, "0"),
      BloodTypeName,
      ComponentName,
      FullName,
      AddDate: now.toISOString().split("T")[0],
      ExpiryDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 ngày
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
      BloodTypeName: "",
      ComponentName: "",
      FullName: "",
      Volume: "",
      BloodStatus: "Available",
    });
    alert("✅ Thêm đơn vị máu thành công!");
  };

  const handleEdit = (unit) => {
    setEditBlood({ ...unit });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    const updated = bloodUnits.map((u) =>
      u.BloodUnitId === editBlood.BloodUnitId ? editBlood : u
    );
    setBloodUnits(updated);
    setFilteredUnits(updated);
    setIsEditOpen(false);
    setEditBlood(null);
    alert("✅ Cập nhật đơn vị máu thành công!");
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
          label="Tìm kiếm theo tên người hiến"
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
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>Loại máu</strong>
              </TableCell>
              <TableCell>
                <strong>Thành phần</strong>
              </TableCell>
              <TableCell>
                <strong>Người hiến</strong>
              </TableCell>
              <TableCell>
                <strong>Ngày nhập</strong>
              </TableCell>
              <TableCell>
                <strong>Hạn sử dụng</strong>
              </TableCell>
              <TableCell>
                <strong>Thể tích</strong>
              </TableCell>
              <TableCell>
                <strong>Còn lại</strong>
              </TableCell>
              <TableCell>
                <strong>Trạng thái</strong>
              </TableCell>
              <TableCell>
                <strong>Hành động</strong>
              </TableCell>
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
          <TextField
            label="Loại máu"
            fullWidth
            value={newBlood.BloodTypeName}
            onChange={(e) =>
              setNewBlood({ ...newBlood, BloodTypeName: e.target.value })
            }
          />
          <TextField
            label="Thành phần"
            fullWidth
            value={newBlood.ComponentName}
            onChange={(e) =>
              setNewBlood({ ...newBlood, ComponentName: e.target.value })
            }
          />
          <TextField
            label="Người hiến"
            fullWidth
            value={newBlood.FullName}
            onChange={(e) =>
              setNewBlood({ ...newBlood, FullName: e.target.value })
            }
          />
          <TextField
            label="Thể tích (mL)"
            fullWidth
            type="number"
            value={newBlood.Volume}
            onChange={(e) =>
              setNewBlood({ ...newBlood, Volume: e.target.value })
            }
          />
          <TextField
            label="Trạng thái"
            fullWidth
            value={newBlood.BloodStatus}
            onChange={(e) =>
              setNewBlood({ ...newBlood, BloodStatus: e.target.value })
            }
          />
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
          <TextField
            label="Loại máu"
            fullWidth
            value={editBlood?.BloodTypeName || ""}
            onChange={(e) =>
              setEditBlood({ ...editBlood, BloodTypeName: e.target.value })
            }
          />
          <TextField
            label="Thành phần"
            fullWidth
            value={editBlood?.ComponentName || ""}
            onChange={(e) =>
              setEditBlood({ ...editBlood, ComponentName: e.target.value })
            }
          />
          <TextField
            label="Người hiến"
            fullWidth
            value={editBlood?.FullName || ""}
            onChange={(e) =>
              setEditBlood({ ...editBlood, FullName: e.target.value })
            }
          />
          <TextField
            label="Thể tích"
            fullWidth
            type="number"
            value={editBlood?.Volume || ""}
            onChange={(e) =>
              setEditBlood({ ...editBlood, Volume: +e.target.value })
            }
          />
          <TextField
            label="Còn lại"
            fullWidth
            type="number"
            value={editBlood?.RemainingVolume || ""}
            onChange={(e) =>
              setEditBlood({ ...editBlood, RemainingVolume: +e.target.value })
            }
          />
          <TextField
            label="Trạng thái"
            fullWidth
            value={editBlood?.BloodStatus || ""}
            onChange={(e) =>
              setEditBlood({ ...editBlood, BloodStatus: e.target.value })
            }
          />
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
