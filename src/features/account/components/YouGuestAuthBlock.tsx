import React from 'react';
import { Dimensions, Platform, Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { colors, radii } from '@app/theme/tokens';

const { width: screenW } = Dimensions.get('window');
const BUTTON_MAX = 300;

/** Matches Flutter `Colors.grey.shade200` */
const ICON_CIRCLE_BG = '#EEEEEE';
/** Matches Flutter `Colors.grey.shade600` for secondary labels */
const SUBTITLE_COLOR = '#757575';

type Props = {
  onPressSignIn: () => void;
};

export function YouGuestAuthBlock({ onPressSignIn }: Props): React.ReactElement {
  const btnWidth = Math.min(BUTTON_MAX, screenW - 32);

  return (
    <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 10 }}>
      <Text style={{ textAlign: 'center', fontSize: 15, fontWeight: '600', color: '#000' }}>
        Sign In For The Best Experience
      </Text>

      <View style={{ paddingHorizontal: 16, paddingVertical: 20, width: '100%' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
          <ColumnCircle
            icon="local-shipping"
            title="Free shipping"
            subtitle="On Limited orders"
          />
          <ColumnCircle
            icon="assignment-return"
            title="Easy returns"
            subtitle="Up to 2 days"
          />
        </View>
      </View>

      <Pressable
        onPress={onPressSignIn}
        style={{
          width: btnWidth,
          height: 38,
          borderRadius: radii.pill,
          backgroundColor: colors.brand,
          alignItems: 'center',
          justifyContent: 'center',
          marginVertical: 4,
        }}
      >
        <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }}>Sign In / Register</Text>
      </Pressable>

      <View style={{ height: 10 }} />
    </View>
  );
}

function ColumnCircle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  subtitle: string;
}): React.ReactElement {
  const textTrim = Platform.OS === 'android' ? ({ includeFontPadding: false } as const) : null;

  return (
    <View style={{ alignItems: 'center', maxWidth: screenW * 0.42 }}>
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: ICON_CIRCLE_BG,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name={icon} color={colors.brand} size={28} />
      </View>
      <Text
        style={[
          { marginTop: 8, fontWeight: '700', fontSize: 14, color: '#000', textAlign: 'center' },
          textTrim,
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          { marginTop: 2, fontSize: 12, color: SUBTITLE_COLOR, textAlign: 'center' },
          textTrim,
        ]}
      >
        {subtitle}
      </Text>
    </View>
  );
}
