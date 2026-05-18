import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '@app/theme/tokens';
import { useAppSelector } from '@app/hooks';
import {
  fetchStoreAreas,
  fetchStoreCities,
  saveCustomerAddress,
  setDefaultCustomerAddress,
  updateCustomerAddress,
} from '@features/account/addressApi';
import { fetchCustomerProfile } from '@features/account/customerApi';
import type {
  CustomerAddressRecord,
  StoreAreaRecord,
  StoreCityRecord,
} from '@features/account/types';
import type { RootStackParamList } from '@navigation/types';
import { AppButton } from '@shared/ui/AppButton';
import { crashReporter } from '@shared/observability/crash';

const PROVINCE_PLACEHOLDER = '__province_none__';
const AREA_PLACEHOLDER = '__area_none__';
const SAFEGUARD_SUBTITLE = 'All Data is Safeguarded';
const SAFEGUARD_BANNER = 'All Data Is Safeguard';
const FREE_SHIPPING_PROMO = 'Free shipping applied on eligible orders';

async function resolveNewAddressIdAfterSave(
  savedId: number | undefined,
  addressLine: string,
  cityId: number,
  areaId: number,
): Promise<number | undefined> {
  if (savedId !== undefined && savedId > 0) return savedId;
  const prof = await fetchCustomerProfile();
  if (!prof.ok) return undefined;
  const t = addressLine.trim();
  const matches = prof.profile.addresses.filter(
    a =>
      a.address.trim() === t && a.cityId === cityId && a.cityAreaId === areaId,
  );
  if (matches.length === 0) return undefined;
  return matches.reduce((max, a) => (a.id > max ? a.id : max), matches[0].id);
}

