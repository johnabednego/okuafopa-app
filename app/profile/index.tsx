import React, { useContext, useState } from 'react'
import {
  Dimensions,
  StyleSheet,
  View,
  Text
} from 'react-native'
import {
  TabView,
  SceneMap,
  TabBar
} from 'react-native-tab-view'
import { SafeAreaView } from 'react-native-safe-area-context'

import COLORS from '../../src/theme/colors'
import { AuthContext } from '../../src/context/AuthContext'
import BasicInfoTab from '../../src/screens/profile/BasicInfoTab'
import SettingsTab from '../../src/screens/profile/SettingsTab'

const initialLayout = { width: Dimensions.get('window').width }

export default function ProfileScreen() {
  const { user } = useContext(AuthContext)
  const [index, setIndex] = useState(0)
  const [routes] = useState([
    { key: 'info', title: 'Basic Info' },
    { key: 'settings', title: 'Settings' }
  ])

  const renderScene = SceneMap({
    info: BasicInfoTab,
    settings: SettingsTab,
  })

  const CustomTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: COLORS.primary }}
      style={{ backgroundColor: COLORS.white }}
      activeColor={COLORS.primary}
      inactiveColor={COLORS.textLight}
      labelStyle={{ fontSize: 14 }}
      renderLabel={({
        route,
        focused,
        color,
      }: {
        route: { key: string; title: string }
        focused: boolean
        color: string
      }) => (
        <Text
          style={{
            color,
            fontWeight: focused ? 'bold' : 'normal',
          }}
        >
          {route.title}
        </Text>
      )}
    />
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile(<Text style={{ textTransform: 'capitalize' }}>{user?.role})</Text></Text>
        {user && (
          <>
            <Text style={styles.subtitle}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={{ color: COLORS.gray }}>{user.email}</Text>
          </>
        )}
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={props => <CustomTabBar {...props} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight
  },
  title: {
    marginBottom: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text
  }
})
