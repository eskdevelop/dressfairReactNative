import React, { type ComponentProps } from 'react';
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CATEGORY_COLOR_OPTIONS,
  CATEGORY_INLINE_COLOR_OPTIONS,
  CATEGORY_SIZE_OPTIONS,
  colorSwatchHex,
} from '../categoryFilterOptions';
import { SORT_MENU_OPTIONS, labelForStoredSort, type SortChoice } from '../categorySort';

type IonName = ComponentProps<typeof Ionicons>['name'];
export type FilterPanelKind = 'none' | 'sort' | 'color' | 'size' | 'all';

type Props = {
  sortChoice: SortChoice;
  selectedColor: string | null;
  selectedSize: string | null;
  openPanel: FilterPanelKind;
  onOpenPanel: (panel: FilterPanelKind) => void;
  onSortChange: (choice: SortChoice) => void;
  onColorChange: (color: string | null) => void;
  onSizeChange: (size: string | null) => void;
  onResetAll: () => void;
};

function FilterChip({
  label,
  icon,
  showChevron,
  active,
  onPress,
}: {
  label: string;
  icon?: IonName;
  showChevron?: boolean;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: active ? '#E5E7EB' : '#F3F4F6',
        }}
      >
        {icon ? <Ionicons name={icon} size={16} color="#111" /> : null}
        <Text style={{ fontSize: 11, color: '#111', fontWeight: active ? '600' : '400' }}>{label}</Text>
        {showChevron ? <Ionicons name="chevron-down" size={14} color="#111" /> : null}
      </View>
    </Pressable>
  );
}

function ResetPill({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: '#111',
          backgroundColor: '#FFF',
        }}
      >
        <Text style={{ fontSize: 12, color: '#111', fontWeight: '500' }}>Reset</Text>
      </View>
    </Pressable>
  );
}

function ColorSwatch({
  name,
  selected,
  onPress,
  size = 30,
  compact = false,
}: {
  name: string;
  selected: boolean;
  onPress: () => void;
  size?: number;
  compact?: boolean;
}) {
  const hex = colorSwatchHex(name);
  const isWhite = name.toLowerCase() === 'white';
  const cellW = compact ? size + 10 : size + 8;

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={name} onPress={onPress} style={{ alignItems: 'center', width: cellW }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: hex,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? '#111' : isWhite ? '#D1D5DB' : hex,
        }}
      />
      <Text
        style={{ fontSize: compact ? 9 : 10, color: '#374151', marginTop: compact ? 4 : 5, textAlign: 'center' }}
        numberOfLines={1}
      >
        {name}
      </Text>
    </Pressable>
  );
}

function SizePill({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: selected ? '#111' : '#D1D5DB',
          backgroundColor: selected ? '#F3F4F6' : '#FFF',
        }}
      >
        <Text style={{ fontSize: 12, color: '#374151' }}>{label}</Text>
      </View>
    </Pressable>
  );
}

function SortList({
  sortChoice,
  onPick,
}: {
  sortChoice: SortChoice;
  onPick: (opt: (typeof SORT_MENU_OPTIONS)[number]) => void;
}) {
  return (
    <View style={{ paddingVertical: 4 }}>
      {SORT_MENU_OPTIONS.map(opt => {
        const isClear = opt === 'Clear';
        const isActive = !isClear && sortChoice === opt;
        return (
          <Pressable
            key={opt}
            accessibilityRole="button"
            onPress={() => onPick(opt)}
            style={{ paddingHorizontal: 16, paddingVertical: 10 }}
          >
            <Text
              style={{
                fontSize: 13,
                color: isClear ? '#DC2626' : '#111',
                fontWeight: isActive ? '600' : '400',
              }}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function InlineSortPanel({ sortChoice, onPick }: { sortChoice: SortChoice; onPick: (opt: (typeof SORT_MENU_OPTIONS)[number]) => void }) {
  return (
    <View
      style={{
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }}
    >
      <SortList sortChoice={sortChoice} onPick={onPick} />
    </View>
  );
}

function InlineColorPanel({
  selectedColor,
  onSelect,
  onReset,
}: {
  selectedColor: string | null;
  onSelect: (c: string | null) => void;
  onReset: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
        paddingVertical: 14,
        paddingLeft: 12,
      }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ flexGrow: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingRight: 12 }}>
          {CATEGORY_INLINE_COLOR_OPTIONS.map(name => (
            <ColorSwatch
              key={name}
              name={name}
              size={28}
              selected={selectedColor === name}
              onPress={() => onSelect(selectedColor === name ? null : name)}
            />
          ))}
          <View style={{ justifyContent: 'center', paddingBottom: 18, marginLeft: 4 }}>
            <ResetPill onPress={onReset} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InlineSizePanel({
  selectedSize,
  onSelect,
  onReset,
}: {
  selectedSize: string | null;
  onSelect: (s: string | null) => void;
  onReset: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
        paddingVertical: 12,
        paddingLeft: 12,
      }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ flexGrow: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 12 }}>
          {CATEGORY_SIZE_OPTIONS.map(size => (
            <SizePill
              key={size}
              label={size}
              selected={selectedSize === size}
              onPress={() => onSelect(selectedSize === size ? null : size)}
            />
          ))}
          <ResetPill onPress={onReset} />
        </View>
      </ScrollView>
    </View>
  );
}

function AllFiltersDrawer({
  visible,
  sortChoice,
  selectedColor,
  selectedSize,
  drawerWidth,
  onClose,
  onSortChange,
  onColorChange,
  onSizeChange,
  onResetAll,
}: {
  visible: boolean;
  sortChoice: SortChoice;
  selectedColor: string | null;
  selectedSize: string | null;
  drawerWidth: number;
  onClose: () => void;
  onSortChange: (c: SortChoice) => void;
  onColorChange: (c: string | null) => void;
  onSizeChange: (s: string | null) => void;
  onResetAll: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View
          style={{
            width: drawerWidth,
            alignSelf: 'stretch',
            backgroundColor: '#FFF',
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 12,
            shadowOffset: { width: 2, height: 0 },
            elevation: 8,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: 14,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>Filters</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close filters" onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color="#111" />
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 4 }}>
                {labelForStoredSort(sortChoice)}
              </Text>
            </View>
            <SortList
              sortChoice={sortChoice}
              onPick={opt => {
                if (opt === 'Clear') onSortChange('Default');
                else onSortChange(opt as SortChoice);
              }}
            />

            <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 }} />

            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111', paddingHorizontal: 16, marginBottom: 12 }}>
              Color
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                rowGap: 10,
                paddingHorizontal: 16,
                paddingBottom: 4,
              }}
            >
              {CATEGORY_COLOR_OPTIONS.map(name => (
                <ColorSwatch
                  key={name}
                  name={name}
                  size={26}
                  compact
                  selected={selectedColor === name}
                  onPress={() => onColorChange(selectedColor === name ? null : name)}
                />
              ))}
            </View>

            <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 }} />

            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111', paddingHorizontal: 16, marginBottom: 12 }}>
              Size
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingBottom: 8 }}>
              {CATEGORY_SIZE_OPTIONS.map(size => (
                <SizePill
                  key={size}
                  label={size}
                  selected={selectedSize === size}
                  onPress={() => onSizeChange(selectedSize === size ? null : size)}
                />
              ))}
            </View>
          </ScrollView>

          <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
            <Pressable accessibilityRole="button" onPress={onResetAll}>
              <View
                style={{
                  paddingVertical: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, color: '#111', fontWeight: '500' }}>Reset All</Text>
              </View>
            </Pressable>
          </View>
        </View>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={onClose} />
      </View>
    </Modal>
  );
}

