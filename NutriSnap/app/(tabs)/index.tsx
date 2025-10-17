import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  Modal,
  Animated,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '@/hooks/use-auth-context';
import { useState, useRef } from 'react';

const { width, height } = Dimensions.get('window');

// Mock data
const MOCK_USER_NAME = 'Henry';
const MOCK_CALORIES = {
  target: 2000,
  consumed: 1247,
  remaining: 753,
};

const MOCK_MACROS = {
  protein: { current: 65, target: 150, color: '#3b82f6' },
  carbs: { current: 180, target: 250, color: '#f97316' },
  fat: { current: 45, target: 67, color: '#a855f7' },
};

const MOCK_FOODS = [
  {
    id: '1',
    name: 'Grilled Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    time: '12:30 PM',
  },
  {
    id: '2',
    name: 'Brown Rice',
    calories: 216,
    protein: 5,
    carbs: 45,
    fat: 1.6,
    time: '12:35 PM',
  },
  {
    id: '3',
    name: 'Oatmeal with Banana',
    calories: 210,
    protein: 7,
    carbs: 38,
    fat: 4,
    time: '8:15 AM',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const [showActionMenu, setShowActionMenu] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get current date
  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  // Calculate calorie progress percentage
  const calorieProgress = (MOCK_CALORIES.consumed / MOCK_CALORIES.target) * 100;
  
  // Determine calorie status color
  const getCalorieColor = () => {
    if (calorieProgress < 80) return '#3ecf8e';
    if (calorieProgress <= 100) return '#f59e0b';
    return '#ef4444';
  };

  // Calculate macro percentage
  const getMacroPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  // Toggle action menu with animation
  const toggleActionMenu = () => {
    if (showActionMenu) {
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start(() => setShowActionMenu(false));
    } else {
      setShowActionMenu(true);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
    }
  };

  return (
    <View style={styles.container}>
      {/* Dark gradient background */}
      <LinearGradient
        colors={['#0a0e1a', '#1a1f2e', '#0f1419']}
        locations={[0, 0.5, 1]}
        style={styles.backgroundGradient}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo and Branding */}
        <View style={styles.header}>
          <View style={styles.brandingSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🥗</Text>
            </View>
            <View style={styles.brandText}>
              <Text style={styles.appTitle}>NutriSnap</Text>
              <Text style={styles.appTagline}>Smart Nutrition Tracking</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>5</Text>
          </TouchableOpacity>
        </View>

        {/* Greeting Card - Glassmorphism */}
        <View style={styles.glassCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.glassGradient}
          >
            <Text style={styles.greeting}>
              {getGreeting()}, {profile?.full_name?.split(' ')[0] || MOCK_USER_NAME}
            </Text>
            <Text style={styles.date}>{getCurrentDate()}</Text>
          </LinearGradient>
        </View>

        {/* Daily Calorie Progress - Glassmorphism Card */}
        <View style={styles.glassCard}>
          <LinearGradient
            colors={['rgba(62, 207, 142, 0.15)', 'rgba(62, 207, 142, 0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glassGradient}
          >
            <View style={styles.calorieHeader}>
              <Text style={styles.calorieLabel}>Daily Goal</Text>
              <View style={styles.percentageBadge}>
                <Text style={styles.percentageText}>{Math.round(calorieProgress)}%</Text>
              </View>
            </View>
            
            <View style={styles.calorieCircleContainer}>
              <View style={styles.calorieCircle}>
                <Text style={styles.calorieRemainingLarge}>{MOCK_CALORIES.remaining}</Text>
                <Text style={styles.calorieUnitSmall}>calories left</Text>
              </View>
            </View>

            <View style={styles.calorieStats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{MOCK_CALORIES.consumed}</Text>
                <Text style={styles.statLabel}>Eaten</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{MOCK_CALORIES.target}</Text>
                <Text style={styles.statLabel}>Target</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Macro Breakdown - Glassmorphism */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleDark}>Macros</Text>
          <View style={styles.macrosGrid}>
            {/* Protein */}
            <View style={styles.glassCard}>
              <LinearGradient
                colors={['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.08)']}
                style={styles.glassGradient}
              >
                <Text style={styles.macroLabelWhite}>Protein</Text>
                <Text style={styles.macroValueLarge}>{MOCK_MACROS.protein.current}g</Text>
                <Text style={styles.macroTarget}>of {MOCK_MACROS.protein.target}g</Text>
                <View style={styles.macroBarDark}>
                  <View 
                    style={[
                      styles.macroBarFillGlow, 
                      { 
                        width: `${getMacroPercentage(MOCK_MACROS.protein.current, MOCK_MACROS.protein.target)}%`,
                        backgroundColor: MOCK_MACROS.protein.color
                      }
                    ]} 
                  />
                </View>
              </LinearGradient>
            </View>

            {/* Carbs */}
            <View style={styles.glassCard}>
              <LinearGradient
                colors={['rgba(249, 115, 22, 0.15)', 'rgba(249, 115, 22, 0.08)']}
                style={styles.glassGradient}
              >
                <Text style={styles.macroLabelWhite}>Carbs</Text>
                <Text style={styles.macroValueLarge}>{MOCK_MACROS.carbs.current}g</Text>
                <Text style={styles.macroTarget}>of {MOCK_MACROS.carbs.target}g</Text>
                <View style={styles.macroBarDark}>
                  <View 
                    style={[
                      styles.macroBarFillGlow, 
                      { 
                        width: `${getMacroPercentage(MOCK_MACROS.carbs.current, MOCK_MACROS.carbs.target)}%`,
                        backgroundColor: MOCK_MACROS.carbs.color
                      }
                    ]} 
                  />
                </View>
              </LinearGradient>
            </View>

            {/* Fat */}
            <View style={styles.glassCard}>
              <LinearGradient
                colors={['rgba(168, 85, 247, 0.15)', 'rgba(168, 85, 247, 0.08)']}
                style={styles.glassGradient}
              >
                <Text style={styles.macroLabelWhite}>Fat</Text>
                <Text style={styles.macroValueLarge}>{MOCK_MACROS.fat.current}g</Text>
                <Text style={styles.macroTarget}>of {MOCK_MACROS.fat.target}g</Text>
                <View style={styles.macroBarDark}>
                  <View 
                    style={[
                      styles.macroBarFillGlow, 
                      { 
                        width: `${getMacroPercentage(MOCK_MACROS.fat.current, MOCK_MACROS.fat.target)}%`,
                        backgroundColor: MOCK_MACROS.fat.color
                      }
                    ]} 
                  />
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>



        {/* Today's Food Log - Glassmorphism */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleDark}>Today's Meals</Text>
            <Text style={styles.mealCountDark}>Logged {MOCK_FOODS.length} meals</Text>
          </View>
          <View style={styles.foodList}>
            {MOCK_FOODS.map((food) => (
              <TouchableOpacity 
                key={food.id}
                style={styles.glassCard}
                onPress={() => Alert.alert(
                  food.name,
                  `Calories: ${food.calories}\nProtein: ${food.protein}g\nCarbs: ${food.carbs}g\nFat: ${food.fat}g\nTime: ${food.time}`
                )}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.glassGradient}
                >
                  <View style={styles.foodMain}>
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodNameDark}>{food.name}</Text>
                      <Text style={styles.foodTimeDark}>{food.time}</Text>
                    </View>
                    <View style={styles.foodCalories}>
                      <Text style={styles.foodCaloriesValueDark}>{food.calories}</Text>
                      <Text style={styles.foodCaloriesLabelDark}>cal</Text>
                    </View>
                  </View>
                  <View style={styles.foodMacros}>
                    <View style={styles.foodMacroItem}>
                      <Text style={styles.foodMacroValueDark}>{food.protein}g</Text>
                      <Text style={styles.foodMacroLabelDark}>Protein</Text>
                    </View>
                    <View style={styles.foodMacroItem}>
                      <Text style={styles.foodMacroValueDark}>{food.carbs}g</Text>
                      <Text style={styles.foodMacroLabelDark}>Carbs</Text>
                    </View>
                    <View style={styles.foodMacroItem}>
                      <Text style={styles.foodMacroValueDark}>{food.fat}g</Text>
                      <Text style={styles.foodMacroLabelDark}>Fat</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Padding for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button with Modal */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={toggleActionMenu}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#3ecf8e', '#2db87a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>{showActionMenu ? '×' : '+'}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Action Menu Modal */}
      <Modal
        visible={showActionMenu}
        transparent
        animationType="none"
        onRequestClose={toggleActionMenu}
      >
        <Pressable style={styles.modalOverlay} onPress={toggleActionMenu}>
          <Animated.View 
            style={[
              styles.actionMenuContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: scaleAnim,
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(26, 31, 46, 0.98)', 'rgba(15, 20, 25, 0.98)']}
              style={styles.actionMenu}
            >
              <Text style={styles.actionMenuTitle}>Add Food</Text>
              
              <TouchableOpacity 
                style={styles.actionMenuItem}
                onPress={() => {
                  toggleActionMenu();
                  Alert.alert('📸 Photo Scan', 'Camera feature coming soon!');
                }}
              >
                <View style={styles.actionMenuIconContainer}>
                  <Text style={styles.actionMenuIcon}>📸</Text>
                </View>
                <View style={styles.actionMenuTextContainer}>
                  <Text style={styles.actionMenuItemText}>Take Photo</Text>
                  <Text style={styles.actionMenuItemSubtext}>Snap & analyze</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionMenuItem}
                onPress={() => {
                  toggleActionMenu();
                  Alert.alert('💬 AI Chat', 'Describe food feature coming soon!');
                }}
              >
                <View style={styles.actionMenuIconContainer}>
                  <Text style={styles.actionMenuIcon}>💬</Text>
                </View>
                <View style={styles.actionMenuTextContainer}>
                  <Text style={styles.actionMenuItemText}>Describe Food</Text>
                  <Text style={styles.actionMenuItemSubtext}>Chat with AI</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionMenuItem}
                onPress={() => {
                  toggleActionMenu();
                  Alert.alert('📊 Barcode', 'Barcode scanner coming soon!');
                }}
              >
                <View style={styles.actionMenuIconContainer}>
                  <Text style={styles.actionMenuIcon}>📊</Text>
                </View>
                <View style={styles.actionMenuTextContainer}>
                  <Text style={styles.actionMenuItemText}>Scan Barcode</Text>
                  <Text style={styles.actionMenuItemSubtext}>Quick lookup</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionMenuItem, styles.actionMenuItemLast]}
                onPress={() => {
                  toggleActionMenu();
                  Alert.alert('✏️ Manual Entry', 'Manual entry coming soon!');
                }}
              >
                <View style={styles.actionMenuIconContainer}>
                  <Text style={styles.actionMenuIcon}>✏️</Text>
                </View>
                <View style={styles.actionMenuTextContainer}>
                  <Text style={styles.actionMenuItemText}>Add Manually</Text>
                  <Text style={styles.actionMenuItemSubtext}>Type it in</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  brandingSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(62, 207, 142, 0.2)',
    borderWidth: 2,
    borderColor: '#3ecf8e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoEmoji: {
    fontSize: 28,
  },
  brandText: {
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  streakEmoji: {
    fontSize: 18,
    marginRight: 4,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  glassCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  glassGradient: {
    padding: 24,
    borderRadius: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  percentageBadge: {
    backgroundColor: 'rgba(62, 207, 142, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(62, 207, 142, 0.3)',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3ecf8e',
  },
  calorieCircleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  calorieCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  calorieRemainingLarge: {
    fontSize: 64,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 70,
  },
  calorieUnitSmall: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  calorieStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  mealCount: {
    fontSize: 14,
    color: '#666',
  },
  macrosContainer: {
    gap: 12,
  },
  macroCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  macroValue: {
    fontSize: 14,
    color: '#666',
  },
  macroBarBackground: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonPrimary: {
    backgroundColor: '#3ecf8e',
  },
  actionButtonSecondary: {
    backgroundColor: '#667eea',
  },
  actionIconContainer: {
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 40,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  actionTextWhite: {
    color: '#fff',
  },
  actionSubtext: {
    fontSize: 12,
    color: '#666',
  },
  actionSubtextWhite: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  foodList: {
    gap: 12,
  },
  foodCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  foodMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  foodTime: {
    fontSize: 12,
    color: '#999',
  },
  foodCalories: {
    alignItems: 'flex-end',
  },
  foodCaloriesValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3ecf8e',
  },
  foodCaloriesLabel: {
    fontSize: 12,
    color: '#666',
  },
  foodMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  foodMacroItem: {
    alignItems: 'center',
  },
  foodMacroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  foodMacroLabel: {
    fontSize: 11,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
})