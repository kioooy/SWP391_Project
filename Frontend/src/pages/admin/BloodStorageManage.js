import React, { useState, useEffect } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
} from "@mui/material";

const BloodStorageManage = () => {
  const [bloodUnits, setBloodUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);

  useEffect(() => {
    const fakeData = [
      {
        BloodUnitId: "BU001",
        BloodTypeName: "O+",
        ComponentName: "Hồng cầu",
        FullName: "Nguyễn Văn A",
        AddDate: "2025-06-01",
        ExpiryDate: "2025-07-01",
        Volume: 450,
        BloodStatus: "Lưu trữ",
        RemainingVolume: 400,
      },
      {
        BloodUnitId: "BU002",
        BloodTypeName: "A-",
        ComponentName: "Tiểu cầu",
        FullName: "Trần Thị B",
        AddDate: "2025-06-10",
        ExpiryDate: "2025-06-30",
        Volume: 350,
        BloodStatus: "Đã sử dụng",
        RemainingVolume: 0,
      },
    ];
    setBloodUnits(fakeData);
    setFilteredUnits(fakeData);
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value.toLowerCase();
    setSearchTerm(val);
    const filtered = bloodUnits.filter(
      (b) =>
        b.BloodTypeName.toLowerCase().includes(val) ||
        b.ComponentName.toLowerCase().includes(val) ||
        b.FullName.toLowerCase().includes(val)
    );
    setFilteredUnits(filtered);
  };

  const handleView = (unit) => {
    setSelectedUnit(unit);
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h5" gutterBottom>
        Quản lý kho máu 🩸
      </Typography>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <TextField
          label="Tìm theo loại máu / thành phần / người hiến"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
        />
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
                <strong>Thể tích (mL)</strong>
              </TableCell>
              <TableCell>
                <strong>Còn lại (mL)</strong>
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
            {filteredUnits.length ? (
              filteredUnits.map((unit) => (
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
                      size="small"
                      variant="outlined"
                      onClick={() => handleView(unit)}
                    >
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  Không tìm thấy đơn vị máu nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedUnit && (
        <Card
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: "#e3f2fd",
            borderRadius: 12,
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🧾 Chi tiết đơn vị máu
            </Typography>
            <div style={{ display: "grid", rowGap: 8 }}>
              <div>
                <strong>ID:</strong> {selectedUnit.BloodUnitId}
              </div>
              <div>
                <strong>Loại máu:</strong> {selectedUnit.BloodTypeName}
              </div>
              <div>
                <strong>Thành phần:</strong> {selectedUnit.ComponentName}
              </div>
              <div>
                <strong>Người hiến:</strong> {selectedUnit.FullName}
              </div>
              <div>
                <strong>Ngày nhập:</strong> {selectedUnit.AddDate}
              </div>
              <div>
                <strong>Hạn sử dụng:</strong> {selectedUnit.ExpiryDate}
              </div>
              <div>
                <strong>Thể tích:</strong> {selectedUnit.Volume} mL
              </div>
              <div>
                <strong>Còn lại:</strong> {selectedUnit.RemainingVolume} mL
              </div>
              <div>
                <strong>Trạng thái:</strong> {selectedUnit.BloodStatus}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BloodStorageManage;
