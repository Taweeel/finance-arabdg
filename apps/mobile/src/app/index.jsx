import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, Text } from 'react-native';

export default function Index() {
  const router = useRouter();
  
  useEffect(() => {
    // Navigate to a specific route after a delay
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>ArabDG Finance</Text>
      <Text style={{ marginTop: 10 }}>Loading...</Text>
    </View>
  );
}