export function AddressFormScreen() {
  const insets = useSafeAreaInsets();
  const storeOpenCartCountryId = useAppSelector(s => s.app.storeOpenCartCountryId);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddressForm'>>();
  const { mode, profileMobile, profileFirstname, profileLastname, address } =
    route.params;

  const isEdit = mode === 'edit';

  const [line1, setLine1] = useState('');
  const [cities, setCities] = useState<StoreCityRecord[]>([]);
  const [areas, setAreas] = useState<StoreAreaRecord[]>([]);
  const [city, setCity] = useState<StoreCityRecord | null>(null);
  const [area, setArea] = useState<StoreAreaRecord | null>(null);
  const [loadingBoot, setLoadingBoot] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [makeDefaultAfterSave, setMakeDefaultAfterSave] = useState(false);
  const [provincesFetchFailed, setProvincesFetchFailed] = useState(false);

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

  const retryLoadProvinces = useCallback(async () => {
    setCitiesLoading(true);
    setProvincesFetchFailed(false);
    try {
      const c = await fetchStoreCities();
      setCities(c);
      if (isEdit && address) {
        await hydrateEdit(address, c);
      } else {
        // Flutter `getCities`: reset province/city when list refreshes; add form starts empty.
        setCity(null);
        setArea(null);
        setAreas([]);
      }
    } catch (e) {
      crashReporter.capture(e, { source: 'AddressFormScreen.retryProvinces' });
      setCities([]);
      setProvincesFetchFailed(true);
    } finally {
      setCitiesLoading(false);
    }
  }, [address, hydrateEdit, isEdit]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadingBoot(true);
      try {
        const c = await fetchStoreCities();
        if (cancelled) return;
        setCities(c);
        setProvincesFetchFailed(false);
        if (isEdit && address) {
          await hydrateEdit(address, c);
        } else {
          setCity(null);
          setArea(null);
          setAreas([]);
        }
      } catch (e) {
        crashReporter.capture(e, { source: 'AddressFormScreen.boot' });
        if (!cancelled) {
          setCities([]);
          setProvincesFetchFailed(true);
        }
      } finally {
        if (!cancelled) setLoadingBoot(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, hydrateEdit, isEdit, storeOpenCartCountryId]);

  /** Add form: always start empty (Flutter `AddNewAddress` / no `selectedCity` until user picks). */
  useEffect(() => {
    if (!isEdit) {
      setLine1('');
      setCity(null);
      setArea(null);
      setAreas([]);
      setMakeDefaultAfterSave(false);
    }
  }, [isEdit, address?.id]);

  const retryLoadAreas = useCallback(async (): Promise<void> => {
    if (!city) return;
    setLoadingAreas(true);
    try {
      const a = await fetchStoreAreas(city.id);
      setAreas(a);
    } catch (e) {
      crashReporter.capture(e, { source: 'AddressFormScreen.retryAreas' });
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  }, [city]);

  const onPickCity = async (picked: StoreCityRecord): Promise<void> => {
    setCity(picked);
    setArea(null);
    setLoadingAreas(true);
    try {
      const a = await fetchStoreAreas(picked.id);
      setAreas(a);
    } catch (e) {
      crashReporter.capture(e, { source: 'AddressFormScreen.areas' });
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  };

  const submit = async (): Promise<void> => {
    if (line1.trim().length === 0) {
      Alert.alert('Address required', 'Please enter your address.');
      return;
    }
    if (!city) {
      Alert.alert('Province required', 'Please select a province.');
      return;
    }
    if (!area) {
      Alert.alert('City required', 'Please select a city or area.');
      return;
    }

    const mobile = (profileMobile ?? '').trim();
    const first = (profileFirstname ?? '').trim() || 'Customer';
    const last = (profileLastname ?? '').trim();
    if (!isEdit && mobile.length === 0) {
      Alert.alert('Mobile required', 'Your profile is missing a mobile number.');
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
        if (makeDefaultAfterSave && address.isDefault !== 1) {
          const def = await setDefaultCustomerAddress(address.id);
          if (!def.success) {
            Alert.alert('Could not set default', def.message ?? 'Try again.');
            return;
          }
        }
      } else {
        const result = await saveCustomerAddress({
          mobile,
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
        if (makeDefaultAfterSave) {
          const newId = await resolveNewAddressIdAfterSave(
            result.customerAddressId,
            line1.trim(),
            city.id,
            area.id,
          );
          if (newId === undefined) {
            Alert.alert(
              'Saved',
              'Address was saved but could not be set as default automatically. You can set it from your address list.',
              [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
            return;
          }
          const def = await setDefaultCustomerAddress(newId);
          if (!def.success) {
            Alert.alert('Could not set default', def.message ?? 'Try again.');
            return;
          }
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

  /** Bordered shell shared by picker rows + inline messages (non-picker may clip). */
  const pickerShellStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF' as const,
    overflow: 'hidden' as const,
  };

  /** Picker row: avoid `overflow: 'hidden'` so Android Spinner text is not vertically clipped. */
  const pickerFieldShell = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF' as const,
  };

  /** Single-line row for Material dropdowns; street field stays slightly larger for readability. */
  const compactRowHeight = 48;
  const compactFontSize = 15;
  /** Smaller type in native pickers (selected + list items on Android). */
  const pickerFontSize = 13;

  const pickerCompactAndroid = {
    color: colors.textPrimary,
    fontSize: pickerFontSize,
    paddingVertical: 0,
  };

  const pickerCompactIos = {
    marginVertical: -4,
    color: colors.textPrimary,
    fontSize: pickerFontSize,
  };

  if (loadingBoot) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center' }} edges={['top']}>
        <ActivityIndicator color={colors.brand} />
      </SafeAreaView>
    );
  }

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
          style={{ width: 40 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              color: colors.textPrimary,
            }}
          >
            {isEdit ? 'Edit Address' : 'Add Address'}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 4,
            }}
          >
            <Ionicons name="lock-closed" size={12} color={colors.success} />
            <Text style={{ fontSize: 10, color: colors.success, marginLeft: 4 }}>
              {SAFEGUARD_SUBTITLE}
            </Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: spacing.xl,
          }}
        >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: spacing.sm,
                paddingVertical: 6,
                borderRadius: radii.sm,
                backgroundColor: '#ECFDF5',
                marginBottom: spacing.sm,
              }}
            >
              <Ionicons name="lock-closed" size={16} color={colors.success} />
              <Text
                style={{
                  flex: 1,
                  marginLeft: 6,
                  fontSize: 12,
                  color: colors.success,
                }}
              >
                {SAFEGUARD_BANNER}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.sm,
                backgroundColor: '#FFF7ED',
                marginBottom: spacing.lg,
              }}
            >
              <Ionicons name="checkmark" size={14} color={colors.success} />
              <Text
                style={{
                  flex: 1,
                  marginLeft: 4,
                  fontSize: 10,
                  color: colors.orderRowIconMuted,
                  fontWeight: '400',
                }}
              >
                {FREE_SHIPPING_PROMO}
              </Text>
            </View>

            <View style={{ marginBottom: spacing.md }}>
              <Text
                style={{ color: colors.textMuted, marginBottom: 6, fontSize: 12, fontWeight: '600' }}
              >
                Province
              </Text>
              {citiesLoading ? (
                <View
                  style={[pickerShellStyle, { height: compactRowHeight, justifyContent: 'center' }]}
                >
                  <ActivityIndicator color={colors.brand} size="small" />
                </View>
              ) : provincesFetchFailed || cities.length === 0 ? (
                <View style={[pickerShellStyle, { padding: spacing.md, alignItems: 'center' }]}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: colors.textMuted,
                      marginBottom: spacing.sm,
                    }}
                  >
                    {provincesFetchFailed
                      ? 'Could not load provinces. Check your connection and try again.'
                      : 'No provinces available for this region.'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => void retryLoadProvinces()}
                    accessibilityRole="button"
                  >
                    <Text style={{ color: colors.brand, fontWeight: '600' }}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={[
                    pickerFieldShell,
                    {
                      minHeight: compactRowHeight,
                      justifyContent: 'center',
                    },
                  ]}
                >
                  <Picker
                    key={`province-${isEdit ? address?.id ?? 0 : 'add'}-${cities.length}`}
                    selectedValue={city ? String(city.id) : PROVINCE_PLACEHOLDER}
                    onValueChange={val => {
                      const key = String(val);
                      if (key === PROVINCE_PLACEHOLDER) return;
                      const id = Number(val);
                      const picked = cities.find(c => c.id === id);
                      if (picked) void onPickCity(picked);
                    }}
                    {...(Platform.OS === 'android' ? { mode: 'dropdown' as const } : {})}
                    dropdownIconColor={colors.textMuted}
                    style={Platform.OS === 'android' ? pickerCompactAndroid : pickerCompactIos}
                    itemStyle={
                      Platform.OS === 'ios'
                        ? { height: 38, fontSize: pickerFontSize }
                        : undefined
                    }
                  >
                    <Picker.Item
                      label="Select Province"
                      value={PROVINCE_PLACEHOLDER}
                      color={colors.textMuted}
                      style={Platform.OS === 'android' ? { fontSize: pickerFontSize } : undefined}
                    />
                    {cities.map(c => (
                      <Picker.Item
                        key={c.id}
                        label={c.name}
                        value={String(c.id)}
                        style={Platform.OS === 'android' ? { fontSize: pickerFontSize } : undefined}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

            {city ? (
            <View style={{ marginBottom: spacing.md }}>
              <Text
                style={{ color: colors.textMuted, marginBottom: 6, fontSize: 12, fontWeight: '600' }}
              >
                City
              </Text>
              {loadingAreas && areas.length === 0 ? (
                <View
                  style={[
                    pickerShellStyle,
                    { height: compactRowHeight, justifyContent: 'center', alignItems: 'center' },
                  ]}
                >
                  <ActivityIndicator color={colors.brand} size="small" />
                </View>
              ) : areas.length === 0 ? (
                <View style={[pickerShellStyle, { padding: spacing.md, alignItems: 'center' }]}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: colors.textMuted,
                      marginBottom: spacing.sm,
                    }}
                  >
                    No cities or areas loaded. Check your connection or try again.
                  </Text>
                  <TouchableOpacity
                    onPress={() => void retryLoadAreas()}
                    accessibilityRole="button"
                  >
                    <Text style={{ color: colors.brand, fontWeight: '600' }}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={[
                    pickerFieldShell,
                    {
                      minHeight: compactRowHeight,
                      justifyContent: 'center',
                    },
                  ]}
                >
                  <Picker
                    key={`area-${city.id}-${areas.length}`}
                    selectedValue={area ? String(area.id) : AREA_PLACEHOLDER}
                    onValueChange={val => {
                      const key = String(val);
                      if (key === AREA_PLACEHOLDER) return;
                      const id = Number(val);
                      const pickedArea = areas.find(a => a.id === id);
                      if (pickedArea) setArea(pickedArea);
                    }}
                    {...(Platform.OS === 'android' ? { mode: 'dropdown' as const } : {})}
                    dropdownIconColor={colors.textMuted}
                    style={Platform.OS === 'android' ? pickerCompactAndroid : pickerCompactIos}
                    itemStyle={
                      Platform.OS === 'ios'
                        ? { height: 38, fontSize: pickerFontSize }
                        : undefined
                    }
                  >
                    <Picker.Item
                      label="Select City Or Area"
                      value={AREA_PLACEHOLDER}
                      color={colors.textMuted}
                      style={Platform.OS === 'android' ? { fontSize: pickerFontSize } : undefined}
                    />
                    {areas.map(a => (
                      <Picker.Item
                        key={a.id}
                        label={a.name}
                        value={String(a.id)}
                        style={Platform.OS === 'android' ? { fontSize: pickerFontSize } : undefined}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>
            ) : null}

            <View style={{ marginBottom: spacing.md }}>
              <Text
                style={{ color: colors.textMuted, marginBottom: 6, fontSize: 12, fontWeight: '600' }}
              >
                Build Street And Area
              </Text>
              <TextInput
                value={line1}
                onChangeText={setLine1}
                placeholder="Enter Full Address"
                placeholderTextColor={colors.textMuted}
                multiline
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radii.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: 10,
                  fontSize: compactFontSize,
                  minHeight: 52,
                  textAlignVertical: 'top',
                  color: colors.textPrimary,
                  backgroundColor: '#FFFFFF',
                }}
              />
            </View>

            {isEdit && address && address.isDefault === 1 ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: spacing.md,
                }}
              >
                <Ionicons name="checkbox" size={22} color={colors.brand} />
                <Text style={{ marginLeft: 8, fontSize: 14, color: colors.textPrimary }}>
                  Default address
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                accessibilityRole="checkbox"
                accessibilityState={{ checked: makeDefaultAfterSave }}
                onPress={() => setMakeDefaultAfterSave(v => !v)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: spacing.md,
                }}
              >
                <Ionicons
                  name={makeDefaultAfterSave ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={makeDefaultAfterSave ? colors.brand : colors.textMuted}
                />
                <Text style={{ marginLeft: 8, fontSize: 14, color: colors.textPrimary }}>
                  Set As Default
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.sm,
            paddingBottom: Math.max(insets.bottom, spacing.md),
          }}
        >
          <AppButton
            label="Save And Use"
            onPress={() => void submit()}
            loading={saving}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
