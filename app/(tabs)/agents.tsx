import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

export default function AgentsScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-[#0d0d0d] px-6">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-[#241616]">
        <Ionicons name="people-outline" size={30} color="#ef4444" />
      </View>
      <Text className="text-xl font-bold text-white">Find an agent</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-gray-400">
        Connect with local property professionals who can help you find the right place.
      </Text>
    </SafeAreaView>
  );
}
