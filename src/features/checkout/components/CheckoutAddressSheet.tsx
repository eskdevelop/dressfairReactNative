import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing } from '@app/theme/tokens';
import {
  deleteCustomerAddress,
  setDefaultCustomerAddress,
} from '@features/account/addressApi';
import type { CustomerAddressRecord, CustomerProfile } from '@features/account/types';
import type { RootStackParamList } from '@navigation/types';
import { AppDeleteDialog } from '@shared/ui/AppDeleteDialog';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  visible: boolean;
  profile: CustomerProfile | null;
  onClose: () => void;
  onRefreshProfile: () => Promise<void>;
  navigation: Nav;
};

export function CheckoutAddressSheet({
  visible,
  profile,
  onClose,
  onRefreshProfile,
  navigation,
}: Props): React.ReactElement {
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerAddressRecord | null>(null);

  const onSetDefault = useCallback(
    async (id: number) => {
      setBusyId(id);
      try {
        const res = await setDefaultCustomerAddress(id);
        if (res.success) await onRefreshProfile();
        else Alert.alert('', res.message ?? 'Could not set default address');
      } finally {
        setBusyId(null);
      }
    },
    [onRefreshProfile],
  );

  const onDelete = useCallback((addr: CustomerAddressRecord) => {
    setDeleteTarget(addr);
  }, []);

  const confirmDeleteAddress = useCallback(() => {
    const addr = deleteTarget;
    if (!addr) return;
    void (async () => {
      setBusyId(addr.id);
      try {
        const res = await deleteCustomerAddress(addr.id);
        if (res.success) {
          setDeleteTarget(null);
          await onRefreshProfile();
        } else {
          setDeleteTarget(null);
          Alert.alert('', res.message ?? 'Could not delete address');
        }
      } finally {
        setBusyId(null);
      }
    })();
  }, [deleteTarget, onRefreshProfile]);

  const onEdit = useCallback(
    (addr: CustomerAddressRecord) => {
      if (!profile) return;
      onClose();
      navigation.navigate('AddressForm', {
        mode: 'edit',
        profileMobile: profile.mobile,
        profileFirstname: profile.firstname,
        profileLastname: profile.lastname,
        address: addr,
      });
    },
    [navigation, onClose, profile],
  );

  const onAdd = useCallback(() => {
    if (!profile) return;
    onClose();
    navigation.navigate('AddressForm', {
      mode: 'add',
      profileMobile: profile.mobile,
      profileFirstname: profile.firstname,
      profileLastname: profile.lastname,
    });
  }, [navigation, onClose, profile]);

  const addresses = profile?.addresses ?? [];

  return (
    <>
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: '#FFF',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '85%',
            paddingBottom: spacing.lg,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: '#EEEEEE',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111' }}>Addresses</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              hitSlop={12}
              style={{ position: 'absolute', right: spacing.md }}
            >
              <Ionicons name="close" size={24} color="#111" />
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 420 }}>
            {addresses.map((addr, index) => {
              const isDefault = addr.isDefault === 1;
              const cityArea = [addr.cityName, addr.areaName].filter(Boolean).join('\n');
              return (
                <View key={addr.id}>
                  {index > 0 ? (
                    <View style={{ height: 1, backgroundColor: '#EEEEEE', marginHorizontal: spacing.md }} />
                  ) : null}
                  <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#111' }}>
                          {addr.address.split('\n')[0] || addr.address}
                        </Text>
                        {cityArea.length > 0 ? (
                          <Text style={{ fontSize: 13, color: '#111', marginTop: 4 }}>{cityArea}</Text>
                        ) : null}
                      </View>
                      {isDefault ? (
                        <Ionicons name="checkmark" size={22} color={colors.brand} />
                      ) : null}
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: spacing.sm,
                      }}
                    >
                      <Pressable
                        accessibilityRole="button"
                        disabled={busyId === addr.id || isDefault}
                        onPress={() => void onSetDefault(addr.id)}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                      >
                        <View
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            borderWidth: 2,
                            borderColor: isDefault ? colors.brand : '#9CA3AF',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isDefault ? (
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: colors.brand,
                              }}
                            />
                          ) : null}
                        </View>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>
                          {isDefault ? 'Default' : 'Set As Default'}
                        </Text>
                        {busyId === addr.id ? (
                          <ActivityIndicator size="small" color={colors.brand} />
                        ) : null}
                      </Pressable>
                      <View style={{ flexDirection: 'row', gap: 16 }}>
                        <Pressable accessibilityRole="button" onPress={() => onDelete(addr)}>
                          <Text style={{ fontSize: 12, color: '#6B7280' }}>Delete</Text>
                        </Pressable>
                        <Pressable accessibilityRole="button" onPress={() => onEdit(addr)}>
                          <Text style={{ fontSize: 12, color: '#6B7280' }}>Edit</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <Pressable
            accessibilityRole="button"
            onPress={onAdd}
            style={{
              marginHorizontal: spacing.md,
              marginTop: spacing.sm,
              backgroundColor: colors.brand,
              borderRadius: 24,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '600' }}>Add a new address</Text>
          </Pressable>
        </View>
      </View>
    </Modal>

    <AppDeleteDialog
      visible={deleteTarget !== null}
      message="Are you sure you want to delete this address?"
      confirmLabel="Delete address"
      loading={deleteTarget !== null && busyId === deleteTarget.id}
      onConfirm={confirmDeleteAddress}
      onCancel={() => (busyId === null ? setDeleteTarget(null) : undefined)}
    />
    </>
  );
}
