import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '@app/hooks';
import { colors, radii, spacing } from '@app/theme/tokens';
import {
  deleteCustomerAddress,
  setDefaultCustomerAddress,
} from '@features/account/addressApi';
import { fetchCustomerProfile } from '@features/account/customerApi';
import { openStorefrontLogin } from '@features/account/requireStorefrontLogin';
import type { CustomerAddressRecord, CustomerProfile } from '@features/account/types';
import type { RootStackParamList } from '@navigation/types';
import { AppButton } from '@shared/ui/AppButton';
import { AppDeleteDialog } from '@shared/ui/AppDeleteDialog';
import { crashReporter } from '@shared/observability/crash';

const MUTED_ACTION = 'rgba(0,0,0,0.5)';

export function AddressListScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const country = useAppSelector(s => s.app.country);
  const isAuthenticated = useAppSelector(s => s.app.isAuthenticated);

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchCustomerProfile();
      if (result.ok) setProfile(result.profile);
      else setProfile(null);
    } catch (e) {
      crashReporter.capture(e, { source: 'AddressListScreen.load' });
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSilent = useCallback(async () => {
    try {
      const result = await fetchCustomerProfile();
      if (result.ok) setProfile(result.profile);
      else setProfile(null);
    } catch (e) {
      crashReporter.capture(e, { source: 'AddressListScreen.refresh' });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadSilent();
    } finally {
      setRefreshing(false);
    }
  }, [loadSilent]);

  const onAdd = (): void => {
    if (!profile) {
      if (!isAuthenticated) {
        openStorefrontLogin(country);
        return;
      }
      Alert.alert(
        'Could not load profile',
        'Pull down to refresh or sign in again to add an address.',
      );
      return;
    }
    navigation.navigate('AddressForm', {
      mode: 'add',
      profileMobile: profile.mobile,
      profileFirstname: profile.firstname,
      profileLastname: profile.lastname,
    });
  };

  const onEdit = (addr: CustomerAddressRecord): void => {
    if (!profile) return;
    navigation.navigate('AddressForm', {
      mode: 'edit',
      profileMobile: profile.mobile,
      address: addr,
    });
  };

  /** Flutter `makeDefaultAddress`: no confirm dialog. */
  const applyDefault = (id: number): void => {
    if (busyId !== null) return;
    setBusyId(id);
    void (async () => {
      try {
        const r = await setDefaultCustomerAddress(id);
        if (!r.success) {
          Alert.alert('Could not update', r.message ?? 'Try again.');
          return;
        }
        await loadSilent();
      } finally {
        setBusyId(null);
      }
    })();
  };

  const onDefaultRowPress = (item: CustomerAddressRecord): void => {
    if (item.isDefault === 1) return;
    applyDefault(item.id);
  };

  const onDelete = (item: CustomerAddressRecord): void => {
    if (item.isDefault === 1) return;
    setDeleteTargetId(item.id);
  };

  const confirmDeleteAddress = (): void => {
    const id = deleteTargetId;
    if (id === null) return;
    setBusyId(id);
    void (async () => {
      try {
        const r = await deleteCustomerAddress(id);
        if (!r.success) {
          Alert.alert('Could not delete', r.message ?? 'Try again.');
          return;
        }
        setDeleteTargetId(null);
        await loadSilent();
      } finally {
        setBusyId(null);
      }
    })();
  };

  const renderAddr = ({ item }: { item: CustomerAddressRecord }) => (
    <View style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 4,
          paddingHorizontal: 8,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: `${colors.border}99`,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text
            style={{
              flex: 1,
              color: colors.textPrimary,
              fontWeight: '600',
              fontSize: 13,
              marginRight: 8,
            }}
            numberOfLines={3}
          >
            {item.address || '—'}
          </Text>
          {item.isDefault === 1 ? (
            <Ionicons name="checkmark" size={20} color={colors.brand} />
          ) : null}
        </View>
        <Text style={{ marginTop: 6, fontSize: 13, color: colors.textPrimary, fontWeight: '400' }}>
          {item.cityName ?? ''}
        </Text>
        <Text style={{ marginTop: 4, fontSize: 12, color: colors.textPrimary, fontWeight: '400' }}>
          {item.areaName ?? ''}
        </Text>
        <View style={{ height: 1, backgroundColor: colors.border, marginTop: 10 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => onDefaultRowPress(item)}
            disabled={busyId !== null}
            style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}
          >
            <MaterialIcons
              name={item.isDefault === 1 ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={18}
              color={item.isDefault === 1 ? colors.brand : colors.textMuted}
            />
            <Text style={{ marginLeft: 6, fontSize: 12, color: MUTED_ACTION }}>
              {item.isDefault === 1 ? 'Default' : 'Set As Default'}
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => onDelete(item)}
            disabled={busyId === item.id || item.isDefault === 1}
            style={{ opacity: item.isDefault === 1 ? 0.35 : 1 }}
          >
            <Text style={{ fontSize: 12, color: MUTED_ACTION }}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onEdit(item)}
            disabled={busyId === item.id}
            style={{ marginLeft: 12 }}
          >
            <Text style={{ fontSize: 12, color: MUTED_ACTION }}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: '#FFFFFF',
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            marginRight: 24,
            fontSize: 15,
            fontWeight: '500',
            color: colors.textPrimary,
          }}
        >
          All Address
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.pageMuted }}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.pageMuted }}>
          <FlatList
            data={profile?.addresses ?? []}
            keyExtractor={a => String(a.id)}
            renderItem={renderAddr}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: spacing.md }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
            }
            ListEmptyComponent={
              <View style={{ padding: spacing.lg }}>
                <Text
                  style={{ color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md }}
                >
                  No addresses yet.
                </Text>
              </View>
            }
            ListFooterComponent={
              <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: spacing.xl }}>
                <AppButton label="Add New Address" onPress={onAdd} />
              </View>
            }
          />
        </View>
      )}

      <AppDeleteDialog
        visible={deleteTargetId !== null}
        message="Are you sure you want to delete this address?"
        confirmLabel="Delete address"
        loading={busyId !== null}
        onConfirm={confirmDeleteAddress}
        onCancel={() => (busyId === null ? setDeleteTargetId(null) : undefined)}
      />
    </SafeAreaView>
  );
}
