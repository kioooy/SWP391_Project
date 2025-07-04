import React from 'react';
import { Container, Typography, Box, TextField, Button, Grid, Paper } from '@mui/material';

const Contact = () => (
  <Container maxWidth="sm" sx={{ py: 8 }}>
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h3" align="center" fontWeight={700} gutterBottom color="primary">
        Liên Hệ
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" align="center">
          Địa chỉ: Dai Hoc Fpt, Thu Duck, TP.HCM<br />
          Điện thoại: 0123 456 789<br />
          Email: lienhe@hienmau.vn
        </Typography>
      </Box>
      <Box component="form" noValidate autoComplete="off">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField label="Họ và tên" fullWidth required variant="outlined" />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Email" type="email" fullWidth required variant="outlined" />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Nội dung" fullWidth required multiline rows={4} variant="outlined" />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" fullWidth disabled>Gửi liên hệ</Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  </Container>
);

export default Contact; 