import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@app/theme/tokens';
import type { CartLineItem } from '@features/cart/cartTypes';
import { cartLineImageUri } from '@features/cart/cartUtils';
import { isAllCartSelectedForCheckout } from '@features/cart/parseWebCartItems';
import { isSupportedRemoteImage } from '@features/categories/categoryImage';

import { CartCheckbox } from './CartCheckbox';

type Props = {
  visible: boolean;
  items: CartLineItem[];
  currency: string;
  cdnBase: string;
  onClose: () => void;
  onToggleItem: (lineKey: string) => void;
  onToggleAll: () => void;
  onRemoveSelected: () => void;
};

function ManageCartRow({
  row,
  currency,
  cdnBase,
  onToggle,
}: {
  row: CartLineItem;
  currency: string;
  cdnBase: string;
  onToggle: () => void;
}): React.ReactElement {
  const uri = cartLineImageUri(row.image, cdnBase);
  const showImg = !!uri && isSupportedRemoteImage(uri);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        backgroundColor: '#FFF',
      }}
    >
      <View style={{ paddingTop: 6 }}>
        <CartCheckbox checked={row.isSelected} onPress={onToggle} />
      </View>

      {showImg ? (
        <Image
          source={{ uri }}
          style={{ width: 70, height: 70, borderRadius: 8, marginLeft: 4 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 8,
            marginLeft: 4,
            backgroundColor: '#F3F4F6',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="image-outline" size={20} color="#9CA3AF" />
        </View>
      )}

      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text numberOfLines={2} style={{ fontSize: 13, fontWeight: '500', lineHeight: 18, color: '#111' }}>
          {row.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: colors.brand }}>
            {currency} {row.price.toFixed(2)}
          </Text>
          <View style={{ flex: 1 }} />
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.08)',
            }}
          >
            <Text style={{ fontSize: 11, color: '#111' }}>Qty {row.quantity}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function ManageCartSheet({
  visible,
  items,
  currency,
  cdnBase,
  onClose,
  onToggleItem,
  onToggleAll,
  onRemoveSelected,
}: Props): React.ReactElement {
  const allSelected = isAllCartSelectedForCheckout(items);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable
          style={{
            maxHeight: '85%',
            backgroundColor: '#FFF',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
          onPress={e => e.stopPropagation()}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            }}
          >
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: '#111' }}>Manage Cart</Text>
            <Pressable accessibilityRole="button" onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color="#111" />
            </Pressable>
          </View>

          <View style={{ height: 1, backgroundColor: '#EEEEEE' }} />

          <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
            {items.length === 0 ? (
              <Text style={{ textAlign: 'center', paddingVertical: 40, color: '#9CA3AF' }}>
                Your cart is empty
              </Text>
            ) : (
              items.map((row, index) => (
                <View key={row.lineKey} style={{ marginBottom: index < items.length - 1 ? 10 : 0 }}>
                  <ManageCartRow
                    row={row}
                    currency={currency}
                    cdnBase={cdnBase}
                    onToggle={() => onToggleItem(row.lineKey)}
                  />
                </View>
              ))
            )}
          </ScrollView>

          {items.length > 0 ? (
            <>
              <View style={{ height: 1, backgroundColor: '#EEEEEE' }} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                }}
              >
                <CartCheckbox checked={allSelected} onPress={onToggleAll} />
                <Text style={{ marginLeft: 4, fontSize: 14, color: '#111' }}>All</Text>
                <View style={{ flex: 1 }} />
                <Pressable
                  accessibilityRole="button"
                  onPress={onRemoveSelected}
                  style={{
                    paddingHorizontal: 22,
                    paddingVertical: 12,
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: colors.brand,
                  }}
                >
                  <Text style={{ color: colors.brand, fontSize: 14, fontWeight: '500' }}>Remove</Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
