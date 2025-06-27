import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const Article = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/Article')
      .then(res => {
        setArticles(res.data);
        setLoading(false);
      })
      .catch(() => {
        setArticles([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <Container maxWidth="md" sx={{ py: 8 }}><Typography>Đang tải bài viết...</Typography></Container>;

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" fontWeight={700} align="center" gutterBottom sx={{ color: 'primary.main', mb: 4 }}>
        Thông Tin Các Nhóm Máu
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          {articles.length === 0 ? (
            <Grid item xs={12}>
              <Typography align="center" color="text.secondary">Không có bài viết nào.</Typography>
            </Grid>
          ) : (
            articles.map((article) => (
              <Grid item xs={12} md={6} key={article.articleId}>
                <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      gutterBottom
                      sx={{ color: 'primary.main', mb: 1, cursor: 'pointer' }}
                      component={RouterLink}
                      to={`/article/${article.articleId}`}
                    >
                      {article.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {article.publishedDate ? new Date(article.publishedDate).toLocaleDateString() : ''}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {article.content}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default Article; 