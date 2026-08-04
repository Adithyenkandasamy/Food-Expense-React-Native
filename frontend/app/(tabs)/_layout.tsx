import { Tabs, Redirect } from 'expo-router';
import { View, Text, Platform } from 'react-native';
import {
    House,
    Receipt,
    Utensils,
    BarChart3,
    User,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import { colors } from '@/constants/theme';

const TAB_CONFIG = [
    { name: 'home', title: 'Home', icon: House },
    { name: 'expenses', title: 'Expenses', icon: Receipt },
    { name: 'meals', title: 'Meals', icon: Utensils },
    { name: 'settlements', title: 'Settle', icon: BarChart3 },
    { name: 'profile', title: 'Profile', icon: User },
] as const;

function TabIcon({
    focused,
    Icon,
    label,
}: {
    focused: boolean;
    Icon: React.ComponentType<any>;
    label: string;
}) {
    return (
        <View className="items-center justify-center gap-0.5 pt-2">
            <View
                className={`w-10 h-8 items-center justify-center rounded-lg ${focused ? 'bg-muted' : ''
                    }`}
            >
                <Icon
                    size={20}
                    color={focused ? colors.primary : colors.mutedForeground}
                    strokeWidth={focused ? 2.5 : 1.5}
                />
            </View>
            <Text
                className={`text-[10px] font-sans-semibold ${focused ? 'text-primary' : 'text-muted-foreground'
                    }`}
            >
                {label}
            </Text>
        </View>
    );
}

export default function TabLayout() {
    const { isSignedIn, isLoaded } = useAuth();
    const insets = useSafeAreaInsets();

    if (!isLoaded) return null;

    if (!isSignedIn) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    height: 64 + insets.bottom,
                    paddingBottom: insets.bottom,
                    elevation: 0,
                    shadowOpacity: 0,
                },
            }}
        >
            {TAB_CONFIG.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon
                                focused={focused}
                                Icon={tab.icon}
                                label={tab.title}
                            />
                        ),
                    }}
                />
            ))}
        </Tabs>
    );
}
