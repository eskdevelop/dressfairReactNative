import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '@app/theme/tokens';
import {
  deleteCustomerAddress,
  setDefaultCustomerAddress,
} from '@features/account/addressApi';
import { fetchCustomerProfile } from '@features/account/customerApi';
import type { CustomerAddressRecord, CustomerProfile } from '@features/account/types';
import type { RootStackParamList } from '@navigation/types';
import { openWebPath } from '@navigation/navigationRef';
import { AppButton } from '@shared/ui/AppButton';
import { crashReporter } from '@shared/observability/crash';

export function AddressListScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

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

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onAdd = (): void => {
    if (!profile) {
      openWebPath('/');
      return;
    }
    navigation.navigate('AddressForm', {
      mode: 'add',
      profileMobile: profile.mobile,
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

  const onSetDefault = (id: number): void => {
    Alert.alert('Default address', 'Use this as your default delivery address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Set default',
        onPress: () => {
          setBusyId(id);
          void (async () => {
            try {
              const r = await setDefaultCustomerAddress(id);
              if (!r.success) {
                Alert.alert('Could not update', r.message ?? 'Try again.');
                return;
              }
              await load();
            } finally {
              setBusyId(null);
            }
          })();
        },
      },
    ]);
  };

  const onDelete = (id: number): void => {
    Alert.alert('Delete address', 'Remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setBusyId(id);
          void (async () => {
            try {
              const r = await deleteCustomerAddress(id);
              if (!r.success) {
                Alert.alert('Could not delete', r.message ?? 'Try again.');
                return;
              }
              await load();
            } finally {
              setBusyId(null);
            }
          })();
        },
      },
    ]);
  };

  const renderAddr = ({ item }: { item: CustomerAddressRecord }) => (
    <View
      style={{
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: spacing.sm,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={{ flex: 1, color: colors.textPrimary, fontWeight: '600' }}>
          {[item.cityName, item.areaName].filter(Boolean).join(' · ') || 'Address'}
        </Text>
        {item.isDefault === 1 ? (
          <View
            style={{
              paddingHorizontal: spacing.sm,
              paddingVertical: 2,
              borderRadius: radii.pill,
              backgroundColor: `${colors.brand}22`,
            }}
          >
            <Text style={{ color: colors.brand, fontSize: 11, fontWeight: '700' }}>Default</Text>
          </View>
        ) : null}
      </View>
      <Text style={{ color: colors.textMuted }}>{item.address}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {item.isDefault !== 1 ? (
          <TouchableOpacity onPress={() => onSetDefault(item.id)} disabled={busyId === item.id}>
            <Text style={{ color: colors.brand, fontWeight: '600' }}>Set default</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={() => onEdit(item)} disabled={busyId === item.id}>
          <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} disabled={busyId === item.id}>
          <Text style={{ color: colors.danger, fontWeight: '600' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
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
            fontSize: 17,
            fontWeight: '600',
            color: colors.textPrimary,
          }}
        >
          Addresses
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={profile?.addresses ?? []}
          keyExtractor={a => String(a.id)}
          renderItem={renderAddr}
          ListEmptyComponent={
            <View style={{ padding: spacing.lg }}>
              <Text style={{ color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md }}>
                No addresses yet.
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={{ padding: spacing.lg }}>
              <AppButton label="Add address" onPress={onAdd} />
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
