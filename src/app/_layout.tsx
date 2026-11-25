import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { OverlayProvider } from '../ui/overlay';
import { StoreProvider, useStore } from '../store';
import { C } from '../theme';
import { useWebChromeSetup } from '../ui/useWebChrome';
import { Dissolve } from '../ui/Dissolve';
import { MagicFab } from '../ui/MagicFab';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

/** Tapping the "misi tercapai" device notification opens Beranda with the pop up. */
function NotificationRouter() {
  const { setPopup } = useStore();
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = Notifications.addNotificationResponseReceivedListener(res => {
      if (res.notification.request.content.data?.type === 'mission') {
        setPopup(true);
        if (router.canDismiss()) router.dismissAll();
        router.replace('/home');
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- subscribe once
  }, []);
  return null;
}

export default function RootLayout() {
  useWebChromeSetup();
  const [loaded] = useFonts({
    'TTCommons-Regular': require('../../assets/fonts/TTCommons-Regular.ttf'),
    'TTCommons-Medium': require('../../assets/fonts/TTCommons-Medium.ttf'),
    'TTCommons-DemiBold': require('../../assets/fonts/TTCommons-DemiBold.ttf'),
    'TTCommons-Bold': require('../../assets/fonts/TTCommons-Bold.ttf'),
  });
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <OverlayProvider>
          <NotificationRouter />
          <StatusBar style="dark" />
          {/* every page change dissolves (cross-fade) */}
          <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 280, contentStyle: { backgroundColor: C.bgLow } }}
            screenLayout={({ navigation, children }) => <Dissolve navigation={navigation}>{children}</Dissolve>}>
            <Stack.Screen name="diajukan" options={{ gestureEnabled: false }} />
            <Stack.Screen name="scan-camera" options={{ contentStyle: { backgroundColor: '#000' } }} />
            <Stack.Screen name="scan-input" options={{ contentStyle: { backgroundColor: C.bg } }} />
          </Stack>
          {/* testing: jump to any flow */}
          <MagicFab />
        </OverlayProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
