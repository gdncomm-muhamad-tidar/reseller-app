import { Tabs } from 'expo-router';
import { NavBar } from '../../ui/parts';
import { C } from '../../theme';
import { Dissolve } from '../../ui/Dissolve';

export default function TabsLayout() {
  return (
    <Tabs tabBar={props => <NavBar {...(props as any)} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.bgLow } }}
      screenLayout={({ navigation, children }) => <Dissolve navigation={navigation}>{children}</Dissolve>}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="katalog" />
      <Tabs.Screen name="scan" />
      <Tabs.Screen name="pesanan" />
      <Tabs.Screen name="finansial" />
    </Tabs>
  );
}
