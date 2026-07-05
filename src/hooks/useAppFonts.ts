import {
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  useFonts as useHankenFonts,
} from '@expo-google-fonts/hanken-grotesk';
import {
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts as useManropeFonts,
} from '@expo-google-fonts/manrope';

export function useAppFonts() {
  const [manropeLoaded] = useManropeFonts({
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const [hankenLoaded] = useHankenFonts({
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
  });

  return manropeLoaded && hankenLoaded;
}
