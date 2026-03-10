import { Tabs } from 'expo-router';
import { Home, User, Ticket } from 'lucide-react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#0A0B12', // root bg
                    borderTopColor: '#171923', // border
                },
                tabBarActiveTintColor: '#00FF8C', // primary
                tabBarInactiveTintColor: '#a1a1aa', // muted-foreground
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Início',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="nfts"
                options={{
                    title: 'Sorteios',
                    tabBarIcon: ({ color }) => <Ticket size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color }) => <User size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
