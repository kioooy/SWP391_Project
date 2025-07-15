import React, { useEffect, useState } from "react";
import { Container, Typography, Card, CardContent, CardMedia, Grid, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5250/api";
      const res = await axios.get(`${apiUrl}/blog`);
      setBlogs(res.data);
    };
    fetchBlogs();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', mb: 4, textAlign: 'center' }}>
        Bài Viết
      </Typography>
      <Grid container spacing={4}>
        {blogs.length === 0 ? (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary" sx={{ fontStyle: 'italic', mt: 6, fontSize: 22 }}>
              Hiện chưa có bài viết nào.
            </Typography>
          </Grid>
        ) : (
          blogs.map((blog) => (
            <Grid item xs={12} md={6} lg={4} key={blog.postId}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.03)',
                    boxShadow: 8,
                  },
                  overflow: 'hidden',
                }}
                onClick={() => navigate(`/blog/${blog.postId}`)}
              >
                {blog.imageUrl && (
                  <CardMedia
                    component="img"
                    height="220"
                    image={blog.imageUrl}
                    alt={blog.title}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', minHeight: 60 }}>
                    {blog.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {new Date(blog.publishedDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', minHeight: 60 }}>
                    {blog.content.length > 120 ? blog.content.slice(0, 120) + '...' : blog.content}
                  </Typography>
                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                      Xem chi tiết »
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default BlogPage; 