export function CategoryListingFilters({
  sortChoice,
  selectedColor,
  selectedSize,
  openPanel,
  onOpenPanel,
  onSortChange,
  onColorChange,
  onSizeChange,
  onResetAll,
}: Props) {
  const { width: ww } = useWindowDimensions();
  const drawerWidth = Math.round(ww * 0.8);

  const toggle = (panel: FilterPanelKind) => {
    onOpenPanel(openPanel === panel ? 'none' : panel);
  };

  const colorLabel = selectedColor ? `Color (1)` : 'Color';
  const sizeLabel = selectedSize ? `Size (1)` : 'Size';
  const filtersActive = selectedColor != null || selectedSize != null;

  const pickSort = (opt: (typeof SORT_MENU_OPTIONS)[number]) => {
    if (opt === 'Clear') onSortChange('Default');
    else onSortChange(opt as SortChoice);
    onOpenPanel('none');
  };

  const pickColor = (color: string | null) => {
    onColorChange(color);
    onOpenPanel('none');
  };

  const pickSize = (size: string | null) => {
    onSizeChange(size);
    onOpenPanel('none');
  };

  return (
    <>
      <View style={{ backgroundColor: '#FFF', zIndex: 10, flexGrow: 0 }}>
        <ScrollView
          horizontal
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingTop: 10,
            paddingBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <FilterChip
            label="Filters"
            icon="options-outline"
            active={filtersActive || openPanel === 'all'}
            onPress={() => toggle('all')}
          />
          <FilterChip
            label={labelForStoredSort(sortChoice)}
            showChevron
            active={openPanel === 'sort'}
            onPress={() => toggle('sort')}
          />
          <FilterChip
            label={colorLabel}
            showChevron
            active={openPanel === 'color' || selectedColor != null}
            onPress={() => toggle('color')}
          />
          <FilterChip
            label={sizeLabel}
            showChevron
            active={openPanel === 'size' || selectedSize != null}
            onPress={() => toggle('size')}
          />
        </ScrollView>

        {openPanel === 'sort' ? <InlineSortPanel sortChoice={sortChoice} onPick={pickSort} /> : null}
        {openPanel === 'color' ? (
          <InlineColorPanel selectedColor={selectedColor} onSelect={pickColor} onReset={() => pickColor(null)} />
        ) : null}
        {openPanel === 'size' ? (
          <InlineSizePanel selectedSize={selectedSize} onSelect={pickSize} onReset={() => pickSize(null)} />
        ) : null}
      </View>

      <AllFiltersDrawer
        visible={openPanel === 'all'}
        sortChoice={sortChoice}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        drawerWidth={drawerWidth}
        onClose={() => onOpenPanel('none')}
        onSortChange={onSortChange}
        onColorChange={onColorChange}
        onSizeChange={onSizeChange}
        onResetAll={() => {
          onResetAll();
          onOpenPanel('none');
        }}
      />
    </>
  );
}
