import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import axios from 'axios';

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/Article/${id}`)
      .then(res => {
        setArticle(res.data);
        setLoading(false);
      })
      .catch(() => {
        setArticle(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Container><Typography>Đang tải bài viết...</Typography></Container>;
  if (!article) return <Container><Typography>Không tìm thấy bài viết.</Typography></Container>;

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
        {article.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {article.publishedDate ? new Date(article.publishedDate).toLocaleDateString() : ''}
      </Typography>
      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt={article.title}
          style={{ width: '100%', maxHeight: 350, objectFit: 'cover', borderRadius: 8, marginBottom: 24 }}
        />
      )}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1">{article.content}</Typography>
      </Box>
    </Container>
  );
};

export default ArticleDetail; 