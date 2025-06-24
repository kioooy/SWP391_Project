import React, { useEffect, useState } from "react";
import { Container, Typography, Card, CardContent, CardMedia, Grid } from "@mui/material";
import axios from "axios";

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);

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
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Blog
      </Typography>
      <Grid container spacing={3}>
        {blogs.map((blog) => (
          <Grid item xs={12} md={6} lg={4} key={blog.postId}>
            <Card>
              {blog.imageUrl && (
                <CardMedia
                  component="img"
                  height="180"
                  image={blog.imageUrl}
                  alt={blog.title}
                />
              )}
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {blog.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {new Date(blog.publishedDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  {blog.content.slice(0, 120)}...
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default BlogPage; 