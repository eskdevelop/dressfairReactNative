import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '@app/theme/tokens';
import { useAppSelector } from '@app/hooks';
import {
  fetchStoreAreas,
  fetchStoreCities,
  saveCustomerAddress,
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
import { InlineFormSelectField } from '@shared/ui/InlineFormSelectField';
import { crashReporter } from '@shared/observability/crash';

const PROVINCE_PLACEHOLDER = '__province_none__';
const AREA_PLACEHOLDER = '__area_none__';
const SAFEGUARD_SUBTITLE = 'All Data is Safeguarded';
const SAFEGUARD_BANNER = 'All Data Is Safeguard';
const FREE_SHIPPING_PROMO = 'Free shipping applied on eligible orders';

/**
 * Android Spinner (RN Picker) crashes if `selectedValue` is not among `Picker.Item` values.
 * Compute province/area lists first, then apply `setCities` + `setCity` + `setAreas` + `setArea` together.
 */
async function loadEditAddressFormState(
  addr: CustomerAddressRecord,
  loadedCities: StoreCityRecord[],
): Promise<{
  line1: string;
  city: StoreCityRecord | null;
  areas: StoreAreaRecord[];
  area: StoreAreaRecord | null;
}> {
  const matchCity = loadedCities.find(x => x.id === addr.cityId) ?? null;
  if (!matchCity) {
    return { line1: addr.address, city: null, areas: [], area: null };
  }
  try {
    const list = await fetchStoreAreas(matchCity.id);
    return {
      line1: addr.address,
      city: matchCity,
      areas: list,
      area: list.find(x => x.id === addr.cityAreaId) ?? null,
    };
  } catch (e) {
    crashReporter.capture(e, { source: 'AddressFormScreen.loadEditAddressFormState' });
    return { line1: addr.address, city: matchCity, areas: [], area: null };
  }
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
  const [resolvedMobile, setResolvedMobile] = useState(() => (profileMobile ?? '').trim());
  const [cities, setCities] = useState<StoreCityRecord[]>([]);
  const [areas, setAreas] = useState<StoreAreaRecord[]>([]);
  const [city, setCity] = useState<StoreCityRecord | null>(null);
  const [area, setArea] = useState<StoreAreaRecord | null>(null);
  const [loadingBoot, setLoadingBoot] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [provincesFetchFailed, setProvincesFetchFailed] = useState(false);

  const retryLoadProvinces = useCallback(async () => {
    setCitiesLoading(true);
    setProvincesFetchFailed(false);
    try {
      const c = await fetchStoreCities();
      if (isEdit && address) {
        const next = await loadEditAddressFormState(address, c);
        // Apply cities + edit fields in one React pass so the Picker never sees a stale city id.
        setCities(c);
        setLine1(next.line1);
        setCity(next.city);
        setAreas(next.areas);
        setArea(next.area);
      } else {
        setCities(c);
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
  }, [address, isEdit]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadingBoot(true);
      try {
        const c = await fetchStoreCities();
        if (cancelled) return;
        setProvincesFetchFailed(false);
        if (isEdit && address) {
          const next = await loadEditAddressFormState(address, c);
          if (cancelled) return;
          setCities(c);
          setLine1(next.line1);
          setCity(next.city);
          setAreas(next.areas);
          setArea(next.area);
        } else {
          setCities(c);
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
  }, [address, isEdit, storeOpenCartCountryId]);

  /** Clear province/area state when the loaded province list no longer contains the selection. */
  useEffect(() => {
    if (!city) return;
    if (!cities.some(x => x.id === city.id)) {
      setCity(null);
      setAreas([]);
      setArea(null);
    }
  }, [cities, city]);

  /** Clear area when the area list no longer contains the selection (e.g. retry failed). */
  useEffect(() => {
    if (!area) return;
    if (!areas.some(x => x.id === area.id)) {
      setArea(null);
    }
  }, [area, areas]);

  const provincePickerSelectedValue = useMemo((): string => {
    if (!city) return PROVINCE_PLACEHOLDER;
    if (!cities.some(c => c.id === city.id)) return PROVINCE_PLACEHOLDER;
    return String(city.id);
  }, [city, cities]);

  const areaPickerSelectedValue = useMemo((): string => {
    if (!area) return AREA_PLACEHOLDER;
    if (!areas.some(a => a.id === area.id)) return AREA_PLACEHOLDER;
    return String(area.id);
  }, [area, areas]);

  /** Add form: always start empty (Flutter `AddNewAddress` / no `selectedCity` until user picks). */
  useEffect(() => {
    if (!isEdit) {
      setLine1('');
      setCity(null);
      setArea(null);
      setAreas([]);
    }
  }, [isEdit, address?.id]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void fetchCustomerProfile().then(res => {
        if (cancelled || !res.ok || !res.profile) return;
        setResolvedMobile(res.profile.mobile.trim());
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const navigateToProfileEdit = useCallback(async (): Promise<void> => {
    try {
      const res = await fetchCustomerProfile();
      if (res.ok && res.profile) {
        navigation.navigate('ProfileEdit', { profile: res.profile });
        return;
      }
    } catch (e) {
      crashReporter.capture(e, { source: 'AddressFormScreen.navigateToProfileEdit' });
    }
    Alert.alert('Profile unavailable', 'Could not open profile. Please try again.');
  }, [navigation]);

  const retryLoadAreas = useCallback(async (): Promise<void> => {
    if (!city) return;
    setLoadingAreas(true);
    try {
      const a = await fetchStoreAreas(city.id);
      setAreas(a);
    } catch (e) {
      crashReporter.capture(e, { source: 'AddressFormScreen.retryAreas' });
      setAreas([]);
      setArea(null);
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

    const first = (profileFirstname ?? '').trim() || 'Customer';
    const last = (profileLastname ?? '').trim();
    const mobile = resolvedMobile.trim();

    if (!isEdit && mobile.length === 0) {
      Alert.alert(
        'Mobile required',
        'Please add your WhatsApp number in Profile before saving an address.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Edit profile', onPress: () => void navigateToProfileEdit() },
        ],
      );
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
      }
      navigation.goBack();
    } catch (e) {
      crashReporter.capture(e, { source: 'AddressFormScreen.submit' });
      Alert.alert('Error', 'Could not save address.');
    } finally {
      setSaving(false);
    }
  };

  /** Bordered shell for loading / error states. */
  const pickerShellStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF' as const,
    overflow: 'hidden' as const,
  };

  const compactRowHeight = 48;
  const compactFontSize = 15;
  const selectFontSize = 13;

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
                <InlineFormSelectField
                  placeholder="Select Province"
                  selectedValue={provincePickerSelectedValue}
                  options={cities.map(c => ({
                    label: c.name,
                    value: String(c.id),
                  }))}
                  onValueChange={val => {
                    if (val === PROVINCE_PLACEHOLDER) return;
                    const id = Number(val);
                    const picked = cities.find(c => c.id === id);
                    if (picked) void onPickCity(picked);
                  }}
                  minHeight={compactRowHeight}
                  fontSize={selectFontSize}
                />
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
                <InlineFormSelectField
                  placeholder="Select City Or Area"
                  selectedValue={areaPickerSelectedValue}
                  options={areas.map(a => ({
                    label: a.name,
                    value: String(a.id),
                  }))}
                  onValueChange={val => {
                    if (val === AREA_PLACEHOLDER) return;
                    const id = Number(val);
                    const pickedArea = areas.find(a => a.id === id);
                    if (pickedArea) setArea(pickedArea);
                  }}
                  minHeight={compactRowHeight}
                  fontSize={selectFontSize}
                />
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
            ) : null}
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
