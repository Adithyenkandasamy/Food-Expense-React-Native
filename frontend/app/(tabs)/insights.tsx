import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import ListHeading from "@/components/ListHeading";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
    const { subscriptions } = useSubscriptionStore();

    const stats = useMemo(() => {
        const activeSubs = subscriptions.filter(s => s.status === 'active');
        
        // Calculate total monthly spend (normalizing yearly to monthly)
        const monthlySpend = activeSubs.reduce((acc, sub) => {
            const price = sub.price || 0;
            if (sub.billing?.toLowerCase() === 'yearly') {
                return acc + (price / 12);
            }
            return acc + price;
        }, 0);

        // Group by category
        const categoryMap: Record<string, number> = {};
        activeSubs.forEach(sub => {
            const cat = sub.category || 'Other';
            const price = sub.price || 0;
            const monthlyPrice = sub.billing?.toLowerCase() === 'yearly' ? price / 12 : price;
            categoryMap[cat] = (categoryMap[cat] || 0) + monthlyPrice;
        });

        const categoryData = Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Find biggest subscription
        const biggestSub = activeSubs.reduce((prev, current) => {
            if (!prev) return current;
            const prevPrice = prev.billing?.toLowerCase() === 'yearly' ? prev.price / 12 : prev.price || 0;
            const currentPrice = current.billing?.toLowerCase() === 'yearly' ? current.price / 12 : current.price;
            return (currentPrice > prevPrice) ? current : prev;
        }, activeSubs[0]);

        return {
            monthlySpend,
            totalActive: activeSubs.length,
            totalPaused: subscriptions.filter(s => s.status === 'paused').length,
            categoryData,
            biggestSub
        };
    }, [subscriptions]);

    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
                <Text className="text-3xl font-bold text-primary mb-6">Insights</Text>

                {/* Main Stats Card */}
                <View className="bg-primary p-6 rounded-[32px] mb-8 shadow-sm">
                    <Text className="text-white/60 text-lg font-medium mb-1">Estimated Monthly Spend</Text>
                    <Text className="text-white text-5xl font-bold mb-6">
                        {formatCurrency(stats.monthlySpend)}
                    </Text>
                    
                    <View className="flex-row justify-between border-t border-white/10 pt-6">
                        <View>
                            <Text className="text-white/60 text-sm mb-1">Active</Text>
                            <Text className="text-white text-xl font-bold">{stats.totalActive}</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-white/60 text-sm mb-1">Paused</Text>
                            <Text className="text-white text-xl font-bold">{stats.totalPaused}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-white/60 text-sm mb-1">Yearly Est.</Text>
                            <Text className="text-white text-xl font-bold">{formatCurrency(stats.monthlySpend * 12)}</Text>
                        </View>
                    </View>
                </View>

                {/* Biggest Expense */}
                {stats.biggestSub && (
                    <View className="mb-8">
                        <ListHeading title="Top Expense" />
                        <View className="bg-card p-5 rounded-3xl border border-border flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <View className="w-12 h-12 bg-primary/5 rounded-2xl items-center justify-center mr-4">
                                    <Text className="text-2xl font-bold text-primary">{stats.biggestSub.name.charAt(0)}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-primary" numberOfLines={1}>{stats.biggestSub.name}</Text>
                                    <Text className="text-sm text-mutedForeground">{stats.biggestSub.category || stats.biggestSub.plan}</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-lg font-bold text-primary">{formatCurrency(stats.biggestSub.price)}</Text>
                                <Text className="text-xs text-mutedForeground uppercase">{stats.biggestSub.billing}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Spending by Category */}
                <View className="mb-4">
                    <ListHeading title="Spending by Category" />
                    {stats.categoryData.length > 0 ? (
                        stats.categoryData.map((item) => (
                            <View key={item.name} className="mb-6">
                                <View className="flex-row justify-between items-end mb-2">
                                    <Text className="text-base font-semibold text-primary">{item.name}</Text>
                                    <Text className="text-base font-bold text-primary">{formatCurrency(item.value)}/mo</Text>
                                </View>
                                <View className="h-3 w-full bg-muted rounded-full overflow-hidden">
                                    <View 
                                        className="h-full bg-accent" 
                                        style={{ width: `${(item.value / Math.max(stats.monthlySpend, 1)) * 100}%` }}
                                    />
                                </View>
                                <Text className="text-xs text-mutedForeground mt-1 text-right">
                                    {Math.round((item.value / Math.max(stats.monthlySpend, 1)) * 100)}% of total
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text className="text-mutedForeground text-center py-10 italic">
                            Add some active subscriptions to see category insights.
                        </Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Insights;
