import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Tooltip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Bloodtype as BloodIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';

// Mock Redux store data and actions
const useTransfusionStore = () => {
  const [transfusions, setTransfusions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get id's staff or admin when update transfusion
  //   const userId = localStorage.getItem("userId");
  //   const userProfile = localStorage.getItem("userProfile");

  useEffect(() => {
    // Mock API call
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        // Call API update transfusion
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Call API get all transfusion
        const mockTransfusions = [
          {
            TransfusionId: 1,
            MemberId: 101,
            BloodTypeId: 1,
            ComponentId: 1,
            BloodUnitId: 501,
            ResponsibleById: 2,
            IsEmergency: true,
            TransfusionVolume: 450,
            PreferredReceiveDate: "2025-06-10T10:00:00",
            RequestDate: "2025-06-05T08:30:00",
            ApprovalDate: "2025-06-05T14:00:00",
            CompletionDate: null,
            Status: "Approved",
            Notes: "Patient has low hemoglobin levels",
            PatientCondition: "Stable",
            BloodType: { BloodTypeName: "O+" },
            BloodUnit: { BloodUnitId: "BU-2025-001" },
            BloodComponent: { ComponentName: "Whole Blood" },
            Member: {
              User: { FullName: "Nguyen Van A" },
              Weight: "80",
              Height: "1m72",
            },
            ResponsibleBy: { FullName: "Dr. Tran B" },
          },
          {
            TransfusionId: 2,
            MemberId: 102,
            BloodTypeId: 2,
            ComponentId: 2,
            BloodUnitId: 502,
            ResponsibleById: null,
            IsEmergency: false,
            TransfusionVolume: 250,
            PreferredReceiveDate: "2025-06-12T14:00:00",
            RequestDate: "2025-06-04T16:20:00",
            ApprovalDate: null,
            CompletionDate: null,
            Status: "Rejected",
            Notes: null,
            PatientCondition: "Requires monitoring",
            BloodType: { BloodTypeName: "A+" },
            BloodUnit: { BloodUnitId: "BU-2025-002" },
            BloodComponent: { ComponentName: "Red Blood Cells" },
            Member: {
              User: { FullName: "Le Thi C" },
              Weight: "80",
              Height: "1m72",
            },
            ResponsibleBy: null,
          },
          {
            TransfusionId: 3,
            MemberId: 103,
            BloodTypeId: 3,
            ComponentId: 1,
            BloodUnitId: 503,
            ResponsibleById: 3,
            IsEmergency: false,
            TransfusionVolume: 300,
            PreferredReceiveDate: "2025-06-08T09:00:00",
            RequestDate: "2025-06-03T11:15:00",
            ApprovalDate: "2025-06-04T10:30:00",
            CompletionDate: "2025-06-08T10:45:00",
            Status: "Completed",
            Notes: "Transfusion completed successfully",
            PatientCondition: "Good recovery",
            BloodType: { BloodTypeName: "B+" },
            BloodUnit: { BloodUnitId: "BU-2025-003" },
            BloodComponent: { ComponentName: "Whole Blood" },
            Member: {
              User: { FullName: "Pham Van D" },
              Weight: "80",
              Height: "1m72",
            },
            ResponsibleBy: { FullName: "Dr. Hoang E" },
          },
        ];

        setTransfusions(mockTransfusions);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateTransfusion = async (id, data) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setTransfusions((prev) =>
        prev.map((t) =>
          t.TransfusionId === id
            ? {
                ...t,
                ...data,
              }
            : t
        )
      );
      return { success: true };
    } catch (err) {
      setError("Failed to update transfusion");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    transfusions,
    loading,
    error,
    updateTransfusion,
    clearError: () => setError(null),
  };
};

const TransfusionManagement = () => {
  const user = useSelector(selectUser);
  const { transfusions, loading, error, updateTransfusion, clearError } = useTransfusionStore();
  const [editDialog, setEditDialog] = useState({
    open: false,
    transfusion: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const statusOptions = ["Approved", "Completed", "Rejected"];

  const getStatusColor = (status) => {
    const colors = {
      Approved: "primary",
      Completed: "success",
      Rejected: "error",
    };
    return colors[status] || "default";
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  // Formik validation schema
  const validationSchema = Yup.object({
    ResponsibleById: Yup.number().nullable(),
    Status: Yup.string().oneOf(statusOptions).required("Status is required"),
    Notes: Yup.string().max(500, "Notes must be less than 500 characters"),
  });

  const formik = useFormik({
    initialValues: {
      Status: "",
      Notes: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const result = await updateTransfusion(
        editDialog.transfusion.TransfusionId,
        {
          Status: values.Status,
          Notes: values.Notes || null,
        }
      );

      if (result.success) {
        setSnackbar({
          open: true,
          message: "Transfusion updated successfully!",
          severity: "success",
        });
        handleCloseDialog();
      } else {
        setSnackbar({
          open: true,
          message: "Failed to update transfusion",
          severity: "error",
        });
      }
    },
  });

  const handleEditClick = (transfusion) => {
    formik.setValues({
      Status: transfusion.Status,
      Notes: transfusion.Notes || "",
    });
    setEditDialog({ open: true, transfusion });
  };

  const handleCloseDialog = () => {
    setEditDialog({ open: false, transfusion: null });
    formik.resetForm();
  };

  const getStatistics = () => {
    return statusOptions.map((status) => ({
      status,
      count: transfusions.filter((t) => t.Status === status).length,
    }));
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3, justifyContent: "center" }}>
        {getStatistics().map(({ status, count }) => (
          <Grid item xs={12} sm={6} md={3} key={status}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {status}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {count}
                    </Typography>
                  </Box>
                  <Chip
                    label={status}
                    color={getStatusColor(status)}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Transfusions Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Transfusion Requests
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transfusion Info</TableCell>
                  <TableCell>Member</TableCell>
                  <TableCell>Blood Details</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Responsible</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transfusions.map((transfusion) => (
                  <TableRow key={transfusion.TransfusionId} hover>
                    {/* Transfusion Info */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          ID: {transfusion.TransfusionId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Volume: {transfusion.TransfusionVolume}ml
                        </Typography>
                        {transfusion.IsEmergency && (
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              icon={<BloodIcon />}
                              label="Emergency"
                              color="error"
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        )}
                      </Box>
                    </TableCell>

                    {/* Member */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {transfusion?.Member?.User?.FullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Cân nặng: {transfusion?.Member?.Weight}
                        </Typography>
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          Chiều cao: {transfusion?.Member?.Height}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Blood Details */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {transfusion?.BloodType?.BloodTypeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {transfusion?.BloodComponent?.ComponentName}
                        </Typography>
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {transfusion?.BloodUnit?.BloodUnitId || "N/A"}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Dates */}
                    <TableCell>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Req: {formatDateTime(transfusion?.RequestDate)}
                        </Typography>
                        {transfusion?.PreferredReceiveDate && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            Pref:{" "}
                            {formatDateTime(transfusion?.PreferredReceiveDate)}
                          </Typography>
                        )}
                        {transfusion.CompletionDate && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            Done: {formatDateTime(transfusion?.CompletionDate)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Responsible */}
                    <TableCell>
                      {transfusion.ResponsibleBy ? (
                        <Typography variant="body2" fontWeight="medium">
                          {transfusion?.ResponsibleBy?.FullName}
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontStyle="italic"
                        >
                          Not assigned
                        </Typography>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={transfusion?.Status}
                        color={getStatusColor(transfusion?.Status)}
                        size="small"
                      />
                    </TableCell>

                    {/* Notes */}
                    <TableCell>
                      <Box sx={{ maxWidth: 200 }}>
                        {transfusion.Notes ? (
                          <Tooltip title={transfusion?.Notes} arrow>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {transfusion?.Notes}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontStyle="italic"
                          >
                            No notes
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center">
                      <Tooltip title="Edit Transfusion">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditClick(transfusion)}
                          disabled={loading}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EditIcon color="primary" />
              Edit Transfusion #{editDialog.transfusion?.TransfusionId}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 3 }}
            >
              <TextField
                select
                label="Status"
                name="Status"
                value={formik.values.Status}
                onChange={formik.handleChange}
                error={formik.touched.Status && Boolean(formik.errors.Status)}
                helperText={formik.touched.Status && formik.errors.Status}
                required
                fullWidth
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={status}
                        color={getStatusColor(status)}
                        size="small"
                      />
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              {/* Notes */}
              <TextField
                label="Notes"
                name="Notes"
                value={formik.values.Notes}
                onChange={formik.handleChange}
                error={formik.touched.Notes && Boolean(formik.errors.Notes)}
                helperText={formik.touched.Notes && formik.errors.Notes}
                multiline
                rows={4}
                placeholder="Enter notes about the transfusion..."
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseDialog}
              startIcon={<CancelIcon />}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
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

      {/* Error handling */}
      {error && (
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={6000}
          onClose={clearError}
        >
          <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default TransfusionManagement;
