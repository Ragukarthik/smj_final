import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';

interface PriceData {
  goldPrice1g?: string;
  goldPrice8g?: string;
  silverPrice1g?: string;
}

export default function DashboardScreen() {
  const [priceData, setPriceData] = useState<PriceData>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const router = useRouter();

  const fetchPrices = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const response = await fetch(
        'http://smjuthangarai.in/RestApi/restApiPHP.php?option=PriceListToday',
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data) {
        setPriceData({
          goldPrice1g: data.goldPrice1g || data.gold_price_1g || 'N/A',
          goldPrice8g: data.goldPrice8g || data.gold_price_8g || 'N/A', 
          silverPrice1g: data.silverPrice1g || data.silver_price_1g || 'N/A',
        });
        setLastUpdated(new Date());
      } else {
        setError('No price data available');
      }
    } catch (error) {
      console.error('Price fetch error:', error);
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        setError('Network connection error. Please check your internet connection.');
      } else if (error.message.includes('timeout')) {
        setError('Request timeout. Please try again.');
      } else {
        setError('Failed to fetch prices. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    fetchPrices(true);
  }, [fetchPrices]);

  const handleLogout = () => {
    router.push('/login');
  };

  useEffect(() => {
    fetchPrices();

    // Set up auto-refresh every 10 minutes (600,000 ms)
    const interval = setInterval(() => {
      fetchPrices();
    }, 600000);

    return () => clearInterval(interval);
  }, [fetchPrices]);

  const formatDateTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const PriceCard = ({ title, price, unit, icon }: {
    title: string;
    price: string;
    unit: string;
    icon: string;
  }) => (
    <View style={styles.priceCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardContent}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#FFD700" />
        ) : (
          <>
            <Text style={styles.priceText}>₹{price}</Text>
            <Text style={styles.unitText}>per {unit}</Text>
          </>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={styles.headerText}>
            <Text style={styles.welcomeText}>Welcome to SMJ</Text>
            <Text style={styles.subtitleText}>Today's Live Prices</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchPrices()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.pricesContainer}>
        <PriceCard
          title="Gold Price"
          price={priceData.goldPrice1g || '0'}
          unit="1 gram"
          icon="🥇"
        />
        
        <PriceCard
          title="Gold Price"
          price={priceData.goldPrice8g || '0'}
          unit="8 gram"
          icon="🏆"
        />
        
        <PriceCard
          title="Silver Price"
          price={priceData.silverPrice1g || '0'}
          unit="1 gram"
          icon="🥈"
        />
      </View>

      {lastUpdated && (
        <View style={styles.lastUpdatedContainer}>
          <Text style={styles.lastUpdatedText}>
            Last Updated: {formatDateTime(lastUpdated)}
          </Text>
          <Text style={styles.autoRefreshText}>
            • Auto-refresh every 10 minutes
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#FFD700',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogo: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  subtitleText: {
    fontSize: 14,
    color: '#8B0000',
    opacity: 0.8,
  },
  logoutButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    alignItems: 'center',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  pricesContainer: {
    padding: 20,
    gap: 15,
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardContent: {
    alignItems: 'center',
  },
  priceText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 5,
  },
  unitText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  lastUpdatedContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  lastUpdatedText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  autoRefreshText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});