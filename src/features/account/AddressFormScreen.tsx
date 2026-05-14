import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '@app/theme/tokens';
import {
  fetchStoreAreas,
  fetchStoreCities,
  saveCustomerAddress,
  updateCustomerAddress,
} from '@features/account/addressApi';
import type {
  CustomerAddressRecord,
  StoreAreaRecord,
  StoreCityRecord,
} from '@features/account/types';
import type { RootStackParamList } from '@navigation/types';
import { AppButton } from '@shared/ui/AppButton';
import { crashReporter } from '@shared/observability/crash';

export function AddressFormScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddressForm'>>();
  const { mode, profileMobile, address } = route.params;

  const isEdit = mode === 'edit';

  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState(profileMobile ?? '');
  const [line1, setLine1] = useState('');
  const [cities, setCities] = useState<StoreCityRecord[]>([]);
  const [areas, setAreas] = useState<StoreAreaRecord[]>([]);
  const [city, setCity] = useState<StoreCityRecord | null>(null);
  const [area, setArea] = useState<StoreAreaRecord | null>(null);
  const [cityOpen, setCityOpen] = useState(false);
  const [areaOpen, setAreaOpen] = useState(false);
  const [loadingBoot, setLoadingBoot] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [saving, setSaving] = useState(false);

  const hydrateEdit = useCallback(
    async (addr: CustomerAddressRecord, loadedCities: StoreCityRecord[]) => {
      setLine1(addr.address);
      try {
        const matchCity =
          loadedCities.find(x => x.id === addr.cityId) ?? null;
        setCity(matchCity);
        if (matchCity) {
          const a = await fetchStoreAreas(matchCity.id);
          setAreas(a);
          setArea(a.find(x => x.id === addr.cityAreaId) ?? null);
        }
      } catch (e) {
        crashReporter.capture(e, { source: 'AddressFormScreen.hydrateEdit' });
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadingBoot(true);
      try {
        const c = await fetchStoreCities();
        if (cancelled) return;
        setCities(c);
        if (isEdit && address) {
          await hydrateEdit(address, c);
        }
      } catch (e) {
        crashReporter.capture(e, { source: 'AddressFormScreen.boot' });
        Alert.alert('Error', 'Could not load regions. Please try again.');
      } finally {
        if (!cancelled) setLoadingBoot(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, hydrateEdit, isEdit]);

  const onPickCity = async (picked: StoreCityRecord): Promise<void> => {
    setCity(picked);
    setArea(null);
    setCityOpen(false);
    setLoadingAreas(true);
    try {
      const a = await fetchStoreAreas(picked.id);
      setAreas(a);
    } catch (e) {
      crashReporter.capture(e, { source: 'AddressFormScreen.areas' });
      Alert.alert('Error', 'Could not load areas for this city.');
    } finally {
      setLoadingAreas(false);
    }
  };

  const submit = async (): Promise<void> => {
    const nameTrim = fullname.trim();
    if (!isEdit && nameTrim.length === 0) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    if (phone.trim().length === 0) {
      Alert.alert('Mobile required', 'Please enter your mobile number.');
      return;
    }
    if (line1.trim().length === 0) {
      Alert.alert('Address required', 'Please enter your address.');
      return;
    }
    if (!city) {
      Alert.alert('City required', 'Please choose a city.');
      return;
    }
    if (!area) {
      Alert.alert('Area required', 'Please choose an area.');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && address) {
        const result = await updateCustomerAddress({
          customer_address_id: address.id,
          address: line1.trim(),
          state_province_id: city.id,
          city_area_id: area.id,
        });
        if (!result.success) {
          Alert.alert('Update failed', result.message ?? 'Try again.');
          return;
        }
      } else {
        const parts = nameTrim.split(/\s+/);
        const first = parts.shift() ?? nameTrim;
        const last = parts.join(' ');
        const result = await saveCustomerAddress({
          mobile: phone.trim(),
          firstname: first,
          lastname: last,
          address: line1.trim(),
          state_province_id: city.id,
          city_area_id: area.id,
        });
        if (!result.success) {
          Alert.alert('Save failed', result.message ?? 'Try again.');
          return;
        }
      }
      navigation.goBack();
    } catch (e) {
      crashReporter.capture(e, { source: 'AddressFormScreen.submit' });
      Alert.alert('Error', 'Could not save address.');
    } finally {
      setSaving(false);
    }
  };

  const pickerModal = (
    visible: boolean,
    title: string,
    onClose: () => void,
    data: { id: number; name: string }[],
    kind: 'city' | 'area',
  ): React.ReactElement => (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity onPress={onClose} accessibilityRole="button">
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ flex: 1, textAlign: 'center', fontWeight: '600', marginRight: 24 }}>
            {title}
          </Text>
        </View>
        <FlatList
          data={data}
          keyExtractor={r => String(r.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                padding: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
              onPress={() =>
                kind === 'city'
                  ? void onPickCity(item as StoreCityRecord)
                  : (setArea(item as StoreAreaRecord), setAreaOpen(false))
              }
            >
              <Text style={{ color: colors.textPrimary }}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );

  if (loadingBoot) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center' }} edges={['top']}>
        <ActivityIndicator color={colors.brand} />
      </SafeAreaView>
    );
  }

  const selectRow = (
    label: string,
    value: string,
    onPress: () => void,
    disabled?: boolean,
  ): React.ReactElement => (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={{ color: colors.textMuted, marginBottom: 6, fontSize: 12, fontWeight: '600' }}>
        {label}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm + 4,
          backgroundColor: '#FFFFFF',
          flexDirection: 'row',
          justifyContent: 'space-between',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text style={{ color: value ? colors.textPrimary : colors.textMuted }} numberOfLines={1}>
          {value || `Choose ${label.toLowerCase()}`}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </TouchableOpacity>
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
          {isEdit ? 'Edit address' : 'Add address'}
        </Text>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.lg }}>
            {!isEdit ? (
              <View style={{ marginBottom: spacing.md }}>
                <Text
                  style={{ color: colors.textMuted, marginBottom: 6, fontSize: 12, fontWeight: '600' }}
                >
                  Full name
                </Text>
                <TextInput
                  value={fullname}
                  onChangeText={setFullname}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radii.md,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    fontSize: 16,
                    color: colors.textPrimary,
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </View>
            ) : null}

            <View style={{ marginBottom: spacing.md }}>
              <Text
                style={{ color: colors.textMuted, marginBottom: 6, fontSize: 12, fontWeight: '600' }}
              >
                Mobile
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radii.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  fontSize: 16,
                  color: colors.textPrimary,
                  backgroundColor: '#FFFFFF',
                }}
              />
            </View>

            <View style={{ marginBottom: spacing.md }}>
              <Text
                style={{ color: colors.textMuted, marginBottom: 6, fontSize: 12, fontWeight: '600' }}
              >
                Street address
              </Text>
              <TextInput
                value={line1}
                onChangeText={setLine1}
                multiline
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radii.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  fontSize: 16,
                  minHeight: 80,
                  textAlignVertical: 'top',
                  color: colors.textPrimary,
                  backgroundColor: '#FFFFFF',
                }}
              />
            </View>

            {selectRow('City / emirate', city?.name ?? '', () => setCityOpen(true))}
            {selectRow(
              'Area',
              area?.name ?? '',
              () => {
                if (!city) {
                  Alert.alert('City first', 'Please choose a city.');
                  return;
                }
                if (areas.length === 0 && !loadingAreas) {
                  void onPickCity(city);
                }
                setAreaOpen(true);
              },
              !city,
            )}

            {loadingAreas ? (
              <ActivityIndicator style={{ marginBottom: spacing.md }} color={colors.brand} />
            ) : null}

            <AppButton label={isEdit ? 'Save changes' : 'Save address'} onPress={() => void submit()} loading={saving} />
          </ScrollView>

      {pickerModal(cityOpen, 'Select city', () => setCityOpen(false), cities, 'city')}
      {pickerModal(areaOpen, 'Select area', () => setAreaOpen(false), areas, 'area')}
    </SafeAreaView>
  );
}
