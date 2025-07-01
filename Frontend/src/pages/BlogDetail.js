import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Card, CardContent, CardMedia, Box, Button } from "@mui/material";
import axios from "axios";

const BlogDetail = () => {
  const { postId } = useParams();
  const [blog, setBlog] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5250/api";
      const res = await axios.get(`${apiUrl}/blog/${postId}`);
      setBlog(res.data);
    };
    fetchBlog();
  }, [postId]);

  if (!blog) return <Container sx={{ py: 8 }}><Typography>Đang tải...</Typography></Container>;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button variant="outlined" sx={{ mb: 3 }} onClick={() => navigate(-1)}>
        Quay lại
      </Button>
      <Card sx={{ borderRadius: 3, boxShadow: 4, overflow: 'hidden' }}>
        {blog.imageUrl && (
          <CardMedia
            component="img"
            height="350"
            image={blog.imageUrl}
            alt={blog.title}
            sx={{ objectFit: 'cover' }}
          />
        )}
        <CardContent>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
            {blog.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {new Date(blog.publishedDate).toLocaleDateString()}
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontSize: 18 }}>
              {blog.content}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default BlogDetail; 