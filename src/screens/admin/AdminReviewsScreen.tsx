import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { adminApi } from '../../services/adminApi';
import { AppTheme } from '../../theme/theme';
import AppHeader from '../../components/AppHeader';

export default function AdminReviewsScreen() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const queryClient = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => adminApi.getReviews(token || ''),
    enabled: !!token,
    retry: 1,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ reviewId, status }: { reviewId: string; status: 'approved' | 'flagged' }) =>
      adminApi.updateReviewStatus(token || '', reviewId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  if (!token) {
    return <View style={styles.center}><Text style={styles.title}>Admin session missing</Text></View>;
  }

  if (reviewsQuery.isLoading) {
    return <View style={styles.center}><ActivityIndicator color={theme.primary} /></View>;
  }

  if (reviewsQuery.error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Reviews unavailable</Text>
        <Text style={styles.text}>{reviewsQuery.error instanceof Error ? reviewsQuery.error.message : 'Unable to load reviews.'}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader
        left={<Text style={styles.sectionBadge}>Admin</Text>}
        right={<Text style={styles.panelLabel}>Reviews</Text>}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Reviews Moderation</Text>
        <FlatList
          data={reviewsQuery.data || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.productName}</Text>
              <Text style={styles.meta}>{item.customerName}</Text>
              <Text style={styles.meta}>Rating: {'★'.repeat(item.rating)}{'·'.repeat(5 - item.rating)}</Text>
              <Text style={styles.comment}>{item.comment}</Text>
              <Text style={styles.meta}>Status: {item.status}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  disabled={updateStatusMutation.isPending || item.status === 'approved'}
                  onPress={() => updateStatusMutation.mutate({ reviewId: item.id, status: 'approved' })}
                  style={[styles.actionButton, item.status === 'approved' && styles.actionButtonActive]}
                >
                  <Text style={[styles.actionText, item.status === 'approved' && styles.actionTextActive]}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={updateStatusMutation.isPending || item.status === 'flagged'}
                  onPress={() => updateStatusMutation.mutate({ reviewId: item.id, status: 'flagged' })}
                  style={[styles.actionButton, item.status === 'flagged' && styles.actionButtonActive]}
                >
                  <Text style={[styles.actionText, item.status === 'flagged' && styles.actionTextActive]}>Flag</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { flex: 1, padding: 16 },
  title: { color: theme.text, fontSize: 28, fontWeight: '800', marginBottom: 12 },
  sectionBadge: { color: theme.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  panelLabel: { color: theme.text, fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  name: { color: theme.text, fontSize: 18, fontWeight: '700' },
  meta: { color: theme.mutedText, marginTop: 4, fontWeight: '600' },
  comment: { color: theme.text, marginTop: 8, lineHeight: 20 },
  actionRow: { flexDirection: 'row', marginTop: 12 },
  actionButton: { borderRadius: 10, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  actionButtonActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  actionText: { color: theme.text, fontSize: 12, fontWeight: '700' },
  actionTextActive: { color: '#fff' },
  text: { color: theme.mutedText, fontSize: 16 },
  listContent: { paddingBottom: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background, padding: 16 },
});
